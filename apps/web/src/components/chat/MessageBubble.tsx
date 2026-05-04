"use client";

import { motion } from "framer-motion";
import { Sparkles, User as UserIcon } from "lucide-react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[70%] space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-auto">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-border shadow-sm">
              <UserIcon className="w-4 h-4 text-secondary" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_10px_rgba(200,169,106,0.2)]">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
          )}
        </div>

        {/* Bubble */}
        <div 
          className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
            isUser 
              ? "bg-foreground text-background rounded-br-sm" 
              : "bg-surface/80 backdrop-blur-md border border-white/5 text-foreground rounded-bl-sm"
          }`}
        >
          {/* Simple Markdown parsing (simulated for now, just preserving newlines) */}
          <div className="whitespace-pre-wrap font-sans">
            {message.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
