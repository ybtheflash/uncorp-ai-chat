"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Cookies from "js-cookie";
import Image from "next/image";

export default function LoadVideoOverlay() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [played, setPlayed] = useState(false); // Remove playedRef, use state instead

  useEffect(() => {
    if (!loading && user && !played) {
      // Only play if NOT on the login page
      if (
        (window.location.pathname === "/" ||
          window.location.pathname.startsWith("/c/")) &&
        !Cookies.get("uncorp_load_shown")
      ) {
        setShow(true);
        setTimeout(() => setVisible(true), 10);
        setTimeout(() => {
          setPlayed(true);
        }, 100);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setShow(false), 400);
        }, 2000);
        Cookies.set("uncorp_load_shown", "1", { expires: 1 / 48 }); // 30 min expiry
      }
    }
  }, [user, loading, played]);

  if (!show) return null;
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${
        visible ? "opacity-100" : "opacity-0"
      } load-video-overlay`}
    >
      <Image
        src="/load.gif"
        width={256}
        height={256}
        className="w-64 h-64 object-contain rounded-xl shadow-2xl border-4 border-white load-video"
        alt="Loading animation"
        priority
      />
    </div>
  );
}
