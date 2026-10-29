import { ArrowLeft, Plus, RefreshCw, Search, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useApp } from "../store";
import { timeAgo } from "../lib/utils";
import { Button, IconButton } from "./ui";

const TITLES: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Publication health at a glance" },
  posts: { title: "Posts", sub: "Every story on your blog" },
  detail: { title: "Post detail", sub: "Reading view & comments" },
  editor: { title: "Editor", sub: "Compose and publish" },
};

export default function Topbar() {
  const view = useApp((s) => s.view);
  const search = useApp((s) => s.search);
  const setSearch = useApp((s) => s.setSearch);
  const setView = useApp((s) => s.setView);
  const refresh = useApp((s) => s.refresh);
  const loadingPosts = useApp((s) => s.loadingPosts);
  const lastSync = useApp((s) => s.lastSync);
  const openEditor = useApp((s) => s.openEditor);
  const settings = useApp((s) => s.settings);
  const toast = useApp((s) => s.toast);
  const error = useApp((s) => s.connectionError);

  const inputRef = useRef<HTMLInputElement>(null);
  const canWrite = settings.demoMode || !!settings.accessToken;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setView("posts");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (canWrite) void openEditor("new");
        else toast("info", "Write access is locked", "Add an OAuth token in Settings to draft new posts.");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openEditor, setView, canWrite, toast]);

  const meta = TITLES[view] ?? TITLES.dashboard;

  return (
    <header className="shrink-0">
      <div className="flex h-16 items-center gap-3 border-b hairline px-5">
        {view === "detail" || view === "editor" ? (
          <button
            onClick={() => useApp.getState().backToPosts()}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-white"
          >
            <ArrowLeft size={14} /> Posts
          </button>
        ) : (
          <div>
            <h1 className="text-[15px] leading-tight font-semibold tracking-[-0.01em] text-white">{meta.title}</h1>
            <p className="text-[11px] text-ink-500">{meta.sub}</p>
          </div>
        )}

        <div className="flex-1" />

        {/* search */}
        <div className="relative w-[min(340px,34vw)] max-sm:hidden">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value && view !== "posts" && view !== "editor") setView("posts");
            }}
            placeholder="Search titles or labels…"
            className="h-9 w-full rounded-md border hairline bg-ink-900 pr-14 pl-9 text-[12.5px] text-ink-100 placeholder:text-ink-500 transition-colors focus:border-ember-500/50"
          />
          <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded border hairline bg-ink-800 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-500">
            ⌘K
          </kbd>
        </div>

        <IconButton label="Refresh posts" onClick={() => void refresh()} disabled={loadingPosts}>
          <RefreshCw size={15} className={loadingPosts ? "animate-spin" : ""} />
        </IconButton>

        <Button
          variant="primary"
          size="sm"
          className="h-9"
          title={canWrite ? "Draft a new post (⌘N)" : "Write access requires an OAuth token — open Settings"}
          onClick={() => {
            if (canWrite) void openEditor("new");
            else useApp.getState().setSettingsOpen(true);
          }}
        >
          <Plus size={15} /> <span className="max-sm:hidden">New post</span>
        </Button>
      </div>

      {/* error ribbon */}
      {error && (
        <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/[0.07] px-5 py-2 text-[12px] text-red-300">
          <XCircle size={13} className="shrink-0" />
          <span className="truncate">{error}</span>
          {lastSync && <span className="ml-auto shrink-0 text-red-300/50">last good sync {timeAgo(lastSync)}</span>}
        </div>
      )}
    </header>
  );
}
