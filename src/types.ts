export type PostStatus = "LIVE" | "DRAFT" | "SCHEDULED" | "SOFT_TRASHED";

export interface BloggerImage {
  url: string;
}

export interface BloggerAuthor {
  id: string;
  displayName: string;
  url?: string;
  image?: BloggerImage;
}

export interface Blog {
  id: string;
  kind?: string;
  name: string;
  description?: string;
  url: string;
  selfLink?: string;
  published?: string;
  updated?: string;
  posts?: { totalItems: number | string; selfLink?: string };
  pages?: { totalItems: number | string; selfLink?: string };
  locale?: { language?: string; country?: string };
  customMetaData?: string;
}

export interface Post {
  id: string;
  kind?: string;
  blog?: { id: string };
  title: string;
  content?: string;
  url: string;
  selfLink?: string;
  published?: string;
  updated?: string;
  status: PostStatus;
  labels?: string[];
  author?: BloggerAuthor;
  replies?: { totalItems: number | string; selfLink?: string };
  readerComments?: string;
  customMetaData?: string;
  titleLink?: string;
  images?: { url: string }[];
  location?: { name?: string; lat?: number; lng?: number };
  etag?: string;
}

export interface CommentItem {
  id: string;
  kind?: string;
  published?: string;
  updated?: string;
  selfLink?: string;
  content: string;
  status?: string;
  author?: BloggerAuthor;
  post?: { id: string };
  blog?: { id: string };
  inReplyTo?: { id: string };
}

export interface PostListResponse {
  kind?: string;
  items?: Post[];
  nextPageToken?: string;
  etag?: string;
}

export interface CommentListResponse {
  kind?: string;
  items?: CommentItem[];
  nextPageToken?: string;
}

export interface PageListResponse {
  kind?: string;
  items?: { id: string; title: string; status: string }[];
}

export type View = "dashboard" | "posts" | "editor" | "detail";

export interface Settings {
  apiKey: string;
  blogId: string;
  blogUrl: string;
  accessToken: string;
  demoMode: boolean;
}

export interface PostDraft {
  title: string;
  content: string;
  labels: string[];
}

export interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  title: string;
  message?: string;
}
