import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Send, Mic, MicOff, ImagePlus, X, Bot, User,
    Minimize2, Maximize2, Loader2, Volume2, VolumeX, RefreshCw,
    Check, Copy, Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../Context/LanguageContext';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

// Language Config
const LANG_CONFIG = {
    EN: {
        placeholder: 'Ask about crops, diseases, fertilizers...',
        title: 'AgriBot Assistant',
        sendBtn: 'Send',
        greeting: "Hello! 🌾 I'm **AgriBot**. Ask me anything about farming!",
        thinking: 'Thinking...',
        errorMsg: 'Something went wrong. Try again.',
        copy: 'Copy',
        copied: 'Copied!'
    },
    TA: {
        placeholder: 'பயிர்கள், நோய்கள் பற்றி கேளுங்கள்...',
        title: 'AgriBot உதவியாளர்',
        sendBtn: 'அனுப்பு',
        greeting: "வணக்கம்! 🌾 நான் **AgriBot**. விவசாயம் பற்றி எதையும் கேளுங்கள்!",
        thinking: 'யோசிக்கிறது...',
        errorMsg: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
        copy: 'நகலெடு',
        copied: 'நகலெடுக்கப்பட்டது!'
    },
    HI: {
        placeholder: 'फसल, बीमारियों के बारे में पूछें...',
        title: 'AgriBot सहायक',
        sendBtn: 'भेजें',
        greeting: "नमस्ते! 🌾 मैं **AgriBot** हूं। खेती के बारे में कुछ भी पूछें!",
        thinking: 'सोच रहा है...',
        errorMsg: 'कुछ गलत हो गया। पुनः प्रयास करें।',
        copy: 'कॉपी करें',
        copied: 'कॉपी हो गया!'
    }
};

// Markdown Renderer
const MarkdownText = ({ text }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-1.5">
            {lines.map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={i} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-2 first:mt-0 tracking-wide">{line.slice(2, -2)}</div>;
                }
                if (line.includes('**')) {
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return <p key={i} className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 dark:text-white font-semibold">{part}</strong> : part)}</p>;
                }
                if (line.startsWith('- ') || line.startsWith('• ')) {
                    return <div key={i} className="flex items-start gap-2 pl-1"><span className="text-emerald-500 mt-1.5 text-[6px]">◆</span><p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{line.slice(2)}</p></div>;
                }
                if (!line.trim()) return <div key={i} className="h-1" />;
                return <p key={i} className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{line}</p>;
            })}
        </div>
    );
};

