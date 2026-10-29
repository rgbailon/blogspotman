import { create } from "zustand";
import * as api from "./lib/api";
import { ApiError } from "./lib/api";
import { demoClient } from "./lib/demo";
import type { Blog, CommentItem, Post, PostDraft, Settings, Toast, View } from "./types";

const SETTINGS_KEY = "fieldpress.settings.v1";

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  blogId: "",
  blogUrl: "",
  accessToken: "",
  demoMode: false,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

export type StatusFilter = "ALL" | "LIVE" | "DRAFT" | "SCHEDULED";
export type ConfirmKind = "delete" | "revert";

interface ConfirmState {
  kind: ConfirmKind;
  post: Post;
}

interface AppState {
  settings: Settings;
  connected: boolean;
  connecting: boolean;
  connectionError: string | null;
  errorHint: string | null;

  blog: Blog | null;
  posts: Post[];
  loadingPosts: boolean;
  lastSync: string | null;

  view: View;
  selectedPostId: string | null;
  editingPostId: string | "new" | null;

  search: string;
  statusFilter: StatusFilter;
  labelFilter: string | null;
  settingsOpen: boolean;
  confirm: ConfirmState | null;
  busyIds: Record<string, boolean>;

  comments: CommentItem[];
  loadingComments: boolean;

  toasts: Toast[];

  // actions
  saveSettings: (s: Partial<Settings>) => void;
  connect: (s: Settings) => Promise<boolean>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  setView: (v: View) => void;
  setSearch: (q: string) => void;
  setStatusFilter: (s: StatusFilter) => void;
  setLabelFilter: (l: string | null) => void;
  setSettingsOpen: (open: boolean) => void;
  setConfirm: (c: ConfirmState | null) => void;

  openDetail: (postId: string) => Promise<void>;
  openEditor: (postId: string | "new") => Promise<void>;
  closeEditor: () => void;
  backToPosts: () => void;

  savePost: (draft: PostDraft, publish: boolean) => Promise<boolean>;
  publishPost: (post: Post) => Promise<void>;
  revertPost: (post: Post) => Promise<void>;
  deletePost: (post: Post) => Promise<void>;

