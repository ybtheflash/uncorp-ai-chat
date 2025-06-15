"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { LoginPage } from "@/components/LoginPage";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface, Message } from "@/components/ChatInterface";
import { SettingsPanel } from "@/components/SettingsPanel";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ChatContainer() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const chatId = params.chatId ? (params.chatId as string) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [colorScheme, setColorScheme] = useState("lilac");
  const [archivedChats, setArchivedChats] = useState<Message[]>([]); // Adjust type if needed
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    console.log(
      "ChatContainer useEffect - authLoading:",
      authLoading,
      "user:",
      user?.uid,
      "chatId:",
      chatId
    );

    if (authLoading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }
    if (!chatId) {
      setPageLoading(false);
      setMessages([]);
      return;
    }

    const verifyAndFetch = async () => {
      try {
        console.log("Attempting to fetch chat:", chatId, "for user:", user.uid);

        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        console.log("Chat exists:", chatSnap.exists());
        if (chatSnap.exists()) {
          console.log("Chat data:", chatSnap.data());
        }

        if (!chatSnap.exists() || chatSnap.data().userId !== user.uid) {
          console.warn(
            "Access Denied: Chat does not exist or userId mismatch",
            {
              chatId,
              userId: user.uid,
              chatExists: chatSnap.exists(),
              chatData: chatSnap.exists() ? chatSnap.data() : null,
            }
          );
          setError("Access Denied or Chat Not Found");
          setPageLoading(false);
          // Redirect to new chat page
          window.location.href = "/";
          return;
        }

        console.log("Setting up messages listener for chat:", chatId);
        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("createdAt", "asc")
        );
        const unsubscribe = onSnapshot(
          messagesQuery,
          (snapshot) => {
            console.log(
              "Messages snapshot received, count:",
              snapshot.docs.length
            );
            setMessages(snapshot.docs.map((doc) => doc.data() as Message));
            setPageLoading(false);
          },
          (err) => {
            console.error("Firestore onSnapshot error:", err);
            console.error("Error code:", err.code);
            console.error("Error message:", err.message);
            setError(`Failed to load messages: ${err.code}`);
            setPageLoading(false);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.error("Error in verifyAndFetch:", err);
        setError("An unexpected error occurred.");
        setPageLoading(false);
      }
    };

    const unsubscribePromise = verifyAndFetch();
    return () => {
      unsubscribePromise.then((unsub) => unsub && unsub());
    };
  }, [user, authLoading, chatId]);

  if (authLoading || (user && pageLoading && chatId)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        archivedOpen={archivedOpen}
        setArchivedOpen={setArchivedOpen}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
        archivedChats={archivedChats}
        setArchivedChats={setArchivedChats}
        theme={theme || "light"}
        setTheme={setTheme}
      />
      <main className="flex-1">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500 font-semibold">{error}</p>
          </div>
        ) : (
          <ChatInterface
            chatId={chatId}
            initialMessages={messages}
            sidebarOpen={sidebarOpen}
          />
        )}
      </main>
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme || "light"}
        setTheme={setTheme}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
      />
      {archivedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md bg-background dark:bg-zinc-900 rounded-2xl shadow-lg p-6 m-4 border max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Archived Chats</h2>
              <button
                onClick={() => setArchivedOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>
            {archivedChats.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No archived chats.
              </div>
            ) : (
              <ul className="space-y-2">
                {archivedChats.map((chat: any) => (
                  <li
                    key={chat.id}
                    className="flex items-center justify-between"
                  >
                    <a
                      href={`/c/${chat.id}`}
                      className="block px-4 py-2 text-sm rounded-lg truncate flex-1 hover:bg-secondary"
                    >
                      {chat.title}
                    </a>
                    <button
                      className="ml-2 text-xs text-muted-foreground hover:text-primary flex items-center justify-center"
                      onClick={async (e) => {
                        e.preventDefault();
                        // Unarchive chat
                        const { updateDoc, doc } = await import(
                          "firebase/firestore"
                        );
                        await updateDoc(doc(db, "chats", chat.id), {
                          archived: false,
                        });
                      }}
                      title="Unarchive"
                      aria-label="Unarchive"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5 5 5-5"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
