export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number; // Optional duration in milliseconds, defaults to 3000ms
};

export type ToastOptions = {
  duration?: number;
};