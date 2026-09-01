"use client";

import { createContext, useContext } from "react";

interface WoltSettings {
  enabled: boolean;
  storeUrl: string | null;
}

const WoltSettingsContext = createContext<WoltSettings>({
  enabled: false,
  storeUrl: null,
});

export function WoltSettingsProvider({
  enabled,
  storeUrl,
  children,
}: WoltSettings & { children: React.ReactNode }) {
  return (
    <WoltSettingsContext.Provider value={{ enabled, storeUrl }}>
      {children}
    </WoltSettingsContext.Provider>
  );
}

export function useWoltSettings(): WoltSettings {
  return useContext(WoltSettingsContext);
}
