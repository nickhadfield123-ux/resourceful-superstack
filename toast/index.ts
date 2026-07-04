import { toastStore } from "./toast.store";

import { ToastOptions } from "./toast.types";

export const toast = {
  success(message: string, opts?: ToastOptions) {
    toastStore.push("success", message, opts);
  },
  error(message: string, opts?: ToastOptions) {
    toastStore.push("error", message, opts);
  },
  info(message: string, opts?: ToastOptions) {
    toastStore.push("info", message, opts);
  },
};
