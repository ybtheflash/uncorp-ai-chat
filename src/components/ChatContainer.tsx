"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { LoginPage } from "@/components/LoginPage";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface, Message } from "@/components/ChatInterface";
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

// Define Chat type for archived chats
export interface Chat {
  id: string;
  title: string;
  createdAt: any; // Use Timestamp if imported, or Date if converted
  archived?: boolean;
}

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
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]); // Adjust type if needed
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
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
        archivedChats={archivedChats}
        setArchivedChats={setArchivedChats}
        theme={theme || "light"}
        setTheme={setTheme}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        archivedOpen={archivedOpen}
        setArchivedOpen={setArchivedOpen}
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
    </div>
  );
}
