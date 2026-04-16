import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="my-6 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-soft sm:my-0 sm:max-h-[calc(100vh-2rem)] sm:p-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:bg-muted"
              type="button"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-y-auto pr-0.5 sm:pr-1">{children}</div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default Modal;
