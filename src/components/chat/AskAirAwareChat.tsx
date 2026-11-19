'use client';

import React, { useState } from 'react';
import { AirSnapshot, FamilyProfile, Language, ChatMessage } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { MessageCircleIcon, SparklesIcon } from '../ui/Icons';

interface AskAirAwareChatProps {
  snapshot: AirSnapshot;
  activeProfile: FamilyProfile;
  language: Language;
}

const QUICK_QUESTIONS: Record<Language, string[]> = {
  en: [
    "What does today's air mean for my schedule?",
    "What does PM2.5 mean?",
    "Why does Ozone peak in the afternoon?",
    "Can we go for outdoor exercise today?",
  ],
  ta: [
    "இன்றைய காற்று குறித்து சுருக்கமாக விளக்குங்கள்.",
    "PM2.5 என்றால் என்ன?",
    "இன்று மாலையில் வெளியே நடைப்பயிற்சி செல்லலாமா?",
  ],
  hi: [
    "आज की हवा के बारे में सरल शब्दों में समझाएं।",
    "PM2.5 क्या होता है?",
    "क्या आज बाहर टहलने जाना सुरक्षित है?",
  ],
};

export function AskAirAwareChat({
  snapshot,
  activeProfile,
  language,
}: AskAirAwareChatProps) {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText: string) => {
    const textToSend = questionText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      profileCategory: activeProfile.category,
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          snapshot,
          category: activeProfile.category,
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: json.error || 'Unable to retrieve answer right now.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Network connection issue. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const questions = QUICK_QUESTIONS[language] || QUICK_QUESTIONS.en;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <MessageCircleIcon size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <span>{t.askAiTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Answering for: {activeProfile.name} ({activeProfile.category})
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.askAiSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
          <SparklesIcon size={13} className="text-emerald-600" />
          Suggested:
        </span>
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50/60 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 transition-all text-left disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 min-h-[120px] max-h-[300px] overflow-y-auto p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/60 mb-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
            <p className="font-semibold text-zinc-600 dark:text-zinc-400">
              No questions yet
            </p>
            <p>Select a suggested question above or type your own question below.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p>{m.content}</p>
                </div>
                <span className="text-[10px] text-zinc-400 px-1 mt-0.5">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Consulting verified air metrics...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all shrink-0"
        >
          {t.chatSendBtn}
        </button>
      </form>
    </div>
  );
}
