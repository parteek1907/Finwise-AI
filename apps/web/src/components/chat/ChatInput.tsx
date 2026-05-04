"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-end bg-surface/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        
        {/* Attachment Button (Mock for Scam Detection) */}
        <button 
          className="p-3 text-muted hover:text-foreground transition-colors rounded-full hover:bg-white/5 shrink-0"
          title="Upload a screenshot or message to analyze"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask your mentor..."
          className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none resize-none focus:outline-none focus:ring-0 px-2 py-3 text-[15px] text-foreground placeholder-muted font-sans"
          rows={1}
          disabled={disabled}
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={`p-3 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center ${
            input.trim() && !disabled 
              ? "bg-foreground text-background scale-100 hover:scale-105" 
              : "bg-surface-elevated text-muted scale-95 opacity-50"
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
      
      <div className="text-center mt-3 text-xs text-muted font-medium">
        Finwise AI can make mistakes. Always double-check important financial decisions.
      </div>
    </div>
  );
}
