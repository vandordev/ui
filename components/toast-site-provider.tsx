"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { ToastProvider, Toaster } from "@/registry/new-york/toast";
import type { ToastPosition } from "@/registry/new-york/toast";
import { ToastQueryAdapter } from "@/registry/new-york/toast-tanstack-query";

const ToastPreviewContext = createContext<{
  setPosition: (position: ToastPosition | undefined) => void;
} | null>(null);

export const useToastPreviewPosition = () => useContext(ToastPreviewContext);

export const ToastSiteProvider = ({ children }: { children: ReactNode }) => {
  const [position, setPosition] = useState<ToastPosition>();
  const [client] = useState(() => new QueryClient());
  return (
    <ToastPreviewContext.Provider value={{ setPosition }}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          {children}
          <Toaster position={position} />
          <ToastQueryAdapter />
        </ToastProvider>
      </QueryClientProvider>
    </ToastPreviewContext.Provider>
  );
};
