import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";

const POST_CSS = `
.post-content { font-size: 1rem; line-height: 1.75; color: #e8e8ec; overflow-wrap: anywhere; }
.post-content p { margin: 0 0 1.15em; }
.post-content h1, .post-content h2, .post-content h3, .post-content h4 { color: #fff; font-weight: 650; letter-spacing: -0.02em; margin: 1.6em 0 0.6em; line-height: 1.3; }
.post-content h2 { font-size: 1.375rem; }
.post-content h3 { font-size: 1.125rem; }
.post-content a { color: #ff9252; text-decoration: underline; text-decoration-color: rgba(255,146,82,0.4); text-underline-offset: 3px; }
.post-content a:hover { text-decoration-color: #ff9252; }
.post-content ul, .post-content ol { margin: 0 0 1.15em; padding-left: 1.4em; }
.post-content ul { list-style: disc; }
.post-content ol { list-style: decimal; }
.post-content li { margin: 0.35em 0; }
.post-content blockquote { border-left: 2px solid #ff6b2c; padding: 0.1em 0 0.1em 1.1em; margin: 1.4em 0; color: #9b9ba8; font-style: italic; }
.post-content img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin: 1.2em 0; }
.post-content pre { background: #141418; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px 16px; overflow-x: auto; font-family: "JetBrains Mono", Menlo, monospace; font-size: 0.8125rem; line-height: 1.6; margin: 1.2em 0; }
.post-content code { font-family: "JetBrains Mono", Menlo, monospace; font-size: 0.85em; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.07); border-radius: 4px; padding: 0.15em 0.4em; }
.post-content pre code { background: transparent; border: none; padding: 0; }
.post-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2em 0; }
.post-content table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin: 1.2em 0; }
.post-content th, .post-content td { border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; text-align: left; }
`;

function buildSrcdoc(html: string, fontSize: number): string {
  const safe = html || "";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<base target="_blank" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; color: #e8e8ec; font-family: "Inter", -apple-system, "Segoe UI", sans-serif; font-size: ${fontSize}px; }
  body { padding: 0; overflow-x: auto; }
  ${POST_CSS}
</style>
</head>
<body>
  <div class="post-content">${safe}</div>
  <script>
  (function(){
    function report(){
      var h = Math.max(
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.body ? document.body.scrollHeight : 0
      );
      try { window.parent.postMessage({ __htmlFrame: true, height: h }, '*'); } catch (e) {}
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', report);
    } else {
      report();
    }
    window.addEventListener('load', report);
    try {
      var ro = new ResizeObserver(report);
      if (document.documentElement) ro.observe(document.documentElement);
      if (document.body) ro.observe(document.body);
    } catch (e) {}
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('load', report);
      img.addEventListener('error', report);
    });
  })();
  </script>
</body>
</html>`;
}

export default function HtmlFrame({
  html,
  className,
  minHeight = 40,
  fontSize = 15,
}: {
  html: string;
  className?: string;
  minHeight?: number;
  fontSize?: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(minHeight);
  const srcdoc = useMemo(() => buildSrcdoc(html, fontSize), [html, fontSize]);

  useEffect(() => {
    setHeight(minHeight);
  }, [srcdoc, minHeight]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const iframe = iframeRef.current;
      if (!iframe || e.source !== iframe.contentWindow) return;
      const data = e.data as { __htmlFrame?: boolean; height?: number } | null;
      if (data && data.__htmlFrame && typeof data.height === "number") {
        setHeight(Math.max(minHeight, data.height + 4));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [minHeight]);

  return (
    <iframe
      ref={iframeRef}
      title="post content"
      srcDoc={srcdoc}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      scrolling="no"
      className={cn("block w-full border-0", className)}
      style={{ height, minHeight, overflow: "hidden" }}
    />
  );
}