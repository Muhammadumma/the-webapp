import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Upload,
  HelpCircle,
  Clock,
  AlertCircle,
  Layers,
  ArrowRight,
  Bot,
  User
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';

export const AiAssistantScreen: React.FC = () => {
  const {
    chatMessages,
    isAiThinking,
    sendChatMessage,
    openUploadScreen
  } = useClearance();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal;
    setInputVal('');
    await sendChatMessage(text);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendChatMessage(prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 flex flex-col h-[calc(100vh-120px)] animate-in fade-in">
      {/* Hero Assistant Header */}
      <div className="bg-gradient-to-br from-[#005FB0] to-[#004F58] text-white rounded-3xl p-5 shadow-xs shrink-0 flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
            <Sparkles className="w-6 h-6 text-[#97F0FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base tracking-tight font-['Space_Grotesk',sans-serif]">
                JSP Clearance AI Guide
              </h3>
              <span className="px-2 py-0.5 bg-[#198754] text-white text-[9px] font-bold rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Guidance for admissions, dues, fees, library slips & certificate issuance.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.isFromUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {!msg.isFromUser && (
              <div className="w-8 h-8 rounded-full bg-[#005FB0] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4 text-[#97F0FF]" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 shadow-xs ${
                msg.isFromUser
                  ? 'bg-[#005FB0] text-white rounded-tr-none'
                  : 'bg-white text-[#1B1B1F] border border-[#E3E8F1] rounded-tl-none'
              }`}
            >
              {/* Message text with basic Markdown parsing */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Action Button inside AI message */}
              {msg.actionButtonText && (
                <div className="pt-2 border-t border-[#E3E8F1]">
                  <button
                    onClick={() => openUploadScreen(msg.actionStageId || 1)}
                    className="py-2 px-3.5 bg-[#005FB0] hover:bg-[#004F94] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{msg.actionButtonText}</span>
                  </button>
                </div>
              )}
            </div>

            {msg.isFromUser && (
              <div className="w-8 h-8 rounded-full bg-[#EBF0F9] text-[#005FB0] flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isAiThinking && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#005FB0] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#97F0FF]" />
            </div>
            <div className="bg-white border border-[#E3E8F1] rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#005FB0] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#005FB0] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#005FB0] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="shrink-0 mb-3 overflow-x-auto pb-1 flex gap-2 no-scrollbar">
        {[
          "What is my clearance status?",
          "Bursary receipt guidance",
          "Central Library return slip",
          "How to get clearance certificate?",
          "What is missing?"
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(prompt)}
            className="px-3 py-1.5 bg-white hover:bg-[#D5E3FF]/50 active:scale-95 border border-[#C4C6D0] rounded-xl text-xs font-bold text-[#005FB0] shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="shrink-0 flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#C4C6D0] shadow-md">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask a question about your clearance..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-[#1B1B1F] bg-transparent focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isAiThinking}
          className="p-2.5 bg-[#005FB0] hover:bg-[#004F94] active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
