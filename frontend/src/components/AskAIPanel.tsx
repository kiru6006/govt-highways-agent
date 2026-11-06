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
          className="fixed bottom-6 right-6 bg-[#006A4E] hover:bg-[#00553E] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 z-40 transition-all transform hover:scale-105 border-2 border-white/30"
          title="Open TN-HDOS Ask AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFCC00] rounded-full ring-2 ring-[#006A4E]" />
          </div>
          <span className="font-semibold text-xs tracking-wide">Ask AI Assistant</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Demo</span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 md:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="bg-[#006A4E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">Ask AI Intelligence</h3>
                  <span className="bg-[#FFCC00] text-[#996600] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Demo Mode
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  Context: <span className="font-semibold">{currentScreenName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Statutory Disclaimer Alert */}
          <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 flex items-center gap-2 text-[10px] text-amber-800 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>AI assistance is for decision support only. Official approvals require statutory digital signatures.</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    m.role === 'user'
                      ? 'bg-[#006A4E] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                  {/* Grounding & Evidence Box */}
                  {m.result?.grounding_references && m.result.grounding_references.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#006A4E]" />
                        Grounding Evidence & Records:
                      </div>
                      <div className="space-y-1">
                        {m.result.grounding_references.map((g, gIdx) => (
                          <div key={gIdx} className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[10px]">
                            <span className="font-semibold text-slate-900">{g.type} ({g.reference}):</span>{' '}
                            <span className="text-slate-600">{g.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Actions */}
                  {m.result?.suggested_actions && (
                    <div className="mt-2 pt-1.5 flex flex-wrap gap-1">
                      {m.result.suggested_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className="bg-emerald-50 text-[#006A4E] border border-[#B2DFCD] text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                        >
                          → {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <Sparkles className="w-4 h-4 text-[#006A4E] animate-spin" />
                <span>Analyzing departmental highway data...</span>
              </div>
            )}
          </div>

          {/* Quick Suggested Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              Suggested queries:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestedQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-md transition-colors font-medium border border-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about road assets, delays, or clearances..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="bg-[#006A4E] hover:bg-[#00553E] disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

