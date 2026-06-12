import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Send, Mic, MicOff, ImagePlus, X, Sprout,
    Leaf, Sparkles, Volume2, VolumeX, ChevronDown, RefreshCw,
    Globe, AlertCircle, CheckCircle2, Loader2, Bot, User,
    Upload, Eye, FlaskConical, Zap, ArrowRight, Copy, Check
} from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../Context/LanguageContext';
import { API_BASE_URL } from '../../config';

const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

// ─── Language Config ──────────────────────────────────────────────────────────
const LANG_CONFIG = {
    EN: {
        placeholder: 'Ask about crops, diseases, fertilizers...',
        title: 'AI Farming Assistant',
        subtitle: 'Powered by Groq + Gemini AI',
        sendBtn: 'Send',
        greeting: "Hello! 🌾 I'm **AgriBot**, your AI farming expert. I can help you with:\n- Crop diseases & treatments\n- Fertilizer recommendations\n- Pest control methods\n- Seasonal farming guidance\n\nAsk me anything about farming!",
        imageHint: 'Upload a crop photo for instant diagnosis',
        suggested: 'Suggested Questions',
        thinking: 'AgriBot is thinking...',
        imageAnalyzing: 'Analyzing your crop image...',
        errorMsg: 'Something went wrong. Please try again.',
        copy: 'Copy',
        copied: 'Copied!'
    },
    TA: {
        placeholder: 'பயிர்கள், நோய்கள், உரங்களைப் பற்றி கேளுங்கள்...',
        title: 'AI விவசாய உதவியாளர்',
        subtitle: 'Groq + Gemini AI மூலம் இயக்கப்படுகிறது',
        sendBtn: 'அனுப்பு',
        greeting: "வணக்கம்! 🌾 நான் **AgriBot**, உங்கள் AI விவசாய நிபுணர்!\n- பயிர் நோய்கள் & சிகிச்சை\n- உர பரிந்துரைகள்\n- பூச்சி கட்டுப்பாடு\n- பருவகால விவசாய வழிகாட்டுதல்\n\nவிவசாயம் பற்றி எதையும் கேளுங்கள்!",
        imageHint: 'உடனடி நோய் கண்டறிவுக்கு பயிர் புகைப்படம் பதிவேற்றுங்கள்',
        suggested: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
        thinking: 'AgriBot யோசிக்கிறது...',
        imageAnalyzing: 'பயிர் படம் பகுப்பாய்வு செய்யப்படுகிறது...',
        errorMsg: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
        copy: 'நகலெடு',
        copied: 'நகலெடுக்கப்பட்டது!'
    },
    HI: {
        placeholder: 'फसल, बीमारियों, उर्वरकों के बारे में पूछें...',
        title: 'AI कृषि सहायक',
        subtitle: 'Groq + Gemini AI द्वारा संचालित',
        sendBtn: 'भेजें',
        greeting: "नमस्ते! 🌾 मैं **AgriBot** हूं, आपका AI कृषि विशेषज्ञ!\n- फसल रोग और उपचार\n- उर्वरक सिफारिशें\n- कीट नियंत्रण विधियां\n- मौसमी खेती मार्गदर्शन\n\nखेती के बारे में कुछ भी पूछें!",
        imageHint: 'तुरंत निदान के लिए फसल की फोटो अपलोड करें',
        suggested: 'सुझाए गए प्रश्न',
        thinking: 'AgriBot सोच रहा है...',
        imageAnalyzing: 'फसल की छवि का विश्लेषण किया जा रहा है...',
        errorMsg: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
        copy: 'कॉपी करें',
        copied: 'कॉपी हो गया!'
    }
};

