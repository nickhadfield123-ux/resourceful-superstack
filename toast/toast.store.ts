import { Toast, ToastOptions, ToastVariant } from "./toast.types";

type ToastStore = {
  toasts: Toast[];
  push: (variant: ToastVariant, message: string, opts?: ToastOptions) => void;
  remove: (id: string) => void;
};

let listeners: ((toasts: Toast[]) => void)[] = [];
let state: Toast[] = [];

function notify() {
  listeners.forEach(l => l(state));
}

export const toastStore = {
  subscribe(fn: (toasts: Toast[]) => void) {
    listeners.push(fn);
    fn(state);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },

  push(variant: ToastVariant, message: string, opts?: ToastOptions) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      variant,
      duration: opts?.duration,
    };
    state = [...state, toast];
    notify();
    
    // Auto-dismiss toast after duration
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        state = state.filter(t => t.id !== toast.id);
        notify();
      }, duration);
    }
  },

  remove(id: string) {
    state = state.filter(t => t.id !== id);
    notify();
  },
};