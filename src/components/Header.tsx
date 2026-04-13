import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Gamepad2, LogIn, Feather, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavOverlay } from "@/contexts/NavOverlayContext";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "@/components/ProfileMenu";

interface HeaderProps {
  onNavigate?: (view: "history" | "leaderboard") => void;
}

const SCROLL_DOWN_HIDE_AT = 64;
const SCROLL_DELTA = 8;

const navLinkBase =
  "rounded-lg px-2.5 py-1.5 text-[15px] font-body font-semibold tracking-wide text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] transition-all duration-200 hover:bg-white/15 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.28),0_6px_20px_-4px_rgba(0,0,0,0.35)] hover:-translate-y-px active:translate-y-0 active:bg-white/10";
const navLinkActive =
  "bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] underline decoration-2 underline-offset-8 decoration-amber-300/90";

const Header = ({ onNavigate }: HeaderProps) => {
  const { user, isAdmin } = useAuth();
  const { headerSuppressed } = useNavOverlay();
  const location = useLocation();
  const [scrollHidden, setScrollHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setScrollHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    lastScrollY.current = window.scrollY || document.documentElement.scrollTop;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y < SCROLL_DOWN_HIDE_AT) {
        setScrollHidden(false);
        return;
      }
      if (delta > SCROLL_DELTA) setScrollHidden(true);
      else if (delta < -SCROLL_DELTA) setScrollHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Portal keeps `position: fixed` tied to the viewport (not warped by parent transforms / motion). */
  if (headerSuppressed) {
    return null;
  }

  const header = (
    <header
      className={`pointer-events-auto fixed left-1/2 z-40 w-[95%] max-w-6xl -translate-x-1/2 rounded-[1.75rem] border border-white/25 bg-white/[0.06] shadow-[0_8px_32px_-8px_rgba(15,23,42,0.18),inset_0_1px_0_0_rgba(255,255,255,0.45)] backdrop-blur-2xl backdrop-saturate-150 transition-[top,opacity] duration-300 ease-out supports-[backdrop-filter]:bg-white/[0.05] dark:border-white/15 dark:bg-black/15 dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)] ${
        scrollHidden ? "top-[-7.5rem] opacity-0 pointer-events-none" : "top-4 opacity-100"
      }`}
    >
      <div className="px-5 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/library" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]" />
          <h1 className="font-display text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)]">
            Latifa <span className="text-amber-200">Platform</span>
          </h1>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/library"
            className={`${navLinkBase} ${location.pathname === "/library" ? navLinkActive : ""}`}
          >
            Fables
          </Link>
          <Link
            to="/jeux"
            className={`flex items-center gap-2 ${navLinkBase} ${location.pathname === "/jeux" ? navLinkActive : ""}`}
          >
            <Gamepad2 className="h-[1.1rem] w-[1.1rem] opacity-95" />
            Jeux
          </Link>
          <Link
            to="/fabulistes"
            className={`flex items-center gap-2 ${navLinkBase} ${location.pathname === "/fabulistes" ? navLinkActive : ""}`}
          >
            <Feather className="h-[1.1rem] w-[1.1rem] opacity-95" />
            Fabulistes
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 ${navLinkBase} ${location.pathname === "/admin" ? `${navLinkActive} decoration-amber-200/90` : ""}`}
            >
              <Crown className="h-[1.1rem] w-[1.1rem] text-amber-200/95" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <ProfileMenu onNavigate={onNavigate} />
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="gap-2 font-body font-semibold">
                <LogIn className="w-4 h-4" />
                Connexion
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );

  if (typeof document === "undefined") return header;
  return createPortal(header, document.body);
};

export default Header;
