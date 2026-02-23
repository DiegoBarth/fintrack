import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./ThemeContext";
import { PeriodProvider } from "./PeriodContext";
import type { ReactNode } from "react";

interface AppProviderProps {
  children: ReactNode;
  client: any;
}

export default function AppProvider({ children, client }: AppProviderProps) {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <PeriodProvider>{children}</PeriodProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}