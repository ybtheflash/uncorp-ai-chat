"use client";
import { useAuth } from "./providers/AuthProvider";
import { useState } from "react";

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);

  // Play video and fade in/out on login
  const handleLogin = async () => {
    signInWithGoogle();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
      {/* Video Overlay */}
      {/* (Removed video overlay logic) */}
      {/* Card Container */}
      <div className="bg-slate-800/50 backdrop-blur-md p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full transform transition-all duration-300 hover:shadow-slate-700/60">
        {/* Logo or App Name (Optional) */}
        <div className="text-center mb-8">
          {/* You can place a logo SVG or an <img> tag here */}
          <h1 className="text-4xl font-bold text-sky-400">UnCorp AI</h1>
          <p className="text-slate-400 mt-2">Sign in to access your AI chat.</p>
        </div>

        {/* Sign-in Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg font-semibold shadow-lg hover:shadow-sky-500/40 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 active:scale-95"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Sign In with Google
        </button>

        {/* Footer text (Optional) */}
        <p className="text-xs text-slate-500 mt-10 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
