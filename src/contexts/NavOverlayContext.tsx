import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type NavOverlayContextValue = {
  /** When true, the main nav bar is hidden (e.g. fable editor modal open). */
  headerSuppressed: boolean;
  setHeaderSuppressed: (v: boolean) => void;
};

const NavOverlayContext = createContext<NavOverlayContextValue | null>(null);

export function NavOverlayProvider({ children }: { children: ReactNode }) {
  const [headerSuppressed, setHeaderSuppressed] = useState(false);
  const setHeaderSuppressedStable = useCallback((v: boolean) => {
    setHeaderSuppressed(v);
  }, []);

  const value = useMemo(
    () => ({ headerSuppressed, setHeaderSuppressed: setHeaderSuppressedStable }),
    [headerSuppressed, setHeaderSuppressedStable]
  );

  return <NavOverlayContext.Provider value={value}>{children}</NavOverlayContext.Provider>;
}

export function useNavOverlay() {
  const ctx = useContext(NavOverlayContext);
  if (!ctx) {
    throw new Error("useNavOverlay must be used within NavOverlayProvider");
  }
  return ctx;
}
