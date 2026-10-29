import type {
  Blog,
  CommentItem,
  CommentListResponse,
  Post,
  PostDraft,
  PostListResponse,
} from "../types";

const API = "https://www.googleapis.com/blogger/v3";

export class ApiError extends Error {
  code: number;
  reason: string;
  hint: string;
  constructor(code: number, reason: string, message: string, hint: string) {
    super(message);
    this.code = code;
    this.reason = reason;
    this.hint = hint;
  }
}

async function request<T>(
  path: string,
  opts: {
    key?: string;
    token?: string;
    method?: string;
    body?: unknown;
    params?: Record<string, string | string[] | undefined>;
  } = {}
): Promise<T> {
  const url = new URL(`${API}${path}`);
  if (opts.key) url.searchParams.set("key", opts.key);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
      else url.searchParams.set(k, v);
    }
  }
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "network",
      "Network request failed",
      "Check your internet connection or an ad-blocker blocking googleapis.com."
    );
  }

  if (!res.ok) {
    let reason = "";
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      reason = data?.error?.errors?.[0]?.reason ?? "";
      message = data?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, reason, message, hintFor(res.status, reason));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function hintFor(code: number, reason: string): string {
  if (reason === "keyInvalid" || (code === 400 && reason.includes("key")))
    return "This API key is invalid. Double-check it in Google Cloud Console → Credentials.";
  if (code === 403 && reason === "dailyLimitExceeded")
    return "The API quota for this key is exhausted. Enable the Blogger API quota or try tomorrow.";
  if (code === 403)
    return "Write operations on the Blogger API require OAuth 2.0 — paste an access token in Settings to unlock publishing.";
  if (code === 401)
    return "OAuth tokens expire after 1 hour. Mint a fresh one in the OAuth 2.0 Playground (scope …/auth/blogger) and paste it in Settings.";
  if (code === 404)
    return "Blog or post not found. Check the Blog ID (Settings → Basics in Blogger) or the blog URL.";
  if (code === 429) return "Rate limited by Google — wait a few seconds and retry.";
  return "See the Blogger API v3 docs for details on this error.";
}

/** Accepts a raw blog URL, blogspot subdomain, or numeric ID and returns a numeric ID */
export function parseBlogIdentifier(input: string): { kind: "id" | "url"; value: string } {
  const v = input.trim();
  if (/^\d+$/.test(v)) return { kind: "id", value: v };
  let url = v;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return { kind: "url", value: url };
}

export async function getBlog(idOrUrl: string, key: string): Promise<Blog> {
  const ident = parseBlogIdentifier(idOrUrl);
  if (ident.kind === "id") return request<Blog>(`/blogs/${ident.value}`, { key });
  return request<Blog>("/blogs/byurl", { key, params: { url: ident.value } });
}

const ALL_STATUSES = ["LIVE", "DRAFT", "SCHEDULED"];

export async function listPosts(
  blogId: string,
  key: string,
  token?: string,
  opts: { withBodies?: boolean; maxPages?: number } = {}
): Promise<Post[]> {
  const out: Post[] = [];
  let pageToken: string | undefined;
  let pages = 0;
  do {
    const data: PostListResponse = await request<PostListResponse>(`/blogs/${blogId}/posts`, {
      key,
      token,
      params: {
        fetchBodies: String(opts.withBodies ?? true),
        fetchImages: "true",
        maxResults: "50",
        orderBy: "published",
        status: token ? ALL_STATUSES : ["LIVE"],
        view: token ? "AUTHOR" : undefined,
        pageToken,
      },
    });
    out.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
    pages++;
  } while (pageToken && pages < (opts.maxPages ?? 10));
  return out;
}

export async function getPost(blogId: string, postId: string, key: string, token?: string): Promise<Post> {
  return request<Post>(`/blogs/${blogId}/posts/${postId}`, {
    key,
    token,
    params: { view: token ? "AUTHOR" : undefined },
  });
}

export async function listComments(blogId: string, postId: string, key: string): Promise<CommentItem[]> {
  const data = await request<CommentListResponse>(`/blogs/${blogId}/posts/${postId}/comments`, {
    key,
    params: { maxResults: "100", fetchBodies: "true" },
  });
  return data.items ?? [];
}

export async function createPost(blogId: string, token: string, draft: PostDraft, isDraft: boolean): Promise<Post> {
  return request<Post>(`/blogs/${blogId}/posts/`, {
    token,
    method: "POST",
    params: { isDraft: String(isDraft) },
    body: {
      kind: "blogger#post",
      blog: { id: blogId },
      title: draft.title,
      content: draft.content,
      labels: draft.labels,
    },
  });
}

export async function updatePost(blogId: string, token: string, postId: string, draft: PostDraft): Promise<Post> {
  return request<Post>(`/blogs/${blogId}/posts/${postId}/`, {
    token,
    method: "PUT",
    body: {
      kind: "blogger#post",
      blog: { id: blogId },
      title: draft.title,
      content: draft.content,
      labels: draft.labels,
    },
  });
}

export async function publishPost(blogId: string, token: string, postId: string): Promise<Post> {
  return request<Post>(`/blogs/${blogId}/posts/${postId}/publish`, { token, method: "POST" });
}

export async function revertPost(blogId: string, token: string, postId: string): Promise<Post> {
  return request<Post>(`/blogs/${blogId}/posts/${postId}/revert`, { token, method: "POST" });
}

export async function deletePost(blogId: string, token: string, postId: string): Promise<void> {
  return request<void>(`/blogs/${blogId}/posts/${postId}/`, { token, method: "DELETE" });
}
