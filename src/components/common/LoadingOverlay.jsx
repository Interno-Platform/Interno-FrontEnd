import { Brain } from "lucide-react";

const LoadingOverlay = ({ show, message = "Loading..." }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/70 text-white backdrop-blur-sm">
      <Brain className="mb-4 h-12 w-12 animate-pulse" />
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
