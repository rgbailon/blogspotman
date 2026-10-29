import { ExternalLink, KeyRound, Link2, LockKeyhole, PlugZap, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../store";
import { Button, Field, IconButton, Input, Modal } from "./ui";

export default function SettingsModal() {
  const open = useApp((s) => s.settingsOpen);
  const setOpen = useApp((s) => s.setSettingsOpen);
  const settings = useApp((s) => s.settings);
  const connect = useApp((s) => s.connect);
  const connecting = useApp((s) => s.connecting);
  const disconnect = useApp((s) => s.disconnect);

  const [blog, setBlog] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [token, setToken] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // hydrate fields when the modal opens
  if (open && !hydrated) {
    setBlog(settings.demoMode ? "" : settings.blogUrl || settings.blogId);
    setApiKey(settings.apiKey);
    setToken(settings.accessToken);
    setHydrated(true);
  }
  if (!open && hydrated) setHydrated(false);

  const submit = async () => {
    const ok = await connect({
      apiKey: apiKey.trim(),
      blogUrl: blog.trim(),
      blogId: /^\d+$/.test(blog.trim()) ? blog.trim() : "",
      accessToken: token.trim(),
      demoMode: false,
    });
    if (ok) setOpen(false);
    // keep modal open on failure; toast explains why
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} width={600}>
      <div className="flex items-center justify-between border-b hairline px-6 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Connection settings</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-400">
            Stored only in this browser's localStorage — nothing leaves your machine except calls to Google.
          </p>
        </div>
        <IconButton label="Close" onClick={() => setOpen(false)}>
          <X size={15} />
        </IconButton>
      </div>

      <div className="grid gap-5 px-6 py-5 sm:grid-cols-[1fr_230px]">
        {/* form */}
        <div className="space-y-4">
          <Field label="Blog URL or Blog ID">
            <div className="relative">
              <Link2 size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
              <Input
                className="pl-9"
                placeholder="myblog.blogspot.com"
                value={blog}
                onChange={(e) => setBlog(e.target.value)}
                spellCheck={false}
              />
            </div>
          </Field>
          <Field label="API key">
            <div className="relative">
              <KeyRound size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
              <Input
                className="pl-9 font-mono text-[12px]"
                placeholder="AIza…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                spellCheck={false}
              />
            </div>
          </Field>
          <Field label="OAuth access token" hint="optional · enables writes">
            <div className="relative">
              <LockKeyhole size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
              <Input
                className="pl-9 font-mono text-[12px]"
                placeholder="ya29.a0Af…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                spellCheck={false}
              />
            </div>
          </Field>

          <div className="flex items-center gap-2 pt-1">
            <Button variant="primary" loading={connecting} onClick={() => void submit()}>
              <PlugZap size={14} /> Test & reconnect
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
            >
              <Trash2 size={13} /> Disconnect
            </Button>
          </div>
        </div>

        {/* guidance */}
        <div className="rounded-lg border hairline bg-ink-850/50 p-4">
          <p className="mb-3 text-[10.5px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
            How to get these
          </p>
          <ol className="space-y-3 text-[11.5px] leading-relaxed text-ink-300">
            <li>
              <span className="font-semibold text-ink-100">1. API key</span>
              <br />
              Google Cloud Console → enable <em>Blogger API v3</em> → Credentials → Create API key.{" "}
              <a
                href="https://console.cloud.google.com/apis/library/blogger.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-ember-400"
              >
                Open <ExternalLink size={9} />
              </a>
            </li>
            <li>
              <span className="font-semibold text-ink-100">2. Blog ID</span>
              <br />
              blogger.com → Settings → Basic. Or just paste your blog's URL above — we'll resolve it.
            </li>
            <li>
              <span className="font-semibold text-ink-100">3. OAuth token</span>
              <br />
              OAuth 2.0 Playground → authorize scope{" "}
              <code className="rounded bg-ink-800 px-1 font-mono text-[10px]">…/auth/blogger</code> → exchange for a
              token. Valid for 1 hour.{" "}
              <a
                href="https://developers.google.com/oauthplayground/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-ember-400"
              >
                Open <ExternalLink size={9} />
              </a>
            </li>
          </ol>
        </div>
      </div>
    </Modal>
  );
}
