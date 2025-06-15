"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Cookies from "js-cookie";

export default function LoadVideoOverlay() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!loading && user && !playedRef.current) {
      // Only play if NOT on the login page
      if (
        (window.location.pathname === "/" ||
          window.location.pathname.startsWith("/c/")) &&
        !Cookies.get("uncorp_load_shown")
      ) {
        setShow(true);
        setTimeout(() => setVisible(true), 10);
        setTimeout(() => {
          playedRef.current = true;
        }, 100);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setShow(false), 400);
        }, 2000);
        Cookies.set("uncorp_load_shown", "1", { expires: 1 / 48 }); // 30 min expiry
      }
    }
  }, [user, loading]);

  if (!show) return null;
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${
        visible ? "opacity-100" : "opacity-0"
      } load-video-overlay`}
    >
      <img
        src="/load.gif"
        className="w-64 h-64 object-contain rounded-xl shadow-2xl border-4 border-white load-video"
        alt="Loading animation"
      />
    </div>
  );
}
