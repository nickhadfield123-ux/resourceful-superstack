"use client";

import { useEffect, useState } from "react";
import { toastStore } from "./toast.store";
import { Toast } from "./toast.types";

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return (
    <div className="toast-viewport fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`toast p-4 rounded-lg shadow-lg ${
            t.variant === "success" ? "bg-green-500" :
            t.variant === "error" ? "bg-red-500" :
            "bg-blue-500"
          } text-white`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}