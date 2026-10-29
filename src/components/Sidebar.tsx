import { BookOpenText, FileText, FlaskConical, LayoutDashboard, LogOut, Settings2 } from "lucide-react";
import { cn } from "../utils/cn";
import { useApp } from "../store";
import { originLabel } from "../lib/utils";

const NAV = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "posts" as const, label: "Posts", icon: FileText },
];

export default function Sidebar() {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const blog = useApp((s) => s.blog);
  const posts = useApp((s) => s.posts);
  const settings = useApp((s) => s.settings);
  const setSettingsOpen = useApp((s) => s.setSettingsOpen);
  const disconnect = useApp((s) => s.disconnect);

  const drafts = posts.filter((p) => p.status === "DRAFT").length;
  const canWrite = settings.demoMode || !!settings.accessToken;

  return (
    <aside className="flex h-full w-[228px] shrink-0 flex-col border-r hairline bg-ink-900/60">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ember-500/30 bg-gradient-to-b from-ember-500/25 to-ember-600/10">
          <BookOpenText size={15} className="text-ember-400" />
        </div>
        <span className="text-[14.5px] font-semibold tracking-[-0.02em] text-white">Fieldpress</span>
        {settings.demoMode && (
          <span className="ml-auto flex items-center gap-1 rounded-full border border-gold-400/25 bg-gold-400/10 px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider text-gold-400 uppercase">
            <FlaskConical size={9} /> Demo
          </span>
        )}
      </div>

      {/* blog identity */}
      {blog && (
        <div className="mx-3 mb-4 rounded-lg border hairline bg-ink-850/70 px-3 py-2.5">
          <p className="truncate text-[13px] font-semibold text-white">{blog.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10.5px] text-ink-500">{originLabel(blog.url)}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", canWrite ? "bg-mint-400 pulse-dot" : "bg-gold-400")} />
            <span className="text-[10.5px] font-medium text-ink-400">
              {canWrite ? "Read & write" : "Read-only · API key"}
            </span>
          </div>
        </div>
      )}

      {/* nav */}
      <nav className="flex flex-col gap-0.5 px-3">
        <p className="px-2 pt-1 pb-2 text-[10px] font-semibold tracking-[0.14em] text-ink-500 uppercase">Manage</p>
        {NAV.map((item) => {
          const active =
            view === item.id || (item.id === "posts" && (view === "detail" || view === "editor"));
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-all",
                active
                  ? "bg-ink-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-ink-400 hover:bg-ink-850 hover:text-ink-100"
              )}
            >
              <item.icon size={15} className={cn(active ? "text-ember-400" : "text-ink-500 group-hover:text-ink-300")} />
              {item.label}
              {item.id === "posts" && (
                <span className="tnum ml-auto rounded-full bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">
                  {posts.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* draft nudge */}
      {drafts > 0 && (
        <button
          onClick={() => {
            useApp.getState().setStatusFilter("DRAFT");
            setView("posts");
          }}
          className="mx-3 mt-4 rounded-lg border border-gold-400/15 bg-gold-400/[0.05] px-3 py-2.5 text-left transition-colors hover:border-gold-400/30 hover:bg-gold-400/[0.09]"
        >
          <p className="tnum text-[11px] font-semibold text-gold-400">
            {drafts} draft{drafts === 1 ? "" : "s"} waiting
          </p>
          <p className="mt-0.5 text-[10.5px] text-ink-500">Pick up where you left off</p>
        </button>
      )}

      {/* bottom */}
      <div className="mt-auto flex flex-col gap-0.5 border-t hairline px-3 py-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-ink-400 transition-colors hover:bg-ink-850 hover:text-ink-100"
        >
          <Settings2 size={15} className="text-ink-500" />
          Connection settings
        </button>
        <button
          onClick={disconnect}
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-ink-400 transition-colors hover:bg-ink-850 hover:text-red-300"
        >
          <LogOut size={15} className="text-ink-500" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
