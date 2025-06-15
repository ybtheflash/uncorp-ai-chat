"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { generateGeminiResponse } from "@/app/actions";
import { Paperclip, SendHorizonal, User, Bot, AudioLines } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  writeBatch,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { OptionsMenu } from "./OptionsMenu";

// System prompt for AI identity
export const AI_SYSTEM_PROMPT = `
You are Pluxie, the helpful and friendly AI assistant of Project UnCorp by ybtheflash. You are powered by Google Gemini. Always introduce yourself as Pluxie if asked your name, and mention your project and technology if relevant.`;

// Update Message type for multiple attachments
export type Message = {
  role: "user" | "model";
  content: string;
  createdAt?: Date | string | { toDate: () => Date };
  attachment?:
    | { name: string; type: string }
    | { name: string; type: string }[];
};

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages: Message[];
}

export function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Audio cues for mic enable/disable
  const micEnableAudio = useRef<HTMLAudioElement | null>(null);
  const micDisableAudio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    micEnableAudio.current = new Audio("/assets/cues/mic-enable.mp3");
    micDisableAudio.current = new Audio("/assets/cues/mic-disable.mp3");
  }, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  useEffect(() => {
    chatContainerRef.current?.scrollTo(
      0,
      chatContainerRef.current.scrollHeight
    );
  }, [messages, isPending]);
  // Auto-expand textarea height for input
  useEffect(() => {
    const textarea = inputTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      // If input is large, expand up to a max height
      textarea.style.height = Math.min(textarea.scrollHeight, 320) + "px";
    }
  }, [input]);

  const getFiveWordSummary = async (text: string) => {
    // Use Gemini to summarize the text in 5 words or less
    const result = await generateGeminiResponse([
      { role: "user", content: text },
    ]);
    if (result.success && result.text) {
      // Take only the first 5 words from the AI response
      return result.text.split(/\s+/).slice(0, 5).join(" ");
    }
    return undefined;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || (!input.trim() && files.length === 0)) return;

    const currentInput = input;
    const currentFiles = files;
    let currentChatId = chatId;

    // Optimistically add the user's message to the UI immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentInput,
        ...(currentFiles.length > 0 && {
          attachment: currentFiles.map((f) => ({ name: f.name, type: f.type })),
        }),
      },
    ]);

    setIsPending(true);
    setInput("");
    setFiles([]);

    try {
      if (!currentChatId) {
        // 1. Create the chat with a placeholder title
        const newChatRef = doc(collection(db, "chats"));
        await setDoc(newChatRef, {
          userId: user.uid,
          title: "...", // Placeholder, will update after summary
          createdAt: serverTimestamp(),
        });
        // 2. Add the user's first message to the chat
        await addDoc(collection(db, "chats", newChatRef.id, "messages"), {
          role: "user" as const,
          content: currentInput,
          createdAt: new Date(),
          ...(currentFiles.length > 0 && {
            attachment: currentFiles.map((f) => ({
              name: f.name,
              type: f.type,
            })),
          }),
        });
        // 3. Summarize and update the chat title (async, does not block)
        getFiveWordSummary(currentInput).then(async (summary) => {
          if (summary) {
            await updateDoc(newChatRef, { title: summary });
          }
        });
        // 4. Trigger the AI response to the user's first message
        const conversation = [{ role: "user" as const, content: currentInput }];
        const result = await generateGeminiResponse(
          conversation,
          currentFiles.length > 0 ? currentFiles : undefined
        );
        if (result.success && result.text) {
          await addDoc(collection(db, "chats", newChatRef.id, "messages"), {
            role: "model" as const,
            content: result.text,
            createdAt: new Date(),
          });
        }
        // 5. Navigate to the new chat page (after all above, so chatId is available)
        router.push(`/c/${newChatRef.id}`);
      } else {
        // This is the simpler flow for an existing chat
        const userMessage = {
          role: "user" as const,
          content: currentInput,
          createdAt: new Date(),
          ...(currentFiles.length > 0 && {
            attachment: currentFiles.map((f) => ({
              name: f.name,
              type: f.type,
            })),
          }),
        };
        await addDoc(
          collection(db, "chats", currentChatId, "messages"),
          userMessage
        );

        // For existing chat, build conversation history
        const conversation = [
          ...messages.map(({ role, content }) => ({
            role: role as "user" | "model",
            content,
          })),
          { role: "user" as const, content: currentInput },
        ];
        const result = await generateGeminiResponse(
          conversation,
          currentFiles.length > 0 ? currentFiles : undefined
        );
        if (result.success && result.text) {
          await addDoc(collection(db, "chats", currentChatId, "messages"), {
            role: "model" as const,
            content: result.text,
            createdAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleEditMessage = (index: number) => {
    setEditingIndex(index);
    setEditValue(messages[index].content);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    const updatedMessages = [...messages];
    updatedMessages[editingIndex].content = editValue;
    setMessages(updatedMessages);
    setEditingIndex(null);
    // If the next message is a model response, rerun the AI and update it
    if (messages[editingIndex + 1]?.role === "model") {
      const conversation = [
        ...updatedMessages
          .slice(0, editingIndex + 1)
          .map(({ role, content }) => ({
            role: role as "user" | "model",
            content,
          })),
      ];
      const result = await generateGeminiResponse(conversation);
      if (result.success && result.text) {
        updatedMessages[editingIndex + 1].content = result.text;
        setMessages([...updatedMessages]);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleMicClick = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    micEnableAudio.current?.play();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
      micDisableAudio.current?.play();
    };
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        setIsListening(false);
        micDisableAudio.current?.play();
        return;
      }
      if (event.error === "aborted") {
        setIsListening(false);
        micDisableAudio.current?.play();
        return;
      }
      alert("Speech recognition error: " + event.error);
      setIsListening(false);
      micDisableAudio.current?.play();
    };
    recognition.onend = () => {
      setIsListening(false);
      micDisableAudio.current?.play();
    };
    recognition.start();
  };

  // The rest of the JSX is unchanged and correct.
  return (
    <div className="flex flex-col h-full relative">
      {/* Options button on the top right, always visible */}
      <div className="absolute top-4 right-4 z-20">
        <OptionsMenu
          onDelete={async () => {
            if (!chatId) return;
            if (
              window.confirm(
                "Are you sure you want to delete this chat? This cannot be undone."
              )
            ) {
              // Delete chat and its messages from Firestore
              const chatRef = doc(db, "chats", chatId);
              const messagesCol = collection(db, "chats", chatId, "messages");
              // Get all messages and batch delete
              const snapshot = await getDocs(messagesCol);
              const batch = writeBatch(db);
              snapshot.forEach((msgDoc) => batch.delete(msgDoc.ref));
              batch.delete(chatRef);
              await batch.commit();
              router.push("/");
            }
          }}
          onArchive={async () => {
            if (!chatId) return;
            if (
              window.confirm(
                "Are you sure you want to archive this chat? It will be moved to your archived chats."
              )
            ) {
              await updateDoc(doc(db, "chats", chatId), { archived: true });
              router.push("/");
            }
          }}
        />
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.length === 0 && !isPending && (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <h1 className="text-2xl font-semibold">UnCorp AI</h1>
            <p className="text-muted-foreground">
              Ask me anything, or upload an image or PDF to start.
            </p>
          </div>
        )}
        {messages.map((m, index) => (
          <div
            key={index}
            className={`group flex items-start gap-4 w-full relative`}
          >
            {/* Copy & Edit icons above and just outside the bubble, only on hover of the bubble */}
            <div
              className={`absolute flex gap-2 items-center -top-7 z-20 transition pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto
                ${m.role === "user" ? "right-0" : "left-0"}`}
            >
              <button
                className="copy-btn bg-transparent text-xl p-1 rounded-full hover:bg-primary/20 hover:text-primary transition"
                onClick={() => handleCopy(m.content)}
                title="Copy response"
                tabIndex={-1}
                aria-label="Copy"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                  />
                  <rect
                    x="3"
                    y="3"
                    width="13"
                    height="13"
                    rx="2"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                  />
                </svg>
              </button>
              {m.role === "user" && editingIndex !== index && (
                <button
                  className="edit-btn bg-transparent text-xl p-1 rounded-full hover:bg-primary/20 hover:text-primary transition"
                  onClick={() => handleEditMessage(index)}
                  title="Edit message"
                  tabIndex={-1}
                  aria-label="Edit"
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
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2h-2v-2z"
                    />
                  </svg>
                </button>
              )}
            </div>
            {m.role === "model" && (
              <div className="p-2 bg-secondary rounded-full order-1">
                <Bot size={20} />
              </div>
            )}
            <div
              className={`group max-w-2xl w-fit min-w-[4rem] p-4 rounded-lg shadow-sm ${
                m.role === "user"
                  ? "order-2 bg-primary text-primary-foreground ml-auto"
                  : "order-1 bg-muted text-foreground border mr-auto"
              } relative flex flex-col`}
            >
              {editingIndex === index ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full p-2 border rounded bg-background text-foreground"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-2 py-1 rounded bg-primary text-primary-foreground"
                      onClick={handleSaveEdit}
                    >
                      Rerun
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-muted text-foreground border"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                  {/* Animate bot response as loading if rerunning */}
                  {messages[index + 1]?.role === "model" && isPending && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <span className="text-xs text-muted-foreground">
                        Updating bot response...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <article
                  className={`prose prose-sm max-w-none ${
                    m.role === "model" ? "bot-message" : ""
                  } ${
                    m.role === "model"
                      ? "prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm"
                      : ""
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !match;
                        if (isInline) {
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                        return (
                          <CodeBlockWithCopy>{children}</CodeBlockWithCopy>
                        );
                      },
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </article>
              )}
              {Array.isArray(m.attachment)
                ? m.attachment.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 mt-2 max-w-xs break-words"
                    >
                      {att.type.startsWith("image/") ? (
                        <Paperclip size={16} className="text-blue-500" />
                      ) : att.type === "application/pdf" ? (
                        <span className="inline-block w-4 h-4 text-red-500">
                          📄
                        </span>
                      ) : (
                        <Paperclip
                          size={16}
                          className="text-muted-foreground"
                        />
                      )}
                      <span
                        className="truncate break-all text-xs"
                        title={att.name}
                      >
                        {att.name}
                      </span>
                    </div>
                  ))
                : m.attachment && (
                    <div className="flex items-center gap-2 mt-2 max-w-xs break-words">
                      {m.attachment.type.startsWith("image/") ? (
                        <Paperclip size={16} className="text-blue-500" />
                      ) : m.attachment.type === "application/pdf" ? (
                        <span className="inline-block w-4 h-4 text-red-500">
                          📄
                        </span>
                      ) : (
                        <Paperclip
                          size={16}
                          className="text-muted-foreground"
                        />
                      )}
                      <span
                        className="truncate break-all text-xs"
                        title={m.attachment.name}
                      >
                        {m.attachment.name}
                      </span>
                    </div>
                  )}
            </div>
            {m.role === "user" && (
              <div className="p-2 bg-secondary rounded-full order-2">
                <User size={20} />
              </div>
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex items-start gap-4">
            <div className="p-2 bg-secondary rounded-full">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-lg shadow-sm bg-muted text-foreground border">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-muted-foreground hover:text-foreground no-focus-style"
              disabled={isPending || files.length >= 6}
              tabIndex={-1}
            >
              <Paperclip size={20} />
            </button>
            <textarea
              ref={inputTextareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 min-h-[48px] max-h-80 resize-none py-3 px-4 border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              disabled={isPending}
            />
            <button
              type="button"
              className={`p-2 text-muted-foreground hover:text-foreground relative${
                isListening ? " mic-rainbow-border" : ""
              } no-focus-style`}
              onClick={handleMicClick}
              disabled={isPending}
              tabIndex={-1}
              aria-label="Speech to text"
              title="Speech to text"
            >
              <span
                className={`relative z-10${
                  isListening ? " mic-rainbow-icon" : ""
                }`}
              >
                <AudioLines size={20} />
              </span>
            </button>
            <button
              type="submit"
              className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 flex-shrink-0"
              disabled={isPending || (!input.trim() && files.length === 0)}
            >
              <SendHorizonal size={20} />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files);
                if (files.length + newFiles.length > 5) {
                  setToast("Not more than 5 attachments allowed.");
                  setTimeout(() => setToast(null), 2000);
                  return;
                }
                setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
              }
            }}
            className="hidden"
            accept="image/*,application/pdf"
            multiple
          />
        </form>
        {files.length > 0 && (
          <div className="max-w-3xl mx-auto mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
            {files.map((file, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 bg-muted px-2 py-1 rounded"
              >
                {file.name}
                <button
                  onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                  className="text-red-500 ml-1"
                  title="Remove attachment"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {copied && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded shadow z-50 animate-fade-in">
          Copied to clipboard!
        </div>
      )}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded shadow z-50 animate-fade-in">
          {toast}
        </div>
      )}
      {/* Add prominent waveform pulse animation */}
    </div>
  );
}

// Helper for random RGB glow
function randomRGBGlow() {
  const r = Math.floor(180 + Math.random() * 75);
  const g = Math.floor(180 + Math.random() * 75);
  const b = Math.floor(180 + Math.random() * 75);
  return `rgb(${r},${g},${b})`;
}

// Helper for code block copy
function CodeBlockWithCopy({ children }: { children: React.ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (preRef.current) {
      const code = preRef.current.innerText;
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };
  return (
    <div className="relative">
      <pre ref={preRef}>
        {children}
        <button
          className="codeblock-copy-btn"
          onClick={handleCopy}
          type="button"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </pre>
    </div>
  );
}
