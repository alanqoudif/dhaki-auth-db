"use client";

import { ReactNode } from "react";
import { createClientComponent } from "@/lib/supabase";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const supabase = createClientComponent();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}