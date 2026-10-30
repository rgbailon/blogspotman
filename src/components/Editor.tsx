import { motion } from "framer-motion";
import {
  Bold,
  Code2,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  Quote,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../store";
import { normalizeLabels, readingTime, wordCount } from "../lib/utils";
import { Button, IconButton, StatusPill } from "./ui";
import HtmlFrame from "./HtmlFrame";

const DEFAULT_CONTENT = `<p>Start writing…</p>\n<h2>A section heading</h2>\n<p>Everything here is plain HTML — exactly what Blogger stores and renders.</p>`;

export default function Editor() {
  const editingPostId = useApp((s) => s.editingPostId);
  const posts = useApp((s) => s.posts);
  const savePost = useApp((s) => s.savePost);
  const closeEditor = useApp((s) => s.closeEditor);
  const busyIds = useApp((s) => s.busyIds);

  const isNew = editingPostId === "new";
  const post = !isNew ? posts.find((p) => p.id === editingPostId) : undefined;

  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? DEFAULT_CONTENT);
  const [labels, setLabels] = useState<string[]>(post?.labels ?? []);
  const [labelInput, setLabelInput] = useState("");
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState(content);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPreviewHtml(content), 200);
    return () => clearTimeout(t);
  }, [content]);

  const busyKey = isNew ? "new" : String(editingPostId);
  const busy = !!busyIds[busyKey];
  const dirty = useMemo(
    () =>
      title !== (post?.title ?? "") ||
      content !== (post?.content ?? DEFAULT_CONTENT) ||
      JSON.stringify(labels) !== JSON.stringify(post?.labels ?? []),
    [title, content, labels, post]
  );

  // content may arrive asynchronously (single-post fetch in API mode);
  // pull it into local state as long as the user hasn't typed anything yet
  useEffect(() => {
    if (!isNew && post?.content !== undefined && !dirty) {
      setContent(post.content);
      setTitle(post.title);
      setLabels(post.labels ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.content]);

  // Ctrl/Cmd+S → save keeping current visibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, labels, post]);

  async function save(publishIntent: boolean) {
    const draft = { title, content, labels: normalizeLabels(labels) };
    // Existing LIVE post: plain save keeps it live; non-live posts publish on intent
    const publish = publishIntent || (!isNew && post?.status === "LIVE");
    await savePost(draft, publish);
  }

  function insert(kind: string) {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || "text";
    let next = value;
    let cursor = s;
    const replace = (snippet: string, offset: number) => {
      next = value.slice(0, s) + snippet + value.slice(e);
      cursor = s + offset;
    };
    switch (kind) {
      case "bold":
        replace(`<b>${sel}</b>`, 3);
        break;
      case "italic":
        replace(`<em>${sel}</em>`, 4);
        break;
      case "h2":
        replace(`\n<h2>${sel}</h2>\n`, 5);
        break;
      case "quote":
        replace(`\n<blockquote>${sel}</blockquote>\n`, 13);
        break;
      case "code":
        replace(`<code>${sel}</code>`, 6);
        break;
      case "ul":
        replace(`\n<ul>\n  <li>${sel}</li>\n  <li>Another point</li>\n</ul>\n`, 10);
        break;
      case "link": {
        const url = window.prompt("Link URL", "https://");
        if (url) replace(`<a href="${url}">${sel}</a>`, 9 + url.length);
        break;
      }
      case "img": {
        const url = window.prompt("Image URL", "https://");
        if (url) replace(`\n<img src="${url}" alt="${sel}" />\n`, value.length);
        break;
      }
    }
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    });
  }

  function addLabel(raw: string) {
    const next = normalizeLabels([...labels, ...raw.split(",")]);
    setLabels(next);
    setLabelInput("");
  }

  const TOOLS = [
    { icon: Heading2, label: "Heading", run: () => insert("h2") },
    { icon: Bold, label: "Bold", run: () => insert("bold") },
    { icon: Italic, label: "Italic", run: () => insert("italic") },
    { icon: Quote, label: "Quote", run: () => insert("quote") },
    { icon: List, label: "List", run: () => insert("ul") },
    { icon: Code2, label: "Code", run: () => insert("code") },
    { icon: Link2, label: "Link", run: () => insert("link") },
    { icon: Image, label: "Image", run: () => insert("img") },
  ];

  const words = wordCount(content);
  const currentStatus = isNew ? "DRAFT" : (post?.status ?? "DRAFT");

  return (
    <motion.div
      className="mx-auto flex h-full max-w-[1240px] flex-col p-4 lg:p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* header */}
      <div className="flex items-center gap-3 pb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title…"
          autoFocus={isNew}
          className="min-w-0 flex-1 bg-transparent text-[22px] font-bold tracking-[-0.02em] text-white placeholder:text-ink-500 focus:outline-none"
        />
        <StatusPill status={currentStatus} className="shrink-0" />
        {dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" title="Unsaved changes" />}
        <IconButton label="Close editor" onClick={closeEditor} className="shrink-0">
          <X size={16} />
        </IconButton>
      </div>

      {/* mobile tab switch */}
      <div className="mb-3 flex gap-1 rounded-md border hairline bg-ink-900 p-1 lg:hidden">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={cn(
              "flex-1 rounded px-3 py-1.5 text-[12px] font-medium capitalize transition-colors",
              mobileTab === t ? "bg-ink-700 text-white" : "text-ink-400"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* main split */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        {/* source */}
        <div
          className={cn(
            "flex min-h-[300px] flex-col overflow-hidden rounded-lg border hairline bg-ink-900",
            mobileTab !== "write" && "max-lg:hidden"
          )}
        >
          <div className="flex items-center gap-0.5 border-b hairline bg-ink-850/60 px-2.5 py-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.label}
                title={t.label}
                onClick={t.run}
                className="flex h-7 w-7 items-center justify-center rounded text-ink-400 transition-colors hover:bg-ink-700 hover:text-white"
              >
                <t.icon size={13.5} />
              </button>
            ))}
            <span className="ml-auto pr-1 font-mono text-[10px] text-ink-500">HTML</span>
          </div>
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3.5 font-mono text-[12.5px] leading-[1.75] text-ink-100 placeholder:text-ink-600 focus:outline-none"
            placeholder="<p>Your story in HTML…</p>"
          />
          {/* labels */}
          <div className="flex flex-wrap items-center gap-1.5 border-t hairline px-3 py-2.5">
            <span className="text-[10.5px] font-semibold tracking-[0.1em] text-ink-500 uppercase">Labels</span>
            {labels.map((l) => (
              <span
                key={l}
                className="group flex items-center gap-1 rounded-full border hairline bg-ink-800 px-2 py-0.5 text-[11px] text-ink-200"
              >
                {l}
                <button
                  onClick={() => setLabels(labels.filter((x) => x !== l))}
                  className="text-ink-500 transition-colors hover:text-red-300"
                  aria-label={`Remove label ${l}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && labelInput.trim()) {
                  e.preventDefault();
                  addLabel(labelInput);
                }
                if (e.key === "Backspace" && !labelInput && labels.length) setLabels(labels.slice(0, -1));
              }}
              placeholder={labels.length ? "" : "travel, coffee, …"}
              className="min-w-[100px] flex-1 bg-transparent text-[11.5px] text-ink-100 placeholder:text-ink-600 focus:outline-none"
            />
          </div>
        </div>

        {/* preview */}
        <div
          className={cn(
            "flex min-h-[300px] flex-col overflow-hidden rounded-lg border hairline bg-ink-900",
            mobileTab !== "preview" && "max-lg:hidden"
          )}
        >
          <div className="flex items-center justify-between border-b hairline bg-ink-850/60 px-3.5 py-2">
            <span className="text-[10.5px] font-semibold tracking-[0.1em] text-ink-500 uppercase">
              Live preview
            </span>
            <span className="tnum font-mono text-[10px] text-ink-500">
              {words} words · {readingTime(content)} min
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <h1 className="mb-4 text-[21px] font-bold tracking-[-0.02em] text-white">{title || "Untitled"}</h1>
            <HtmlFrame
              html={previewHtml || "<p class='opacity-40'>Nothing to preview yet.</p>"}
              fontSize={13.5}
              minHeight={40}
            />
          </div>
        </div>
      </div>

      {/* footer actions */}
      <div className="flex flex-wrap items-center gap-2 border-t hairline pt-4">
        <p className="mr-auto font-mono text-[10.5px] text-ink-500">
          {isNew ? "New post" : `Editing #${String(editingPostId).slice(0, 10)}`} · ⌘S quick-save
          {dirty && <span className="text-ember-400"> · unsaved changes</span>}
        </p>
        <Button variant="ghost" size="sm" onClick={closeEditor} disabled={busy}>
          Cancel
        </Button>
        {(isNew || currentStatus !== "LIVE") && (
          <Button variant="outline" size="sm" loading={busy} onClick={() => void save(false)}>
            Save as draft
          </Button>
        )}
        <Button variant="primary" size="sm" loading={busy} onClick={() => void save(true)}>
          <Send size={13} />
          {isNew || currentStatus !== "LIVE" ? "Publish" : "Update live post"}
        </Button>
      </div>
    </motion.div>
  );
}
