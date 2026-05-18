import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, X, Sparkles, Sprout, Loader2 } from 'lucide-react';
import { useLanguage } from '../Context/LanguageContext';
import axios from 'axios';

const FarmingChatBot = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your Farming Assistant. Ask me anything about crops, diseases, or fertilizers!",
            sender: 'bot'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);



    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');
        setIsTyping(true);

        try {
            const response = await axios.post('http://localhost:3001/api/farmer/chat', {
                message: currentInput
            });

            const botResponse = {
                id: Date.now() + 1,
                text: response.data.reply,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (err) {
            console.error("Chat API Error:", err);
            const errorResponse = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to my brain right now. Please try again later or check your connection.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    // Use React Portal to render the Chatbot at the document body level
    // This ensures it stays on top of all other elements (z-index wise)
    return createPortal(
        <>
            {/* Floating Chat Button (Trigger) */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-farm-green to-emerald-600 text-white rounded-full shadow-lg shadow-green-500/30 z-[9999] flex items-center justify-center group"
                >
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 mr-1"></div>
                    <Sprout className="h-6 w-6 relative z-10" />
                    <span className="hidden group-hover:block ml-2 whitespace-nowrap font-medium transition-all duration-300">
                        {t('chat_button') || "Chatbot"}
                    </span>
                </motion.button>
            )}

            {/* Chat Interface Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-full max-w-sm md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden flex flex-col max-h-[600px] h-[80vh] dark:bg-slate-900 dark:border-slate-700"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-farm-green to-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Bot className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{t('chat_title') || "Farmer Assistant"}</h3>
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                                        <p className="text-xs font-medium">{t('chat_status') || "Online"}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth dark:bg-slate-800/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-farm-green to-emerald-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2 dark:bg-slate-800 dark:border-slate-700">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s] dark:bg-gray-500"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] dark:bg-gray-500"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500"></div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0 dark:bg-slate-900 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={t('chat_placeholder') || "Ask about crops, diseases..."}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green block w-full p-3 transition-shadow outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isTyping}
                                    className="p-3 disabled:opacity-50 disabled:cursor-not-allowed bg-farm-green text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>,
        document.body
    );
};

export default FarmingChatBot;
