import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../store";
import type { PostStatus } from "../types";

/* ---------- Button ---------- */

type BtnVariant = "primary" | "outline" | "ghost" | "danger";

export function Button({
  variant = "outline",
  size = "md",
  className,
  loading,
  children,
  disabled,
  ...rest
}: {
  variant?: BtnVariant;
  size?: "sm" | "md";
  loading?: boolean;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<BtnVariant, string> = {
    primary:
      "bg-ember-500 text-white hover:bg-ember-400 active:bg-ember-600 border border-ember-500 shadow-[0_0_0_1px_rgba(255,107,44,0.2),0_8px_24px_-8px_rgba(255,107,44,0.55)]",
    outline: "bg-ink-850 text-ink-100 border hairline hover:bg-ink-700 hover:text-white",
    ghost: "bg-transparent text-ink-300 border border-transparent hover:bg-ink-800 hover:text-white",
    danger: "bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20 hover:text-red-200",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 select-none whitespace-nowrap",
        size === "sm" ? "h-8 px-3 text-[12.5px]" : "h-9.5 px-4 text-[13px]",
        (disabled || loading) && "opacity-45 pointer-events-none",
        styles[variant],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({
  className,
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Inputs ---------- */

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9.5 w-full rounded-md border hairline bg-ink-900 px-3 text-[13px] text-ink-100 placeholder:text-ink-500 transition-colors focus:border-ember-500/60",
        className
      )}
      {...rest}
    />
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border hairline bg-ink-900 px-3 py-2.5 text-[13px] leading-relaxed text-ink-100 placeholder:text-ink-500 transition-colors focus:border-ember-500/60",
        className
      )}
      {...rest}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[11.5px] font-medium tracking-wide text-ink-300">
        {label}
        {hint && <span className="text-[10.5px] font-normal text-ink-500">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/* ---------- Pills & badges ---------- */

const STATUS_STYLES: Record<PostStatus, { dot: string; text: string; bg: string; label: string }> = {
  LIVE: { dot: "bg-mint-400", text: "text-mint-400", bg: "bg-mint-400/8", label: "Live" },
  DRAFT: { dot: "bg-gold-400", text: "text-gold-400", bg: "bg-gold-400/8", label: "Draft" },
  SCHEDULED: { dot: "bg-sky-400", text: "text-sky-400", bg: "bg-sky-400/8", label: "Scheduled" },
  SOFT_TRASHED: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/8", label: "Trashed" },
};

export function StatusPill({ status, className }: { status: PostStatus; className?: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border hairline px-2 py-0.5 text-[10.5px] font-semibold tracking-wide uppercase",
        s.text,
        s.bg,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function LabelChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
        active
          ? "border-ember-500/50 bg-ember-500/15 text-ember-300"
          : "hairline bg-ink-800 text-ink-300 hover:text-ink-100 hover:bg-ink-700",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      {label}
    </button>
  );
}

/* ---------- Card ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-lg border hairline bg-ink-900/80 backdrop-blur", className)}>{children}</div>
  );
}

/* ---------- Spinner / skeleton / empty ---------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-ink-400", className)} size={18} />;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border hairline bg-ink-850 text-ink-400">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-ink-100">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-ink-400">{message}</p>
      </div>
      {action}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  children,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/65 backdrop-blur-[3px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="w-full rounded-t-xl border hairline bg-ink-900 shadow-2xl shadow-black/60 sm:rounded-xl"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toasts ---------- */

const TOAST_ICONS = {
  success: <CheckCircle2 size={16} className="text-mint-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-sky-400" />,
};

export function ToastHost() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, transition: { duration: 0.18 } }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-start gap-3 rounded-lg border hairline bg-ink-850/95 p-3.5 shadow-xl shadow-black/50 backdrop-blur"
          >
            <span className="mt-0.5 shrink-0">{TOAST_ICONS[t.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-[12px] leading-snug break-words text-ink-300">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded p-0.5 text-ink-500 transition-colors hover:bg-ink-700 hover:text-white"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */

export function ConfirmDialog() {
  const confirm = useApp((s) => s.confirm);
  const setConfirm = useApp((s) => s.setConfirm);
  const deletePost = useApp((s) => s.deletePost);
  const revertPost = useApp((s) => s.revertPost);
  const busy = useApp((s) => (confirm ? !!s.busyIds[confirm.post.id] : false));

  if (!confirm) return null;
  const isDelete = confirm.kind === "delete";

  return (
    <Modal open onClose={() => setConfirm(null)} width={440}>
      <div className="p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
              isDelete ? "border-red-500/25 bg-red-500/10 text-red-400" : "border-gold-400/25 bg-gold-400/10 text-gold-400"
            )}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              {isDelete ? "Delete this post?" : "Revert to draft?"}
            </h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-300">
              {isDelete ? (
                <>
                  <span className="font-medium text-ink-100">“{confirm.post.title}”</span> will be moved to your
                  Blogger trash. You can restore it from blogger.com within 90 days.
                </>
              ) : (
                <>
                  <span className="font-medium text-ink-100">“{confirm.post.title}”</span> will be unpublished and
                  moved back to drafts. Its URL will stop resolving.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant={isDelete ? "danger" : "primary"}
            loading={busy}
            onClick={() => (isDelete ? deletePost(confirm.post) : revertPost(confirm.post))}
          >
            {isDelete ? "Delete post" : "Revert to draft"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
