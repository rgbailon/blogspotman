import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock3,
  ExternalLink,
  FileWarning,
  MessageSquare,
  PencilLine,
  RotateCcw,
  Send,
  Trash2,
  Type,
} from "lucide-react";
import { useApp } from "../store";
import { formatDateTime, initials, readingTime, replyCount, timeAgo, wordCount } from "../lib/utils";
import { Button, Card, LabelChip, Spinner, StatusPill } from "./ui";
import HtmlFrame from "./HtmlFrame";

export default function PostDetail() {
  const selectedPostId = useApp((s) => s.selectedPostId);
  const posts = useApp((s) => s.posts);
  const comments = useApp((s) => s.comments);
  const loadingComments = useApp((s) => s.loadingComments);
  const openEditor = useApp((s) => s.openEditor);
  const publishPost = useApp((s) => s.publishPost);
  const setConfirm = useApp((s) => s.setConfirm);
  const busyIds = useApp((s) => s.busyIds);
  const settings = useApp((s) => s.settings);
  const setLabelFilter = useApp((s) => s.setLabelFilter);
  const setView = useApp((s) => s.setView);

  const post = posts.find((p) => p.id === selectedPostId);
  const canWrite = settings.demoMode || !!settings.accessToken;

  if (!post) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <FileWarning size={22} className="text-ink-500" />
        <p className="text-[13px] text-ink-400">This post isn't in the local cache anymore.</p>
        <Button variant="outline" size="sm" onClick={() => setView("posts")}>
          Back to posts
        </Button>
      </div>
    );
  }

  const busy = !!busyIds[post.id];
  const words = post.content ? wordCount(post.content) : 0;

  return (
    <motion.div
      className="mx-auto max-w-[1080px] p-5 lg:p-7"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* main column */}
        <div className="min-w-0">
          <Card className="overflow-hidden">
            <div className="border-b hairline px-6 pt-6 pb-5 sm:px-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusPill status={post.status} />
                {(post.labels ?? []).map((l) => (
                  <LabelChip
                    key={l}
                    label={l}
                    onClick={() => {
                      setLabelFilter(l);
                      setView("posts");
                    }}
                  />
                ))}
              </div>
              <h1 className="text-[24px] leading-[1.2] font-bold tracking-[-0.025em] text-white sm:text-[28px]">
                {post.title || "(untitled)"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-400">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember-500/20 text-[9px] font-bold text-ember-300">
                    {initials(post.author?.displayName)}
                  </span>
                  {post.author?.displayName ?? "Unknown author"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock size={12} /> {formatDateTime(post.published ?? post.updated)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 size={12} /> {post.content ? `${readingTime(post.content)} min read` : "—"}
                </span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-ember-400/90 transition-colors hover:text-ember-300"
                >
                  <ExternalLink size={11} /> View live
                </a>
              </div>
            </div>

            <div className="max-w-[720px] px-6 py-7 sm:px-8">
              {post.content ? (
                <HtmlFrame html={post.content} />
              ) : (
                <p className="text-[13px] text-ink-500 italic">
                  The body wasn't loaded for this post — open it in the editor to fetch the full content.
                </p>
              )}
            </div>
          </Card>

          {/* comments */}
          <Card className="mt-5">
            <div className="flex items-center justify-between border-b hairline px-5 py-3.5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
                <MessageSquare size={14} className="text-ink-400" />
                Comments
                <span className="tnum rounded-full bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">
                  {replyCount(post)}
                </span>
              </p>
              <p className="text-[10.5px] text-ink-500">moderation happens on blogger.com</p>
            </div>
            {loadingComments ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : comments.length === 0 ? (
              <p className="px-5 py-8 text-center text-[12.5px] text-ink-500">
                No comments on this post yet.
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3 px-5 py-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-700 text-[10px] font-bold text-ink-200">
                      {initials(c.author?.displayName)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px]">
                        <span className="font-semibold text-ink-100">{c.author?.displayName ?? "Anonymous"}</span>
                        <span className="ml-2 font-mono text-[10px] text-ink-500">{timeAgo(c.published)}</span>
                      </p>
                      <HtmlFrame html={c.content} fontSize={12.5} minHeight={20} className="mt-1" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* meta column */}
        <div className="space-y-4 lg:sticky lg:top-7 lg:self-start">
          <Card className="p-4">
            <p className="mb-3 text-[10.5px] font-semibold tracking-[0.12em] text-ink-500 uppercase">Actions</p>
            <div className="flex flex-col gap-2">
              {canWrite && post.status !== "LIVE" && (
                <Button variant="primary" size="sm" loading={busy} onClick={() => void publishPost(post)}>
                  <Send size={13} /> Publish now
                </Button>
              )}
              {canWrite && (
                <Button variant="outline" size="sm" onClick={() => void openEditor(post.id)}>
                  <PencilLine size={13} /> Edit post
                </Button>
              )}
              {canWrite && post.status === "LIVE" && (
                <Button variant="outline" size="sm" onClick={() => setConfirm({ kind: "revert", post })} disabled={busy}>
                  <RotateCcw size={13} /> Revert to draft
                </Button>
              )}
              {canWrite && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirm({ kind: "delete", post })}
                  disabled={busy}
                >
                  <Trash2 size={13} /> Delete
                </Button>
              )}
              {!canWrite && (
                <Button variant="outline" size="sm" onClick={() => useApp.getState().setSettingsOpen(true)}>
                  Unlock write actions
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <p className="mb-3 text-[10.5px] font-semibold tracking-[0.12em] text-ink-500 uppercase">Meta</p>
            <dl className="space-y-2.5 text-[12px]">
              {[
                ["Post ID", post.id, true],
                ["Published", formatDateTime(post.published), false],
                ["Updated", formatDateTime(post.updated), false],
                ["Words", post.content ? String(words) : "—", true],
                ["Comments open", post.readerComments === "ALLOW" ? "Yes" : "No", false],
              ].map(([k, v, mono]) => (
                <div key={k as string} className="flex items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-ink-500">{k}</dt>
                  <dd
                    className={
                      mono
                        ? "tnum truncate text-right font-mono text-[11px] text-ink-200"
                        : "truncate text-right text-ink-200"
                    }
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t hairline pt-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] text-ink-500">
                <Type size={10} /> Permalink
              </p>
              <a
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="block truncate font-mono text-[10.5px] text-ember-400/80 transition-colors hover:text-ember-300"
              >
                {post.url}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
