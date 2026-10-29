import type { Post } from "../types";

export function stripHtml(html: string): string {
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

export function wordCount(html: string): number {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).length : 0;
}

export function readingTime(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 210));
}

export function excerpt(html: string, max = 120): string {
  const text = stripHtml(html);
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export function replyCount(post: Post): number {
  return Number(post.replies?.totalItems ?? 0);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(iso?: string): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** Last `n` month buckets ending at the current month */
export function monthlyBuckets(posts: Post[], n = 6): { label: string; count: number }[] {
  const now = new Date();
  const buckets: { label: string; count: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      count: 0,
    });
  }
  const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1).getTime();
  for (const p of posts) {
    if (!p.published) continue;
    const t = new Date(p.published).getTime();
    if (t < start) continue;
    const d = new Date(p.published);
    const idx = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()) + (n - 1);
    if (idx >= 0 && idx < n) buckets[idx].count++;
  }
  return buckets;
}

export function labelCounts(posts: Post[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const l of p.labels ?? []) map.set(l, (map.get(l) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function normalizeLabels(input: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    const l = raw.trim();
    const key = l.toLowerCase();
    if (l && !seen.has(key)) {
      seen.add(key);
      out.push(l);
    }
  }
  return out.slice(0, 20);
}

export function originLabel(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

export function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
