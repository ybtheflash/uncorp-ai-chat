"use client";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  doc as firestoreDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "./providers/AuthProvider";
import { useEffect, useState, useRef } from "react";
import {
  PlusIcon,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Archive,
  Settings as SettingsIcon,
  ArchiveRestore,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SettingsPanel } from "./SettingsPanel";
import Cookies from "js-cookie";

interface Chat {
  id: string;
  title: string;
  createdAt: Timestamp;
  archived?: boolean;
}

const isDateInThisWeek = (date: Date) => {
  const today = new Date();
  const firstDayOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay())
  );
  firstDayOfWeek.setHours(0, 0, 0, 0);
  return date >= firstDayOfWeek;
};

const isDateInThisMonth = (date: Date) => {
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  settingsOpen,
  setSettingsOpen,
  archivedOpen,
  setArchivedOpen,
  colorScheme,
  setColorScheme,
  archivedChats,
  setArchivedChats,
  theme,
  setTheme,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  archivedOpen: boolean;
  setArchivedOpen: (open: boolean) => void;
  colorScheme: string;
  setColorScheme: (c: string) => void;
  archivedChats: any[];
  setArchivedChats: (c: any[]) => void;
  theme: string;
  setTheme: (t: string) => void;
}) {
  const { user, signOut } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const prevUserRef = useRef<string | null>(null);
  const [chatsLoaded, setChatsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setChatsLoaded(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setChatsLoaded(true);
    }
  }, [chats, user]);

  // --- THE FIX IS HERE ---
  useEffect(() => {
    // This is the guard clause. If there's no user, we don't proceed.
    if (user) {
      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      // onSnapshot returns an "unsubscribe" function.
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsData: Chat[] = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Chat)
        );
        setChats(chatsData);
      });

      // This is the cleanup function. It runs when the component unmounts
      // or when the user changes, preventing memory leaks.
      return () => unsubscribe();
    } else {
      // If the user logs out, clear the chats from the UI.
      setChats([]);
    }
  }, [user]); // This effect re-runs whenever the user object changes.

  useEffect(() => {
    if (user) {
      // Listen for archived chats
      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        where("archived", "==", true),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsData: Chat[] = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Chat)
        );
        setArchivedChats(chatsData);
      });
      return () => unsubscribe();
    } else {
      setArchivedChats([]);
    }
  }, [user]);

  useEffect(() => {
    // Only redirect if user has just logged in, chats are loaded, and there are no chats
    if (
      user &&
      !prevUserRef.current &&
      !hasRedirected &&
      chatsLoaded &&
      chats.length === 0 &&
      pathname !== "/" &&
      !pathname.startsWith("/c/")
    ) {
      setHasRedirected(true);
      router.push("/");
    }
    prevUserRef.current = user ? user.uid : null;
  }, [user, pathname, hasRedirected, router, chats.length, chatsLoaded]);

  // Load user color scheme preferences on login
  useEffect(() => {
    if (user) {
      (async () => {
        const userDoc = await getDoc(firestoreDoc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.colorScheme) setColorScheme(data.colorScheme);
        }
      })();
    }
  }, [user, setColorScheme]);

  // Save user color scheme preferences on change
  useEffect(() => {
    if (user) {
      setDoc(
        firestoreDoc(db, "users", user.uid),
        { colorScheme },
        { merge: true }
      );
    }
  }, [user, colorScheme]);

  useEffect(() => {
    // When colorScheme changes, also update the cookie (for SSR and reload)
    if (typeof window !== "undefined") {
      Cookies.set("colorScheme", colorScheme, { expires: 365 });
    }
  }, [colorScheme]);
  const thisWeekChats = chats.filter(
    (chat) =>
      chat.createdAt &&
      isDateInThisWeek(chat.createdAt.toDate()) &&
      !chat.archived
  );
  const thisMonthChats = chats.filter(
    (chat) =>
      chat.createdAt &&
      !isDateInThisWeek(chat.createdAt.toDate()) &&
      isDateInThisMonth(chat.createdAt.toDate()) &&
      !chat.archived
  );
  const olderChats = chats.filter(
    (chat) =>
      chat.createdAt &&
      !isDateInThisWeek(chat.createdAt.toDate()) &&
      !isDateInThisMonth(chat.createdAt.toDate()) &&
      !chat.archived
  );

  const renderChatList = (title: string, list: Chat[], archived = false) =>
    list.length > 0 && (
      <div className="mb-4">
        <h3 className="px-4 text-xs font-semibold sidebar-collection-title mb-2">
          {title}
        </h3>
        <ul>
          {list.map((chat) => (
            <li key={chat.id} className="flex items-center justify-between">
              <Link
                href={`/c/${chat.id}`}
                className={`block px-4 py-2 text-sm rounded-lg truncate flex-1 sidebar-chat-link ${
                  pathname === `/c/${chat.id}`
                    ? "bg-secondary"
                    : "hover:bg-secondary"
                }`}
              >
                {chat.title}
              </Link>
              {archived && (
                <button
                  className="ml-2 text-xs text-muted-foreground hover:text-primary flex items-center justify-center sidebar-unarchive-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    await updateDoc(doc(db, "chats", chat.id), {
                      archived: false,
                    });
                  }}
                  title="Unarchive"
                  aria-label="Unarchive"
                >
                  <ArchiveRestore size={20} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );

  if (collapsed) {
    return (
      <div className="fixed top-2 left-2 z-50">
        <button
          className="p-2 rounded-lg bg-muted border shadow hover:bg-secondary"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // Responsive sidebar overlay for mobile
  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="fixed top-3 left-3 z-40 md:hidden p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        style={{ display: sidebarOpen ? "none" : "block" }}
      >
        <ChevronRight size={24} />
      </button>
      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar itself */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-muted/50 border-r transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex flex-col`}
        style={{ maxWidth: "100vw" }}
        tabIndex={-1}
        aria-label="Sidebar"
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-3 right-3 z-50 md:hidden p-2 rounded-lg bg-muted text-foreground shadow-lg"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col h-full w-64 bg-muted/50 border-r transition-all duration-200">
          <div className="flex items-center justify-between p-2 border-b">
            <Link
              href="/"
              className="flex items-center gap-2 p-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 border transition-all duration-200 new-chat-btn"
            >
              <PlusIcon size={16} />
              <span className="text-sm font-medium">New Chat</span>
            </Link>
            <button
              className="ml-2 p-2 rounded-lg hover:bg-secondary"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {renderChatList("This Week", thisWeekChats)}
            {renderChatList("This Month", thisMonthChats)}
            {renderChatList("Older", olderChats)}
          </div>
          {/* Options bar above profile section, not scrollable */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-b bg-background dark:bg-zinc-900">
            <button
              className="px-3 py-1 rounded-md font-medium text-sm hover:bg-secondary transition-colors bg-background dark:bg-zinc-900 flex items-center justify-center mx-auto sidebar-archive-btn"
              onClick={() => setArchivedOpen(true)}
              aria-label="Archived"
              title="Archived"
            >
              <Archive size={22} />
            </button>
            <button
              className="px-3 py-1 rounded-md font-medium text-sm hover:bg-secondary transition-colors bg-background dark:bg-zinc-900 flex items-center justify-center mx-auto sidebar-settings-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              title="Settings"
            >
              <SettingsIcon size={22} />
            </button>
          </div>
          {user && (
            <div className="p-2 border-t flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.photoURL || ""}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full border border-muted shadow"
              />
              <span className="text-sm font-medium truncate">
                {user.displayName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg hover:bg-secondary"
                  title={
                    theme === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      signOut();
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-secondary text-red-500"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