// Chat Bubble
const ChatBubble = ({ message, lang }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.EN;

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(cfg.copied);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
        >
            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20', isUser ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800')}>
                {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div className={clsx('max-w-[80%] relative group flex flex-col', isUser ? 'items-end' : 'items-start')}>
                <div className={clsx('px-4 py-3 rounded-2xl text-[13px] shadow-sm relative overflow-hidden', isUser ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm')}>
                    {isUser ? <p className="text-white relative z-10 leading-relaxed">{message.content}</p> : <MarkdownText text={message.content} />}
                    {!isUser && (
                        <button onClick={handleCopy} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-emerald-500 transition-all z-20">
                            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                    )}
                </div>
                <span className={clsx("text-[10px] text-slate-400/80 px-1 mt-1 font-medium")}>{message.time}</span>
            </div>
        </motion.div>
    );
};

// Typing Indicator
const TypingIndicator = () => (
    <div className="flex gap-2.5 items-end">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-sm border border-white/20"><Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
            {[0,1,2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />)}
        </div>
    </div>
);

// Main Floating Chatbot
const FloatingChatbot = () => {
    const { language } = useLanguage();
    const cfg = LANG_CONFIG[language] || LANG_CONFIG.EN;

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Init greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ id: 'greeting', role: 'bot', content: cfg.greeting, time: getTime() }]);
        }
    }, [isOpen, language]);

    // Auto scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Send message
    const sendMessage = useCallback(async (text) => {
        const query = (text || inputText).trim();
        if (!query && !imageFile) return;
        if (isLoading) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: query || '📷 Image',
            time: getTime(),
            imageUrl: previewImage
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setPreviewImage(null);
        setImageFile(null);
        setIsLoading(true);

        try {
            let response;
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                formData.append('language', language);
                formData.append('location', 'India');
                if (query) formData.append('message', query);
                response = await apiClient.post('/api/farmer/assistant/analyze-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (!response.data.isValidPlant) {
                    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: '❌ ' + (response.data.message || 'Not a plant image.'), time: getTime() }]);
                    return;
                }
                setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: response.data.reply, time: getTime() }]);
                setConversationHistory(prev => [...prev, { role: 'user', content: `Image: ${response.data.crop}` }, { role: 'assistant', content: response.data.reply }]);
            } else {
                response = await apiClient.post('/api/farmer/assistant/chat', { message: query, language, history: conversationHistory });
                setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: response.data.reply, time: getTime() }]);
                setConversationHistory(prev => [...prev, { role: 'user', content: query }, { role: 'assistant', content: response.data.reply }]);
            }
        } catch (err) {
            console.error('[FloatingChatbot] Error:', err);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: '🌾 ' + cfg.errorMsg, time: getTime() }]);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, imageFile, previewImage, language, conversationHistory, isLoading, cfg]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        sendMessage(inputText);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return toast.error('Select an image file.');
        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be < 5MB.');
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target.result);
        reader.readAsDataURL(file);
        toast.success('Image ready!');
    };

    const toggleVoice = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return toast.error('Voice not supported. Use Chrome/Edge.');
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'TA' ? 'ta-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => setInputText(prev => prev + (prev ? ' ' : '') + e.results[0][0].transcript);
        recognition.onerror = () => { setIsListening(false); toast.error('Voice error.'); };
        recognition.start();
    };

    const speakLastResponse = () => {
        const lastBot = [...messages].reverse().find(m => m.role === 'bot');
        if (!lastBot) return;
        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const clean = lastBot.content.replace(/\*\*/g, '').replace(/[🌾🌿🦠💊🧪🛡️🔍✓❌]/g, '');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = language === 'TA' ? 'ta-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    };

    const clearChat = () => {
        setMessages([{ id: 'greeting-reset', role: 'bot', content: cfg.greeting, time: getTime() }]);
        setConversationHistory([]);
        setInputText('');
        setPreviewImage(null);
        setImageFile(null);
    };

    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ 
                    scale: 1,
                    y: [0, -8, 0]
                }}
                transition={{
                    y: {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full shadow-2xl shadow-teal-500/40 flex items-center justify-center text-white hover:shadow-teal-500/60 transition-shadow"
                title="Open AgriBot Assistant"
            >
                <Bot className="w-7 h-7" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={clsx(
                'fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden',
                isMinimized ? 'bottom-4 right-4 sm:bottom-8 sm:right-8 w-72 sm:w-80' : 'bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100vw-32px)] sm:w-[420px] h-[600px] max-h-[85vh]'
            )}
            style={{ boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.15)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 sm:gap-3 relative z-10 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-inner">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 pr-2">
                        <h3 className="text-[12px] sm:text-[14px] font-bold text-white tracking-wide truncate">{cfg.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                            <span className="text-[9px] sm:text-[10px] text-emerald-50 font-medium tracking-wider uppercase">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 relative z-10 shrink-0">
                    <button onClick={speakLastResponse} className={clsx('p-1.5 sm:p-2 rounded-xl transition-all', isSpeaking ? 'bg-white/30 text-white animate-pulse' : 'text-emerald-50 hover:bg-white/20 hover:text-white')} title="Listen">
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                    <button onClick={clearChat} className="p-1.5 sm:p-2 rounded-xl text-emerald-50 hover:bg-white/20 hover:text-white transition-all" title="Clear">
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 sm:p-2 rounded-xl text-emerald-50 hover:bg-white/20 hover:text-white transition-all" title={isMinimized ? 'Expand' : 'Minimize'}>
                        {isMinimized ? <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 sm:p-2 rounded-xl text-emerald-50 hover:bg-rose-500 hover:text-white transition-all" title="Close">
                        <X className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent bg-slate-50/50 dark:bg-transparent relative">
                        {messages.map(msg => <ChatBubble key={msg.id} message={msg} lang={language} />)}
                        <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
                        <div ref={chatEndRef} />
                    </div>

                    {/* Image Preview */}
                    <AnimatePresence>
                        {previewImage && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shadow-inner">
                                <div className="relative">
                                    <img src={previewImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl border-2 border-emerald-500/30 shadow-sm" />
                                    <button onClick={() => { setPreviewImage(null); setImageFile(null); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Image ready for analysis</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <div className="flex items-end gap-2.5">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-sm">
                                <ImagePlus className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                                    placeholder={cfg.placeholder}
                                    disabled={isLoading}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 pr-11 text-[13px] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-inner"
                                />
                                <button type="button" onClick={toggleVoice} className={clsx('absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-all', isListening ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 animate-pulse' : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700')}>
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                            </div>
                            <button type="submit" disabled={isLoading || (!inputText.trim() && !imageFile)} className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </form>
                </>
            )}
        </motion.div>
    );
};

export default FloatingChatbot;
