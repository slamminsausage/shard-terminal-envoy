import { Toaster as Sonner, toast } from "sonner";
import audioManager from "@/lib/audioManager";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black group-[.toaster]:text-terminal-primary group-[.toaster]:border-2 group-[.toaster]:border-terminal-primary/40 group-[.toaster]:shadow-[0_0_20px_rgba(0,255,0,0.15)] group-[.toaster]:font-mono",
          description: "group-[.toast]:text-terminal-primary/60",
          actionButton:
            "group-[.toast]:bg-terminal-primary/20 group-[.toast]:text-terminal-primary group-[.toast]:border group-[.toast]:border-terminal-primary/30 group-[.toast]:font-mono",
          cancelButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-terminal-primary/50 group-[.toast]:border group-[.toast]:border-terminal-primary/20 group-[.toast]:font-mono",
          success:
            "group-[.toaster]:border-terminal-primary group-[.toaster]:shadow-[0_0_25px_rgba(0,255,0,0.25)]",
          error:
            "group-[.toaster]:border-red-500 group-[.toaster]:text-red-400 group-[.toaster]:shadow-[0_0_25px_rgba(255,51,68,0.25)]",
          warning:
            "group-[.toaster]:border-orange-500 group-[.toaster]:text-orange-400 group-[.toaster]:shadow-[0_0_25px_rgba(255,102,0,0.25)]",
          info: "group-[.toaster]:border-cyan-400 group-[.toaster]:text-cyan-300 group-[.toaster]:shadow-[0_0_25px_rgba(0,204,255,0.25)]",
        },
      }}
      {...props}
    />
  );
};

const terminalToast = {
  success: (message: string, opts?: Parameters<typeof toast.success>[1]) => {
    audioManager.playEffect("access_granted", 0.15);
    return toast.success(message, opts);
  },
  error: (message: string, opts?: Parameters<typeof toast.error>[1]) => {
    audioManager.playEffect("access_denied", 0.15);
    return toast.error(message, opts);
  },
  warning: (message: string, opts?: Parameters<typeof toast.warning>[1]) => {
    audioManager.playEffect("warning", 0.15);
    return toast.warning(message, opts);
  },
  info: (message: string, opts?: Parameters<typeof toast>[1]) => {
    audioManager.playEffect("keypress", 0.1);
    return toast.info(message, opts);
  },
};

export { Toaster, toast, terminalToast };
