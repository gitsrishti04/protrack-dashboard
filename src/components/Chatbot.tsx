import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const AI_RESPONSES: Record<string, string> = {
  delayed: "Currently, 3 projects are delayed: **ML Pipeline v2** (42%), **Security Audit** (30%), and **Data Migration** (55%). The Security Audit is the most critical as its deadline has already passed.",
  progress: "Overall project portfolio progress is at **78%**. Two projects have been completed, five are active, and three are experiencing delays.",
  workload: "The **Backend** team has the highest workload at 28% of total capacity utilization, closely followed by **Frontend** at 32%. DevOps has the lowest at 10%.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("delayed") || lower.includes("delay")) return AI_RESPONSES.delayed;
  if (lower.includes("progress") || lower.includes("status")) return AI_RESPONSES.progress;
  if (lower.includes("workload") || lower.includes("team") || lower.includes("resource")) return AI_RESPONSES.workload;
  return "I can help you with project progress, delays, and resource allocation. Try asking about delayed projects, overall progress, or team workload.";
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "ai", content: "Hello! I'm ProTrack AI. Ask me about project progress, delays, or resource allocation." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: getAIResponse(userMsg.content) };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-sm">ProTrack AI Assistant</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Ask about project progress, delays, or resources</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ProTrack AI about project progress, delays, or resource allocation..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
