import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import ConnectScreen from "./components/ConnectScreen";
import Dashboard from "./components/Dashboard";
import Editor from "./components/Editor";
import PostDetail from "./components/PostDetail";
import PostsView from "./components/PostsView";
import SettingsModal from "./components/SettingsModal";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ConfirmDialog, Spinner, ToastHost } from "./components/ui";
import { useApp } from "./store";

export default function App() {
  const connected = useApp((s) => s.connected);
  const connecting = useApp((s) => s.connecting);
  const view = useApp((s) => s.view);
  const attempted = useRef(false);

  // auto-reconnect from persisted settings on first paint
  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const { settings, connect } = useApp.getState();
    if (settings.demoMode || (settings.apiKey && (settings.blogId || settings.blogUrl))) {
      void connect(settings);
    }
  }, []);

  if (!connected) {
    if (connecting) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Spinner className="text-ember-400" />
          <p className="text-[12.5px] text-ink-400">Reconnecting to your blog…</p>
        </div>
      );
    }
    return (
      <div className="h-full overflow-y-auto">
        <ConnectScreen />
        <ToastHost />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.22 }}
              className={view === "editor" ? "h-full" : "min-h-full"}
            >
              {view === "dashboard" && <Dashboard />}
              {view === "posts" && <PostsView />}
              {view === "detail" && <PostDetail />}
              {view === "editor" && <Editor />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SettingsModal />
      <ConfirmDialog />
      <ToastHost />
    </div>
  );
}
