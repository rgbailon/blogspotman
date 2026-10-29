import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  FileCheck2,
  FilePenLine,
  MessageSquare,
  Newspaper,
  Rss,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useApp } from "../store";
import { formatDate, labelCounts, monthlyBuckets, replyCount, timeAgo } from "../lib/utils";
import { Card, EmptyState, LabelChip, StatusPill } from "./ui";

const stagger = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Dashboard() {
  const posts = useApp((s) => s.posts);
  const blog = useApp((s) => s.blog);
  const loading = useApp((s) => s.loadingPosts);
  const openDetail = useApp((s) => s.openDetail);
  const setView = useApp((s) => s.setView);
  const setLabelFilter = useApp((s) => s.setLabelFilter);
  const settings = useApp((s) => s.settings);

  const live = posts.filter((p) => p.status === "LIVE").length;
  const drafts = posts.filter((p) => p.status === "DRAFT").length;
  const scheduled = posts.filter((p) => p.status === "SCHEDULED").length;
  const comments = posts.reduce((acc, p) => acc + replyCount(p), 0);
  const buckets = monthlyBuckets(posts, 6);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));
  const labels = labelCounts(posts);
  const recent = [...posts].sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? "")).slice(0, 5);
  const canWrite = settings.demoMode || !!settings.accessToken;

  const stats = [
    { icon: FileText, label: "Total posts", value: posts.length, accent: "text-ink-100" },
    { icon: FileCheck2, label: "Published", value: live, accent: "text-mint-400" },
    { icon: FilePenLine, label: "Drafts & queued", value: drafts + scheduled, accent: "text-gold-400" },
    { icon: MessageSquare, label: "Comments", value: comments, accent: "text-sky-400" },
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[104px] rounded-lg" />
        ))}
        <div className="skeleton h-[300px] rounded-lg sm:col-span-2" />
        <div className="skeleton h-[300px] rounded-lg sm:col-span-2" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] p-5 lg:p-7">
      {/* read-only banner */}
      {!canWrite && (
        <motion.div variants={stagger} initial="hidden" animate="show" custom={0}>
          <button
            onClick={() => useApp.getState().setSettingsOpen(true)}
            className="mb-5 flex w-full items-center gap-3 rounded-lg border border-gold-400/20 bg-gold-400/[0.06] px-4 py-3 text-left transition-colors hover:border-gold-400/35"
          >
            <Clock3 size={16} className="shrink-0 text-gold-400" />
            <p className="text-[12.5px] leading-snug text-gold-400/90">
              <span className="font-semibold">Read-only mode.</span> Your API key can read everything. Paste an OAuth
              access token in settings to publish, edit and delete.
            </p>
            <ArrowUpRight size={14} className="ml-auto shrink-0 text-gold-400/70" />
          </button>
        </motion.div>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={stagger} initial="hidden" animate="show" custom={i + 1}>
            <Card className="relative overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium tracking-[0.08em] text-ink-400 uppercase">{s.label}</p>
                <s.icon size={14} className="text-ink-500" />
              </div>
              <p className={cn("tnum mt-2 text-[30px] leading-none font-semibold tracking-[-0.03em]", s.accent)}>
                {s.value}
              </p>
              <div className="pointer-events-none absolute -right-6 -bottom-8 h-20 w-20 rounded-full bg-white/[0.02]" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* middle row: chart + labels */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <motion.div variants={stagger} initial="hidden" animate="show" custom={5} className="lg:col-span-3">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">Publishing cadence</p>
                <p className="mt-0.5 text-[11px] text-ink-500">Posts per month, last 6 months</p>
              </div>
              <Rss size={15} className="text-ink-500" />
            </div>
            <div className="flex flex-1 items-end gap-3" style={{ minHeight: 132 }}>
              {buckets.map((b, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                  <span className="tnum font-mono text-[10px] text-ink-500 opacity-0 transition-opacity group-hover:opacity-100">
                    {b.count}
                  </span>
                  <motion.div
                    className={cn(
                      "w-full max-w-11 rounded-t-[3px]",
                      b.count > 0
                        ? "bg-gradient-to-t from-ember-600/60 to-ember-400"
                        : "bg-ink-700/60"
                    )}
                    initial={{ height: 4 }}
                    animate={{ height: Math.max(4, (b.count / maxBucket) * 120) }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="text-[10px] font-medium text-ink-500">{b.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t hairline pt-3 text-[11px] text-ink-500">
              <span>
                Blog created {formatDate(blog?.published)} · {blog?.pages?.totalItems ?? "—"} pages
              </span>
              <span>Updated {timeAgo(blog?.updated)}</span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" custom={6} className="lg:col-span-2">
          <Card className="flex h-full flex-col p-5">
            <p className="text-[13px] font-semibold text-white">Labels</p>
            <p className="mt-0.5 text-[11px] text-ink-500">Click to filter the post archive</p>
            {labels.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-8 text-[12px] text-ink-500">
                No labels in use yet
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap content-start gap-2">
                {labels.slice(0, 12).map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <LabelChip
                      label={l.label}
                      onClick={() => {
                        setLabelFilter(l.label);
                        setView("posts");
                      }}
                    />
                    <span className="tnum font-mono text-[10px] text-ink-500">{l.count}</span>
                  </span>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* recent */}
      <motion.div variants={stagger} initial="hidden" animate="show" custom={7}>
        <Card className="mt-4">
          <div className="flex items-center justify-between border-b hairline px-5 py-3.5">
            <p className="text-[13px] font-semibold text-white">Recently touched</p>
            <button
              onClick={() => setView("posts")}
              className="flex items-center gap-1 text-[11.5px] font-medium text-ink-400 transition-colors hover:text-ember-400"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={<Newspaper size={20} />}
              title="No posts yet"
              message="Once your blog has posts they'll show up here, freshest first."
            />
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {recent.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => void openDetail(p.id)}
                    className="group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-ink-850/70"
                  >
                    <StatusPill status={p.status} className="shrink-0 max-md:hidden" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-100 group-hover:text-white">
                      {p.title || "(untitled)"}
                    </span>
                    {(p.labels ?? []).slice(0, 2).map((l) => (
                      <span key={l} className="shrink-0 text-[11px] text-ink-500 max-lg:hidden">
                        #{l}
                      </span>
                    ))}
                    <span className="flex shrink-0 items-center gap-1 font-mono text-[10.5px] text-ink-500">
                      <MessageSquare size={11} /> {replyCount(p)}
                    </span>
                    <span className="w-16 shrink-0 text-right font-mono text-[10.5px] text-ink-500">
                      {timeAgo(p.updated)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
