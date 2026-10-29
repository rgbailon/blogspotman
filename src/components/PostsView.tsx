import { motion } from "framer-motion";
import {
  ExternalLink,
  FileSearch,
  Lock,
  MessageSquare,
  PencilLine,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useApp, useFilteredPosts, type StatusFilter } from "../store";
import { excerpt, formatDate, replyCount, timeAgo } from "../lib/utils";
import { Button, Card, EmptyState, IconButton, StatusPill } from "./ui";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "LIVE", label: "Live" },
  { id: "DRAFT", label: "Drafts" },
  { id: "SCHEDULED", label: "Scheduled" },
];

export default function PostsView() {
  const posts = useFilteredPosts();
  const allPosts = useApp((s) => s.posts);
  const loading = useApp((s) => s.loadingPosts);
  const statusFilter = useApp((s) => s.statusFilter);
  const setStatusFilter = useApp((s) => s.setStatusFilter);
  const labelFilter = useApp((s) => s.labelFilter);
  const setLabelFilter = useApp((s) => s.setLabelFilter);
  const search = useApp((s) => s.search);
  const setSearch = useApp((s) => s.setSearch);
  const openDetail = useApp((s) => s.openDetail);
  const openEditor = useApp((s) => s.openEditor);
  const publishPost = useApp((s) => s.publishPost);
  const setConfirm = useApp((s) => s.setConfirm);
  const busyIds = useApp((s) => s.busyIds);
  const settings = useApp((s) => s.settings);

  const canWrite = settings.demoMode || !!settings.accessToken;
  const countFor = (f: StatusFilter) =>
    f === "ALL" ? allPosts.length : allPosts.filter((p) => p.status === f).length;

  if (loading && allPosts.length === 0) {
    return (
      <div className="space-y-2.5 p-5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-[74px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] p-5 lg:p-7">
      {/* filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-medium transition-all",
              statusFilter === f.id
                ? "border-ember-500/50 bg-ember-500/12 text-ember-300"
                : "hairline bg-ink-900 text-ink-400 hover:text-ink-100"
            )}
          >
            {f.label}
            <span
              className={cn(
                "tnum font-mono text-[10px]",
                statusFilter === f.id ? "text-ember-300/80" : "text-ink-500"
              )}
            >
              {countFor(f.id)}
            </span>
          </button>
        ))}

        {labelFilter && (
          <button
            onClick={() => setLabelFilter(null)}
            className="flex h-8 items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-3 text-[12px] font-medium text-sky-300 transition-colors hover:bg-sky-400/20"
          >
            #{labelFilter} <span aria-hidden>×</span>
          </button>
        )}

        {!canWrite && (
          <button
            onClick={() => useApp.getState().setSettingsOpen(true)}
            className="ml-auto flex h-8 items-center gap-1.5 rounded-full border border-gold-400/25 bg-gold-400/[0.07] px-3 text-[11.5px] font-medium text-gold-400 transition-colors hover:border-gold-400/45"
          >
            <Lock size={11} /> Read-only · unlock publishing
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileSearch size={20} />}
            title={search || labelFilter || statusFilter !== "ALL" ? "Nothing matches" : "No posts yet"}
            message={
              search || labelFilter || statusFilter !== "ALL"
                ? "Try clearing the search or switching filters."
                : canWrite
                  ? "Your blog is a blank page. Write the first post."
                  : "No live posts were returned by the Blogger API. Drafts are only visible with an OAuth token."
            }
            action={
              search || labelFilter || statusFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setLabelFilter(null);
                  }}
                >
                  Clear filters
                </Button>
              ) : canWrite ? (
                <Button variant="primary" size="sm" onClick={() => void openEditor("new")}>
                  Write the first post
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((p, i) => {
            const busy = !!busyIds[p.id];
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card
                  className={cn(
                    "group cursor-pointer px-4.5 py-3.5 transition-all hover:border-white/[0.14] hover:bg-ink-850/80",
                    busy && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-4" onClick={() => void openDetail(p.id)}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white">
                          {p.title || "(untitled)"}
                        </h3>
                        <StatusPill status={p.status} className="shrink-0" />
                      </div>
                      {p.content && (
                        <p className="mt-1 line-clamp-1 text-[12.5px] text-ink-400">{excerpt(p.content, 140)}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-500">
                        <span className="font-mono">{formatDate(p.published ?? p.updated)}</span>
                        <span>· edited {timeAgo(p.updated)}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} /> {replyCount(p)}
                        </span>
                        {(p.labels ?? []).map((l) => (
                          <button
                            key={l}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLabelFilter(l);
                            }}
                            className="text-ink-500 transition-colors hover:text-ember-400"
                          >
                            #{l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* actions */}
                    <div
                      className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canWrite && p.status !== "LIVE" && (
                        <IconButton label="Publish now" onClick={() => void publishPost(p)} disabled={busy}>
                          <Send size={14} className="text-mint-400" />
                        </IconButton>
                      )}
                      {canWrite && (
                        <IconButton label="Edit" onClick={() => void openEditor(p.id)} disabled={busy}>
                          <PencilLine size={14} />
                        </IconButton>
                      )}
                      {canWrite && p.status === "LIVE" && (
                        <IconButton label="Revert to draft" onClick={() => setConfirm({ kind: "revert", post: p })} disabled={busy}>
                          <RotateCcw size={14} />
                        </IconButton>
                      )}
                      <IconButton
                        label="Open original on blog"
                        onClick={() => window.open(p.url, "_blank", "noopener")}
                      >
                        <ExternalLink size={14} />
                      </IconButton>
                      {canWrite && (
                        <IconButton
                          label="Delete"
                          className="hover:bg-red-500/15 hover:text-red-300"
                          onClick={() => setConfirm({ kind: "delete", post: p })}
                          disabled={busy}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