// ─── Markdown Renderer (lightweight) ─────────────────────────────────────────
const MarkdownText = ({ text }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-1.5">
            {lines.map((line, i) => {
                // Bold headers like **🔍 Problem Summary**
                if (line.startsWith('**') && line.endsWith('**')) {
                    const content = line.slice(2, -2);
                    return (
                        <div key={i} className="flex items-center gap-2 mt-3 first:mt-0">
                            <span className="text-[11px] font-black text-teal-400 uppercase tracking-widest">{content}</span>
                        </div>
                    );
                }
                // Bold inline text **text**
                if (line.includes('**')) {
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return (
                        <p key={i} className="text-[13px] text-slate-300 leading-relaxed">
                            {parts.map((part, j) =>
                                j % 2 === 1
                                    ? <strong key={j} className="text-white font-bold">{part}</strong>
                                    : part
                            )}
                        </p>
                    );
                }
                // Bullet points
                if (line.startsWith('- ') || line.startsWith('• ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 pl-1">
                            <span className="text-teal-400 mt-1.5 shrink-0 text-[8px]">◆</span>
                            <p className="text-[13px] text-slate-300 leading-relaxed">{line.slice(2)}</p>
                        </div>
                    );
                }
                // Empty line
                if (!line.trim()) return <div key={i} className="h-1" />;
                // Normal line
                return <p key={i} className="text-[13px] text-slate-300 leading-relaxed">{line}</p>;
            })}
        </div>
    );
};

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
const ChatBubble = ({ message, lang, onCopy }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.EN;

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onCopy) onCopy();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={clsx('flex gap-3 w-full', isUser ? 'flex-row-reverse' : 'flex-row')}
        >
            {/* Avatar */}
            <div className={clsx(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
                isUser
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                    : 'bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-500/30'
            )}>
                {isUser
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-white" />
                }
            </div>

            {/* Bubble */}
            <div className={clsx(
                'relative max-w-[calc(100%-3rem)] flex flex-col gap-2',
                isUser ? 'items-end' : 'items-start'
            )}>
                {/* Image preview in message */}
                {message.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 max-w-[200px]">
                        <img src={message.imageUrl} alt="Uploaded crop" className="w-full h-auto object-cover" />
                    </div>
                )}

                {/* Image analysis badge */}
                {message.analysisResult && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                        <span className="px-2.5 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            🌱 {message.analysisResult.crop}
                        </span>
                        {message.analysisResult.disease && message.analysisResult.disease !== 'Healthy' && (
                            <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                🦠 {message.analysisResult.disease}
                            </span>
                        )}
                        {message.analysisResult.disease === 'Healthy' && (
                            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                ✓ Healthy
                            </span>
                        )}
                        <span className="px-2 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold rounded-full">
                            {message.analysisResult.confidence}% confidence
                        </span>
                    </div>
                )}

                <div className={clsx(
                    'px-4 py-3 rounded-2xl shadow-md group relative',
                    isUser
                        ? 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-tr-sm'
                        : 'bg-[#0B1628] border border-white/8 rounded-tl-sm'
                )}>
                    {isUser ? (
                        <p className="text-[13px] text-white leading-relaxed">{message.content}</p>
                    ) : (
                        <MarkdownText text={message.content} />
                    )}

                    {/* Copy button for bot messages */}
                    {!isUser && (
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                            title={cfg.copy}
                        >
                            {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-slate-600 font-medium px-1">
                    {message.time}
                </span>
            </div>
        </motion.div>
    );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="flex gap-3 items-end"
    >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0 border border-violet-500/30">
            <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-[#0B1628] border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-teal-400"
                        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>
        </div>
    </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AIFarmingAssistant = () => {
    const { language } = useLanguage();
    const cfg = LANG_CONFIG[language] || LANG_CONFIG.EN;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [conversationHistory, setConversationHistory] = useState([]);
    // Detect Web Speech API support once on mount
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [voiceDenied, setVoiceDenied] = useState(false);

    useEffect(() => {
        setVoiceSupported(
            typeof window !== 'undefined' &&
            !!(window.SpeechRecognition || window.webkitSpeechRecognition)
        );
    }, []);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const fetchSuggestions = useCallback(async () => {
        try {
            const res = await apiClient.get(`/api/farmer/assistant/suggestions?language=${language}`);
            if (res.data.success) setSuggestions(res.data.suggestions.slice(0, 6));
        } catch {
            setSuggestions([
                "Why are my tomato leaves turning yellow? 🍅",
                "Best fertilizer for paddy rice? 🌾",
                "How to control aphids organically? 🌿",
                "My chilli has white spots — what to do?",
                "When to sow groundnut in South India?",
                "How much water does cotton need per week?"
            ]);
        }
    }, [language]);

    // Init greeting + suggestions
    useEffect(() => {
        const greetingMsg = {
            id: 'greeting',
            role: 'bot',
            content: cfg.greeting,
            time: getTime()
        };
        setMessages([greetingMsg]);
        fetchSuggestions();
    }, [language, fetchSuggestions]);

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // ─── Send Text Message ─────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text, imageData = null) => {
        const query = (text || inputText).trim();
        if (!query && !imageData) return;
        if (isLoading) return;

        setShowSuggestions(false);

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: query || '📷 [Uploaded crop image for analysis]',
            time: getTime(),
            imageUrl: imageData?.previewUrl || null
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setPreviewImage(null);
        setImageFile(null);
        setIsLoading(true);

        try {
            let response;

            if (imageData) {
                // Image analysis
                const formData = new FormData();
                formData.append('image', imageData.file);
                formData.append('language', language);
                formData.append('location', 'India');
                if (query) {
                    formData.append('message', query);
                }

                response = await apiClient.post('/api/farmer/assistant/analyze-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (!response.data.isValidPlant) {
                    const botMsg = {
                        id: Date.now() + 1,
                        role: 'bot',
                        content: '❌ ' + (response.data.message || 'The uploaded image does not appear to contain a plant. Please upload a clear crop photo.'),
                        time: getTime()
                    };
                    setMessages(prev => [...prev, botMsg]);
                    return;
                }

                const botMsg = {
                    id: Date.now() + 1,
                    role: 'bot',
                    content: response.data.reply,
                    time: getTime(),
                    analysisResult: {
                        crop: response.data.crop,
                        disease: response.data.disease,
                        confidence: response.data.confidence,
                        status: response.data.status
                    }
                };
                setMessages(prev => [...prev, botMsg]);

                // Update history
                setConversationHistory(prev => [
                    ...prev,
                    { role: 'user', content: `Image analysis: ${response.data.crop} - ${response.data.disease}` },
                    { role: 'assistant', content: response.data.reply }
                ]);

            } else {
                // Text chat
                response = await apiClient.post('/api/farmer/assistant/chat', {
                    message: query,
                    language,
                    history: conversationHistory
                });

                const botMsg = {
                    id: Date.now() + 1,
                    role: 'bot',
                    content: response.data.reply,
                    time: getTime()
                };
                setMessages(prev => [...prev, botMsg]);

                // Update conversation history
                setConversationHistory(prev => [
                    ...prev,
                    { role: 'user', content: query },
                    { role: 'assistant', content: response.data.reply }
                ]);
            }

        } catch (err) {
            console.error('[AIFarmingAssistant] Error:', err);
            const errMsg = {
                id: Date.now() + 1,
                role: 'bot',
                content: '🌾 ' + cfg.errorMsg + ' ' + (err.response?.data?.message || ''),
                time: getTime()
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, imageFile, previewImage, language, conversationHistory, isLoading, cfg]);

    // ─── Handle Submit ─────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e?.preventDefault();
        if (imageFile) {
            sendMessage(inputText, { file: imageFile, previewUrl: previewImage });
        } else {
            sendMessage(inputText);
        }
    };

    // ─── Handle Suggested Question ─────────────────────────────────────────────
    const handleSuggestion = (suggestion) => {
        sendMessage(suggestion);
    };

    // ─── Image Upload ──────────────────────────────────────────────────────────
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB.');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target.result);
        reader.readAsDataURL(file);
        toast.success('Image ready — press Send to analyze!');
    };

    // ─── Voice Input ───────────────────────────────────────────────────────────
    const toggleVoice = () => {
        // Already listening — stop
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            // Browser does not support the API at all
            toast(
                (t) => (
                    <div className="flex flex-col gap-1">
                        <strong className="text-slate-800 text-[13px]">🎙️ Voice Not Supported</strong>
                        <p className="text-slate-600 text-[12px]">
                            Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for voice input.
                        </p>
                    </div>
                ),
                { duration: 5000, icon: '⚠️' }
            );
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'TA' ? 'ta-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceDenied(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInputText(prev => prev + (prev ? ' ' : '') + transcript);
            inputRef.current?.focus();
        };
        recognition.onerror = (e) => {
            setIsListening(false);
            if (e.error === 'not-allowed' || e.error === 'permission-denied') {
                setVoiceDenied(true);
                toast.error(
                    'Microphone access denied. Please click the 🔒 icon in your browser address bar and allow microphone.',
                    { duration: 6000 }
                );
            } else if (e.error === 'no-speech') {
                toast('No speech detected. Please speak clearly and try again.', { icon: '🎙️' });
            } else if (e.error === 'network') {
                toast.error('Network error during voice recognition. Check your internet connection.');
            } else {
                toast.error(`Voice error: ${e.error}. Please try again.`);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (err) {
            toast.error('Could not start voice recognition. Please refresh and try again.');
        }
    };

    // ─── Text to Speech ────────────────────────────────────────────────────────
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
        
        let ttsLang = language === 'TA' ? 'ta-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';
        // Auto-detect Tamil (Unicode range \u0b80-\u0bff) or Hindi (Unicode range \u0900-\u097f) characters
        if (/[\u0b80-\u0bff]/.test(clean)) {
            ttsLang = 'ta-IN';
        } else if (/[\u0900-\u097f]/.test(clean)) {
            ttsLang = 'hi-IN';
        }
        
        utterance.lang = ttsLang;
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    };

    // ─── Clear Chat ────────────────────────────────────────────────────────────
    const clearChat = () => {
        setMessages([{
            id: 'greeting-reset',
            role: 'bot',
            content: cfg.greeting,
            time: getTime()
        }]);
        setConversationHistory([]);
        setShowSuggestions(true);
        setInputText('');
        setPreviewImage(null);
        setImageFile(null);
    };

    // ─── Key handler ──────────────────────────────────────────────────────────
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div
            className="flex flex-col"
            style={{
                height: 'calc(100vh - 108px)',
                minHeight: '500px'
            }}
        >
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg shadow-teal-500/25">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight leading-none">{cfg.title}</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{cfg.subtitle}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Speak last response */}
                    <button
                        onClick={speakLastResponse}
                        className={clsx(
                            'p-2 rounded-xl border transition-all text-[11px] font-bold flex items-center gap-1.5',
                            isSpeaking
                                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        )}
                        title="Listen to last response"
                    >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Clear chat */}
                    <button
                        onClick={clearChat}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Clear conversation"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Main Layout ── */}
            <div className="flex gap-4 flex-1 min-h-0">

                {/* ── Left Panel: Suggestions + Image Upload ── */}
                <div className="hidden lg:flex flex-col gap-4 w-[calc(18rem+1vw)] flex-shrink-0">

                    {/* Image Upload Card */}
                    <div className="bg-[#080F1E] border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-violet-500/10 rounded-lg text-violet-400">
                                <Eye className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-wider">Crop Vision AI</p>
                                <p className="text-[9px] text-slate-500 font-medium">{cfg.imageHint}</p>
                            </div>
                        </div>

                        {/* Upload zone — using div to avoid button-inside-button HTML violation */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                            className={clsx(
                                'relative w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-all cursor-pointer group',
                                previewImage
                                    ? 'border-teal-500/50 bg-teal-500/5'
                                    : 'border-white/10 hover:border-teal-500/40 hover:bg-teal-500/5'
                            )}
                        >
                            {previewImage ? (
                                <>
                                    <img src={previewImage} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                                    <span className="text-[10px] text-teal-400 font-bold">✓ Image ready — press Send</span>
                                    {/* X dismiss — safe as button here since parent is a div */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setImageFile(null); }}
                                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-all"
                                        aria-label="Remove image"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-all">
                                        <ImagePlus className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <p className="text-[11px] text-slate-400 text-center font-medium">Click to upload crop photo</p>
                                    <p className="text-[9px] text-slate-600">JPG, PNG · Max 5MB</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Suggested Questions */}
                    <div className="bg-[#080F1E] border border-white/8 rounded-2xl p-4 flex flex-col gap-3 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <p className="text-[11px] font-black text-white uppercase tracking-wider">{cfg.suggested}</p>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-none">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    disabled={isLoading}
                                    className="text-left px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 hover:bg-teal-500/10 hover:border-teal-500/30 text-slate-300 hover:text-white text-[11px] font-medium transition-all leading-snug group disabled:opacity-50"
                                >
                                    <div className="flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 text-teal-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        <span>{s}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Chat Panel ── */}
                <div className="flex flex-col flex-1 min-w-0 bg-[#060D1A] border border-white/8 rounded-2xl overflow-hidden">

                    {/* Chat messages area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-none">

                        {/* Mobile suggestions (shown at top when visible) */}
                        <AnimatePresence>
                            {showSuggestions && messages.length <= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="lg:hidden"
                                >
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{cfg.suggested}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {suggestions.slice(0, 4).map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestion(s)}
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-teal-500/10 hover:border-teal-500/30 text-slate-300 hover:text-white text-[11px] font-medium rounded-full transition-all"
                                            >
                                                {s.length > 40 ? s.slice(0, 38) + '…' : s}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        {messages.map(msg => (
                            <ChatBubble
                                key={msg.id}
                                message={msg}
                                lang={language}
                                onCopy={() => toast.success(cfg.copied)}
                            />
                        ))}

                        {/* Typing indicator */}
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <TypingIndicator />
                                    <p className="text-[10px] text-slate-600 ml-11 mt-1 font-medium">
                                        {imageFile ? cfg.imageAnalyzing : cfg.thinking}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={chatEndRef} />
                    </div>

                    {/* ── Image Preview Strip (mobile) ── */}
                    <AnimatePresence>
                        {previewImage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 py-2 border-t border-white/5 bg-[#050C16] flex items-center gap-3"
                            >
                                <div className="relative shrink-0">
                                    <img src={previewImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                                    <button
                                        onClick={() => { setPreviewImage(null); setImageFile(null); }}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center"
                                    >
                                        <X className="w-2.5 h-2.5 text-white" />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-teal-400">Image selected</p>
                                    <p className="text-[10px] text-slate-500">Press Send to analyze with AI Vision</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Input Bar ── */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex-shrink-0 p-3 md:p-4 border-t border-white/5 bg-[#060D1A]"
                    >
                        <div className="flex items-end gap-2">

                            {/* Image upload button (mobile) */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-shrink-0 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-violet-400 hover:border-violet-500/40 hover:bg-violet-500/10 transition-all lg:hidden"
                            >
                                <ImagePlus className="w-4 h-4" />
                            </button>

                            {/* Text input */}
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={cfg.placeholder}
                                    disabled={isLoading}
                                    rows={1}
                                    className="w-full bg-[#0A1525] border border-white/10 focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 rounded-xl px-4 py-3 pr-12 text-[13px] text-white placeholder-slate-600 resize-none outline-none transition-all leading-relaxed disabled:opacity-60"
                                    style={{
                                        maxHeight: '120px',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'none'
                                    }}
                                    onInput={e => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                />
                                {/* Mic inside input — hidden when unsupported */}
                                {voiceSupported ? (
                                    <button
                                        type="button"
                                        onClick={toggleVoice}
                                        title={voiceDenied ? 'Microphone blocked — check browser permissions' : isListening ? 'Stop listening' : 'Start voice input'}
                                        className={clsx(
                                            'absolute right-3 bottom-3 p-1.5 rounded-lg transition-all',
                                            isListening
                                                ? 'text-rose-400 bg-rose-500/20 animate-pulse'
                                                : voiceDenied
                                                    ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                                                    : 'text-slate-500 hover:text-teal-400 hover:bg-teal-500/10'
                                        )}
                                    >
                                        {isListening
                                            ? <MicOff className="w-3.5 h-3.5" />
                                            : voiceDenied
                                                ? <MicOff className="w-3.5 h-3.5" />
                                                : <Mic className="w-3.5 h-3.5" />
                                        }
                                    </button>
                                ) : (
                                    <div
                                        title="Voice input requires Chrome or Edge browser"
                                        className="absolute right-3 bottom-3 p-1.5 rounded-lg text-slate-700 cursor-not-allowed"
                                    >
                                        <MicOff className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </div>

                            {/* Send button */}
                            <button
                                type="submit"
                                disabled={isLoading || (!inputText.trim() && !imageFile)}
                                className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
                            >
                                {isLoading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Send className="w-4 h-4" />
                                }
                            </button>
                        </div>

                        {/* Keyboard hint */}
                        <p className="text-[9px] text-slate-700 mt-1.5 text-center font-medium">
                            Press <kbd className="px-1 py-0.5 bg-white/5 rounded text-[8px] border border-white/10">Enter</kbd> to send
                            &nbsp;·&nbsp;
                            <kbd className="px-1 py-0.5 bg-white/5 rounded text-[8px] border border-white/10">Shift+Enter</kbd> for new line
                            &nbsp;·&nbsp;
                            {voiceSupported ? '🎙️ Voice input available' : '⚠️ Voice: use Chrome or Edge'}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIFarmingAssistant;
