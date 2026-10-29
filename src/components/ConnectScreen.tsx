import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  ExternalLink,
  FlaskConical,
  KeyRound,
  Link2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../store";
import type { Settings } from "../types";
import { Button, Field, Input } from "./ui";

export default function ConnectScreen() {
  const connect = useApp((s) => s.connect);
  const connecting = useApp((s) => s.connecting);
  const error = useApp((s) => s.connectionError);
  const hint = useApp((s) => s.errorHint);
  const saved = useApp((s) => s.settings);

  const [blog, setBlog] = useState(saved.blogUrl || saved.blogId || "");
  const [apiKey, setApiKey] = useState(saved.apiKey);
  const [token, setToken] = useState(saved.accessToken);
  const [advanced, setAdvanced] = useState(!!saved.accessToken);

  const canSubmit = blog.trim().length > 0 && apiKey.trim().length > 10 && !connecting;

  const submit = () => {
    const settings: Settings = {
      apiKey: apiKey.trim(),
      blogUrl: blog.trim(),
      blogId: /^\d+$/.test(blog.trim()) ? blog.trim() : "",
      accessToken: token.trim(),
      demoMode: false,
    };
    void connect(settings);
  };

  const startDemo = () =>
    void connect({ apiKey: "", blogUrl: "", blogId: "", accessToken: "", demoMode: true });

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-14">
      {/* backdrop */}
      <div className="blueprint absolute inset-0" />
      <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-ember-500/[0.13] blur-[130px]" />
      <div className="absolute bottom-0 left-[12%] h-[300px] w-[420px] rounded-full bg-sky-400/[0.05] blur-[110px]" />

      <motion.div
        className="relative w-full max-w-[480px]"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-ember-500/30 bg-gradient-to-b from-ember-500/25 to-ember-600/10 shadow-[0_0_60px_-12px_rgba(255,107,44,0.5)]">
            <BookOpenText size={26} className="text-ember-400" />
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-white">Fieldpress</h1>
          <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-300">
            A focused control room for your Blogspot publication. Connect with a Google API key and manage every post
            from one calm surface.
          </p>
        </div>

        <div className="rounded-xl border hairline bg-ink-900/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-md sm:p-7">
          <div className="space-y-4">
            <Field label="Blog URL or Blog ID" hint="e.g. myblog.blogspot.com">
              <div className="relative">
                <Link2 size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
                <Input
                  className="pl-9"
                  placeholder="myblog.blogspot.com"
                  value={blog}
                  onChange={(e) => setBlog(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                  autoFocus
                  spellCheck={false}
                />
              </div>
            </Field>

            <Field label="Google API key" hint="Blogger API v3 enabled">
              <div className="relative">
                <KeyRound size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
                <Input
                  className="pl-9 font-mono text-[12px]"
                  placeholder="AIza…"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                  spellCheck={false}
                />
              </div>
            </Field>

            <button
              onClick={() => setAdvanced((v) => !v)}
              className="flex w-full items-center justify-between rounded-md border hairline bg-ink-850/60 px-3 py-2.5 text-[12px] text-ink-300 transition-colors hover:text-ink-100"
            >
              <span className="flex items-center gap-2">
                <LockKeyhole size={13} className="text-ink-400" />
                OAuth access token — unlocks create, edit, publish & delete
              </span>
              <ChevronDown size={14} className={cn("transition-transform", advanced && "rotate-180")} />
            </button>

            <AnimatePresence initial={false}>
              {advanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <Field label="Access token" hint="expires after 60 min">
                    <Input
                      className="font-mono text-[12px]"
                      placeholder="ya29.a0Af…"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      spellCheck={false}
                    />
                  </Field>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-400">
                    Generate one in the{" "}
                    <a
                      href="https://developers.google.com/oauthplayground/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-ember-400 underline decoration-ember-500/40 underline-offset-2 hover:decoration-ember-400"
                    >
                      OAuth 2.0 Playground
                    </a>{" "}
                    using scope <code className="rounded bg-ink-800 px-1 py-0.5 font-mono text-[10.5px]">…/auth/blogger</code>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md border border-red-500/25 bg-red-500/8 px-3.5 py-3"
                >
                  <p className="text-[12.5px] font-medium text-red-300">{error}</p>
                  {hint && <p className="mt-0.5 text-[11.5px] leading-relaxed text-red-300/70">{hint}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <Button variant="primary" className="h-10.5 w-full text-[13.5px]" disabled={!canSubmit} loading={connecting} onClick={submit}>
              {connecting ? "Connecting…" : "Connect blog"}
              {!connecting && <ArrowRight size={15} />}
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/7" />
            <span className="text-[10.5px] font-medium tracking-[0.14em] text-ink-500 uppercase">or</span>
            <div className="h-px flex-1 bg-white/7" />
          </div>

          <button
            onClick={startDemo}
            className="group mt-5 flex w-full items-center gap-3.5 rounded-lg border hairline bg-ink-850/50 px-4 py-3.5 text-left transition-all hover:border-ember-500/35 hover:bg-ink-850"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border hairline bg-ink-800 text-ember-400 transition-colors group-hover:border-ember-500/35">
              <FlaskConical size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white">Explore the demo workspace</p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">
                A seeded blog with drafts, comments and full offline editing.
              </p>
            </div>
            <ArrowRight size={15} className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-ember-400" />
          </button>
        </div>

        {/* footer links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-ink-500">
          <a
            href="https://console.cloud.google.com/apis/library/blogger.googleapis.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-ink-200"
          >
            <Sparkles size={11} /> Get an API key <ExternalLink size={10} />
          </a>
          <a
            href="https://developers.google.com/blogger/docs/3.0/using"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-ink-200"
          >
            <ShieldCheck size={11} /> Blogger API v3 docs <ExternalLink size={10} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
