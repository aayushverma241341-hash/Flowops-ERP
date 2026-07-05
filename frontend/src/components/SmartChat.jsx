import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Database } from 'lucide-react';
import axios from 'axios';

const SmartChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: "Hello! I am your Universal Data Agent. I have full read and write access to the FlowOps database. Ask me to query data, run reports, or add/delete records!" }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const updatedMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send to backend
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        history: messages
      });

      if (response.data.text) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          parts: [{ text: response.data.text }],
          isOffline: response.data.isOffline
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "❌ Connection error. Is the backend server running?" }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown Parser for bold text and newlines
  const parseMarkdown = (text) => {
    let parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsedText = parsedText.replace(/\n/g, '<br/>');
    return { __html: parsedText };
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 z-50 hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200 transition-all duration-300 animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-4 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-indigo-500/30 p-2 rounded-lg backdrop-blur-sm">
                <Database size={20} className="text-indigo-200" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">FlowOps Data Agent</h3>
                <p className="text-xs text-indigo-200 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  Gemini API Connected
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-indigo-300'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : msg.isOffline 
                        ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-bl-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                  }`}>
                    <div dangerouslySetInnerHTML={parseMarkdown(msg.parts[0].text)} />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={18} className="text-indigo-300" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex space-x-1 shadow-sm">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your database..."
                disabled={isLoading}
                className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full px-4 py-2.5 text-sm transition-all outline-none text-slate-700 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartChat;
