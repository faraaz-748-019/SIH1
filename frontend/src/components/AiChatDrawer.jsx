import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';
import { queryAiAssistant } from '../services/api';

export default function AiChatDrawer({ isOpen, onClose, scanSummary }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm the **CRYPTOSCOPE Cryptographic AI Assistant**. I analyze your scan's grounded findings, explain risk factors, calculate Mosca's theorem, and recommend NIST PQC migration pathways. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Why is RSA-1024 high risk?",
    "What breaks if I change DES?",
    "Explain Mosca's theorem for this repo",
    "Recommend PQC replacement for ECDSA"
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || !scanSummary) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await queryAiAssistant(scanSummary.scan_id, text);
      const assistantMsg = {
        role: 'assistant',
        content: res.answer,
        grounding: res.grounding_findings
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I encountered an error retrieving grounded cryptographic insights for this scan."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-lg bg-dark-800 border-l border-slate-700/80 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-dark-900/90 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow-purple/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Crypto Copilot</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Grounded</span>
              </h3>
              <p className="text-[11px] text-slate-400">Zero hallucinations • Scan-grounded context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30'
                  : 'bg-dark-700/80 text-slate-200 border border-slate-700/60 shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap font-sans">
                  {m.content}
                </div>

                {m.grounding && m.grounding.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                      Evidence Citations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {m.grounding.map((g, gIdx) => (
                        <span key={gIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-cyan-300 border border-slate-700">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-dark-700/80 text-xs text-slate-400 border border-slate-700/60 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Analyzing CBOM & cryptographic risk matrix...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 border-t border-slate-700/40 bg-dark-900/60">
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400" /> Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-dark-700 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-cyan-300 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-dark-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask why an asset is risky or what breaks if changed..."
              className="flex-1 bg-dark-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-glow-purple/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