  toast: (kind: Toast["kind"], title: string, message?: string) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useApp = create<AppState>((set, get) => {
  const { settings: s } = getArgs();
  const client = () => {
    const { settings } = get();
    return {
      demo: settings.demoMode,
      key: settings.apiKey.trim(),
      token: settings.accessToken.trim() || undefined,
      blogId: settings.blogId.trim(),
      blogUrl: settings.blogUrl.trim(),
    };
  };

  const applyPosts = (posts: Post[]) => {
    posts.sort((a, b) => (b.published ?? b.updated ?? "").localeCompare(a.published ?? a.updated ?? ""));
    set({ posts, loadingPosts: false, lastSync: new Date().toISOString(), connectionError: null, errorHint: null });
  };

  async function fetchPosts() {
    const c = client();
    set({ loadingPosts: true });
    try {
      const posts = c.demo
        ? await demoClient.listPosts()
        : await api.listPosts(c.blogId, c.key, c.token, { withBodies: true });
      applyPosts(posts);
    } catch (e) {
      // Expired/invalid OAuth token shouldn't kill reading — drop it and retry with the API key alone.
      if (!c.demo && c.token && e instanceof ApiError && e.code === 401) {
        try {
          const posts = await api.listPosts(c.blogId, c.key, undefined, { withBodies: true });
          get().saveSettings({ accessToken: "" });
          applyPosts(posts);
          get().toast(
            "info",
            "Access token wasn't accepted",
            "It likely expired (they last 1 hour). You're back in read-only mode — paste a fresh token in Settings to resume publishing."
          );
          return;
        } catch (e2) {
          e = e2;
        }
      }
      handleError(e, set, "Couldn't load posts");
      set({ loadingPosts: false });
    }
  }

  return {
    settings: s,
    connected: false,
    connecting: false,
    connectionError: null,
    errorHint: null,
    blog: null,
    posts: [],
    loadingPosts: false,
    lastSync: null,
    view: "dashboard",
    selectedPostId: null,
    editingPostId: null,
    search: "",
    statusFilter: "ALL",
    labelFilter: null,
    settingsOpen: false,
    confirm: null,
    busyIds: {},
    comments: [],
    loadingComments: false,
    toasts: [],

    saveSettings: (partial) => {
      const next = { ...get().settings, ...partial };
      set({ settings: next });
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* storage denied */
      }
    },

    connect: async (next) => {
      get().saveSettings(next);
      set({ connecting: true, connectionError: null, errorHint: null });
      try {
        const c = client();
        const blog = c.demo ? await demoClient.getBlog() : await api.getBlog(c.blogId || c.blogUrl, c.key);
        set({ blog, connected: true, connecting: false });
        get().saveSettings({ blogId: blog.id });
        await fetchPosts();
        const writeable = c.demo || !!c.token;
        get().toast(
          "success",
          `Connected to ${blog.name}`,
          writeable ? "Full write access enabled." : "Read-only via API key — add an OAuth token for write access."
        );
        return true;
      } catch (e) {
        set({ connected: false, connecting: false });
        handleError(e, set, "Connection failed");
        return false;
      }
    },

    disconnect: () => {
      try {
        localStorage.removeItem(SETTINGS_KEY);
      } catch {
        /* ignore */
      }
      set({
        settings: DEFAULT_SETTINGS,
        connected: false,
        blog: null,
        posts: [],
        view: "dashboard",
        selectedPostId: null,
        editingPostId: null,
        comments: [],
        search: "",
        statusFilter: "ALL",
        labelFilter: null,
        connectionError: null,
        errorHint: null,
      });
    },

    refresh: fetchPosts,

    setView: (view) => set({ view }),
    setSearch: (search) => set({ search }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setLabelFilter: (labelFilter) => set({ labelFilter }),
    setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
    setConfirm: (confirm) => set({ confirm }),

    openDetail: async (postId) => {
      set({ selectedPostId: postId, view: "detail", loadingComments: true, comments: [] });
      const c = client();
      try {
        // Refresh the single post to get fresh content + counters
        const fresh = c.demo
          ? get().posts.find((p) => p.id === postId) ?? null
          : await api.getPost(c.blogId, postId, c.key, c.token);
        if (fresh) {
          set({ posts: get().posts.map((p) => (p.id === postId ? { ...p, ...fresh } : p)) });
        }
      } catch {
        /* fall back to cached data */
      }
      try {
        const comments = c.demo ? await demoClient.listComments(postId) : await api.listComments(c.blogId, postId, c.key);
        set({ comments, loadingComments: false });
      } catch {
        set({ comments: [], loadingComments: false });
      }
    },

    openEditor: async (postId) => {
      set({ editingPostId: postId, view: "editor" });
      if (postId !== "new") {
        const existing = get().posts.find((p) => p.id === postId);
        if (!existing || existing.content === undefined) {
          const c = client();
          try {
            if (!c.demo) {
              const fresh = await api.getPost(c.blogId, postId, c.key, c.token);
              set({ posts: get().posts.map((p) => (p.id === postId ? { ...p, ...fresh } : p)) });
            }
          } catch (e) {
            handleError(e, set, "Couldn't load the post body");
          }
        }
      }
    },

    closeEditor: () => set({ editingPostId: null, view: get().selectedPostId ? "detail" : "posts" }),
    backToPosts: () => set({ view: "posts", selectedPostId: null }),

    savePost: async (draft, publish) => {
      const c = client();
      const editing = get().editingPostId;
      if (!c.demo && !c.token) {
        get().toast("error", "Write access is locked", "Add an OAuth access token in Settings to create or edit posts.");
        return false;
      }
      if (!draft.title.trim()) {
        get().toast("error", "Title is required", "Give the post a title before saving.");
        return false;
      }
      const busyKey = editing === "new" ? "new" : String(editing);
      set({ busyIds: { ...get().busyIds, [busyKey]: true } });
      try {
        let saved: Post;
        if (editing === "new") {
          saved = c.demo
            ? await demoClient.createPost(c.blogId, "", draft, !publish)
            : await api.createPost(c.blogId, c.token!, draft, !publish);
          set({ posts: [saved, ...get().posts] });
        } else {
          const id = String(editing);
          saved = c.demo
            ? await demoClient.updatePost(c.blogId, "", id, draft)
            : await api.updatePost(c.blogId, c.token!, id, draft);
          // publishing an existing draft/scheduled post
          if (publish && saved.status !== "LIVE") {
            saved = c.demo
              ? await demoClient.publishPost(c.blogId, "", id)
              : await api.publishPost(c.blogId, c.token!, id);
          }
          saved = { ...saved, content: draft.content };
          set({ posts: get().posts.map((p) => (p.id === id ? { ...p, ...saved } : p)) });
        }
        set({ busyIds: { ...get().busyIds, [busyKey]: false } });
        get().toast(
          "success",
          editing === "new" ? (publish ? "Post published" : "Draft saved") : "Post updated",
          saved.status === "DRAFT" ? "Stored as a draft on your blog." : `Live at ${saved.url}`
        );
        set({ editingPostId: null, view: "posts" });
        return true;
      } catch (e) {
        set({ busyIds: { ...get().busyIds, [busyKey]: false } });
        handleError(e, set, "Save failed");
        return false;
      }
    },

    publishPost: async (post) => {
      const c = client();
      if (!c.demo && !c.token) {
        get().toast("error", "Write access is locked", "Add an OAuth access token in Settings to publish posts.");
        return;
      }
      set({ busyIds: { ...get().busyIds, [post.id]: true } });
      try {
        const saved = c.demo
          ? await demoClient.publishPost(c.blogId, "", post.id)
          : await api.publishPost(c.blogId, c.token!, post.id);
        set({
          posts: get().posts.map((p) => (p.id === post.id ? { ...p, ...saved, content: p.content } : p)),
          busyIds: { ...get().busyIds, [post.id]: false },
        });
        get().toast("success", "Post is live", post.title);
      } catch (e) {
        set({ busyIds: { ...get().busyIds, [post.id]: false } });
        handleError(e, set, "Publish failed");
      }
    },

    revertPost: async (post) => {
      const c = client();
      if (!c.demo && !c.token) {
        get().toast("error", "Write access is locked", "Add an OAuth access token in Settings to manage posts.");
        return;
      }
      set({ busyIds: { ...get().busyIds, [post.id]: true }, confirm: null });
      try {
        const saved = c.demo
          ? await demoClient.revertPost(c.blogId, "", post.id)
          : await api.revertPost(c.blogId, c.token!, post.id);
        set({
          posts: get().posts.map((p) => (p.id === post.id ? { ...p, ...saved, content: p.content } : p)),
          busyIds: { ...get().busyIds, [post.id]: false },
        });
        get().toast("info", "Reverted to draft", post.title);
      } catch (e) {
        set({ busyIds: { ...get().busyIds, [post.id]: false } });
        handleError(e, set, "Revert failed");
      }
    },

    deletePost: async (post) => {
      const c = client();
      if (!c.demo && !c.token) {
        get().toast("error", "Write access is locked", "Add an OAuth access token in Settings to delete posts.");
        return;
      }
      set({ busyIds: { ...get().busyIds, [post.id]: true }, confirm: null });
      try {
        if (c.demo) await demoClient.deletePost(c.blogId, "", post.id);
        else await api.deletePost(c.blogId, c.token!, post.id);
        set({
          posts: get().posts.filter((p) => p.id !== post.id),
          busyIds: { ...get().busyIds, [post.id]: false },
          view: get().selectedPostId === post.id ? "posts" : get().view,
          selectedPostId: get().selectedPostId === post.id ? null : get().selectedPostId,
        });
        get().toast("success", "Post deleted", `"${post.title}" was moved to trash.`);
      } catch (e) {
        set({ busyIds: { ...get().busyIds, [post.id]: false } });
        handleError(e, set, "Delete failed");
      }
    },

    toast: (kind, title, message) => {
      const id = ++toastId;
      set({ toasts: [...get().toasts, { id, kind, title, message }] });
      window.setTimeout(() => get().dismissToast(id), 5200);
    },
    dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  };
});

function getArgs() {
  return { settings: loadSettings() };
}

function handleError(e: unknown, set: (partial: Partial<AppState>) => void, fallback: string) {
  if (e instanceof ApiError) {
    set({ connectionError: e.message, errorHint: e.hint });
    useApp.getState().toast("error", fallback, `${e.message} — ${e.hint}`);
  } else {
    const msg = e instanceof Error ? e.message : "Unknown error";
    useApp.getState().toast("error", fallback, msg);
  }
}

/** Derive the visible post list for filters/search */
export function useFilteredPosts(): Post[] {
  const posts = useApp((s) => s.posts);
  const search = useApp((s) => s.search).trim().toLowerCase();
  const status = useApp((s) => s.statusFilter);
  const label = useApp((s) => s.labelFilter);
  return posts.filter((p) => {
    if (status !== "ALL" && p.status !== status) return false;
    if (label && !(p.labels ?? []).some((l) => l.toLowerCase() === label.toLowerCase())) return false;
    if (search) {
      const hay = `${p.title} ${(p.labels ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}
