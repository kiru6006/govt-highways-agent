import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, ExternalLink, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { AskAIResult } from '../types';

interface AskAIPanelProps {
  currentScreenName: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  result?: AskAIResult;
  timestamp: string;
}

export const AskAIPanel: React.FC<AskAIPanelProps> = ({ currentScreenName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello Officer. I am the TN-HDOS Operational Intelligence Assistant. I am monitoring active project milestones, statutory clearances, and field reports across the Tamil Nadu Highways network. How can I assist you with ${currentScreenName}?`,
      timestamp: 'Just now'
    }
  ]);

  const suggestedQuestions = [
    'What are the active statutory bottlenecks on SH-49?',
    'Show pending utility relocations with TANGEDCO',
    'Which projects have cost or time overrun risks?',
    'Summarize recent engineering quality cube tests'
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || query;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askAI(textToSend, currentScreenName);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer,
        result: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to query AI engine: ${err.message || 'Network error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Entry Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#20242B] hover:bg-slate-800 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2.5 z-40 transition-all transform hover:scale-105 border border-slate-700"
          title="Open TN-HDOS Ask AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#FACC15]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FACC15] rounded-full ring-2 ring-[#20242B]" />
          </div>
          <span className="font-semibold text-xs tracking-wide">Ask AI Assistant</span>
          <span className="text-[10px] bg-slate-800 text-[#FACC15] px-1.5 py-0.5 rounded font-mono border border-slate-700">Govt AI</span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 md:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="bg-[#20242B] text-white p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#FACC15]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-white">Ask AI Intelligence</h3>
                  <span className="bg-[#FACC15] text-[#20242B] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Decision Support
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  Context: <span className="font-semibold text-[#FACC15]">{currentScreenName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Statutory Disclaimer Alert */}
          <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 flex items-center gap-2 text-[10px] text-amber-900 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span>AI assistance is for decision support only. Official approvals require statutory digital signatures.</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-[#20242B] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                  {/* Grounding & Evidence Box */}
                  {m.result?.grounding_references && m.result.grounding_references.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Grounding Evidence & Records:
                      </div>
                      <div className="space-y-1">
                        {m.result.grounding_references.map((g, gIdx) => (
                          <div
                            key={gIdx}
                            className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between text-[10px]"
                          >
                            <span className="truncate max-w-[200px] text-slate-700">
                              {g.reference || g.detail}
                            </span>
                            <span className="font-mono text-slate-400">{g.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Next Actions */}
                  {m.result?.suggested_actions && m.result.suggested_actions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Recommended Actions:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.result.suggested_actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSend(act)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Auditing statutory records & analytics...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] custom-scrollbar">
            <span className="text-slate-400 text-[10px] whitespace-nowrap pl-1">Prompts:</span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about this project or highways..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="p-2 bg-[#20242B] hover:bg-slate-800 text-[#FACC15] disabled:opacity-40 rounded-xl transition-colors"
              title="Submit Prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
