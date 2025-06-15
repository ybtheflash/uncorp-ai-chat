import { db } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "./providers/AuthProvider";
import { useEffect, useState } from "react";
import { Palette, Sun, Moon } from "lucide-react";

const colorSchemes = [
  {
    name: "Lilac",
    key: "lilac",
    colors: ["#b39ddb", "#9575cd", "#7e57c2"],
  },
  {
    name: "Blue",
    key: "blue",
    colors: ["#64b5f6", "#1976d2", "#0d47a1"],
  },
  {
    name: "Light Blue",
    key: "lightblue",
    colors: ["#b3e5fc", "#4fc3f7", "#0288d1"],
  },
  {
    name: "Dark",
    key: "dark",
    colors: ["#22223b", "#4a4e69", "#9a8c98"],
  },
  {
    name: "AMOLED",
    key: "amoled",
    colors: ["#000000", "#222222", "#333333"],
  },
];

export function SettingsPanel({
  open,
  onClose,
  theme,
  setTheme,
  colorScheme,
  setColorScheme,
}: {
  open: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (t: string) => void;
  colorScheme: string;
  setColorScheme: (c: string) => void;
}) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "main" | "about" | "privacy"
  >("main");

  // Apply color scheme to document root
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    // Reset all theme variables to Tailwind defaults first
    root.removeAttribute("style");
    if (colorScheme === "lilac") {
      root.style.setProperty("--primary", "270 40% 70%"); // lilac
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", "270 40% 85%");
      root.style.setProperty("--accent-foreground", "270 40% 30%");
    } else if (colorScheme === "blue") {
      root.style.setProperty("--primary", "217 91% 60%"); // blue
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", "217 91% 80%");
      root.style.setProperty("--accent-foreground", "217 91% 30%");
    } else if (colorScheme === "lightblue") {
      root.style.setProperty("--primary", "199 90% 55%"); // light blue
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", "199 90% 80%");
      root.style.setProperty("--accent-foreground", "199 90% 30%");
    } else if (colorScheme === "dark") {
      root.style.setProperty("--primary", "222 47% 15%"); // dark
      root.style.setProperty("--primary-foreground", "210 40% 90%");
      root.style.setProperty("--accent", "222 47% 25%");
      root.style.setProperty("--accent-foreground", "210 40% 90%");
    } else if (colorScheme === "amoled") {
      if (theme === "dark") {
        root.style.setProperty("--background", "0 0% 0%");
        root.style.setProperty("--foreground", "0 0% 100%"); // pure white text
        root.style.setProperty("--primary", "0 0% 10%");
        root.style.setProperty("--primary-foreground", "0 0% 100%");
        root.style.setProperty("--accent", "0 0% 20%");
        root.style.setProperty("--accent-foreground", "0 0% 100%");
        // Force all text to white in AMOLED dark mode
        document.body.style.color = "#fff";
        document.body.classList.add("amoled-dark");
      } else {
        // AMOLED in light mode falls back to blue
        root.style.setProperty("--primary", "217 91% 60%");
        root.style.setProperty("--primary-foreground", "0 0% 100%");
        root.style.setProperty("--accent", "217 91% 80%");
        root.style.setProperty("--accent-foreground", "217 91% 30%");
        document.body.style.color = "";
        document.body.classList.remove("amoled-dark");
      }
    }
    // Reset to default if needed (optional)
    return () => {
      // Clean up forced color on unmount or color change
      document.body.style.color = "";
      document.body.classList.remove("amoled-dark");
    };
  }, [colorScheme, open, theme]);

  async function handleDeleteAccount() {
    if (!user) return;
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      // Delete all chats
      const chatsSnap = await getDocs(collection(db, "chats"));
      for (const chatDoc of chatsSnap.docs) {
        if (chatDoc.data().userId === user.uid) {
          await deleteDoc(chatDoc.ref);
        }
      }
      // Delete user profile
      await deleteDoc(doc(db, "users", user.uid));
      // Delete auth user
      await deleteUser(user);
      setDeleting(false);
      onClose();
    } catch (err) {
      setDeleting(false);
      if (
        err &&
        typeof err === "object" &&
        (err as any).code === "auth/requires-recent-login"
      ) {
        alert(
          "For security, please log out and log in again, then try deleting your account."
        );
      } else {
        alert("Failed to delete account: " + (err as any)?.message);
      }
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm bg-background dark:bg-zinc-900 rounded-2xl shadow-lg p-6 m-4 border">
        {activeSection === "main" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Palette size={20} /> Theme Options
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <div className="font-medium mb-2">Color Scheme</div>
              <div className="flex flex-wrap gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.key}
                    className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg border transition-all ${
                      colorScheme === scheme.key
                        ? "border-primary ring-2 ring-primary"
                        : "border-transparent"
                    }`}
                    onClick={() => setColorScheme(scheme.key)}
                    aria-label={scheme.name}
                  >
                    <div className="flex gap-1 mb-1">
                      {scheme.colors.map((color, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-full border border-muted"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {scheme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Mode</div>
              <div className="flex gap-3">
                <button
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-all ${
                    theme === "light"
                      ? "border-primary ring-2 ring-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <Sun size={16} /> Light
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-all ${
                    theme === "dark"
                      ? "border-primary ring-2 ring-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>
            <div className="mt-8 border-t pt-6">
              <div className="mb-2 text-destructive font-semibold">
                Delete Account
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Deleting your account will immediately and permanently erase all
                your data, chats, and preferences. This action cannot be undone.
              </div>
              <button
                className="w-full py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-red-700 transition disabled:opacity-50"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <button
                className="w-full py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-secondary transition"
                onClick={() => setActiveSection("about")}
              >
                About
              </button>
              <button
                className="w-full py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-secondary transition"
                onClick={() => setActiveSection("privacy")}
              >
                Privacy Policy
              </button>
            </div>
          </>
        )}
        {activeSection === "about" && (
          <div>
            <button
              className="mb-4 text-sm text-muted-foreground hover:text-primary font-semibold flex items-center gap-1"
              onClick={() => setActiveSection("main")}
            >
              ← Back
            </button>
            <div className="font-semibold mb-1 text-lg">About</div>
            <div className="text-sm text-muted-foreground mb-2">
              Made with <span className="text-pink-500">&lt;3</span> by{" "}
              <a
                href="https://github.com/ybtheflash"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                YBTHEFLASH
              </a>
              .<br />
              <a
                href="https://ybtheflash.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                ybtheflash.in
              </a>{" "}
              &bull;{" "}
              <a
                href="mailto:ybtheflash@gmail.com"
                className="underline hover:text-primary"
              >
                ybtheflash@gmail.com
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              This project is for educational purposes only.
              <br />
              Gemini is a product of Google and all rights belong to their
              respective owners.
            </div>
          </div>
        )}
        {activeSection === "privacy" && (
          <div>
            <button
              className="mb-4 text-sm text-muted-foreground hover:text-primary font-semibold flex items-center gap-1"
              onClick={() => setActiveSection("main")}
            >
              ← Back
            </button>
            <div className="font-semibold mb-1 text-lg">Privacy Policy</div>
            <div className="text-xs text-muted-foreground">
              No data is ever sold. All your data is safe and encrypted.
            </div>
          </div>
        )}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background dark:bg-zinc-900 rounded-xl shadow-lg p-6 border w-full max-w-xs">
              <div className="mb-4 text-center">
                <div className="font-semibold text-lg mb-2">
                  Confirm Deletion
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Are you absolutely sure? This cannot be undone.
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-red-700 transition"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  Yes, Delete
                </button>
                <button
                  className="flex-1 py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-secondary transition"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
