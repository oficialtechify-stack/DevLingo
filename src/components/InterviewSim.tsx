import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Terminal, 
  Sparkles, 
  ChevronLeft,
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Briefcase,
  Layers,
  Award,
  HelpCircle,
  MessageSquareCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateContent, sendChatMessage, ChatMessage, JobAnalysis } from '../services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InterviewSimProps {
  onClose: () => void;
  userArea?: string;
  userId?: string;
  jobContext?: JobAnalysis | null;
  onEarnXp?: (amount: number) => void;
}

export const InterviewSim: React.FC<InterviewSimProps> = ({ 
  onClose, 
  userArea = "Software Engineering", 
  userId, 
  jobContext,
  onEarnXp 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [earnedXpToast, setEarnedXpToast] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [showJobDrawer, setShowJobDrawer] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const companyName = jobContext?.company || "Global International Enterprise";
  const targetRole = jobContext?.roleTitle || (userArea.includes('Developer') || userArea.includes('Engineer') ? userArea : `${userArea} Specialist`);
  const techStackList = jobContext?.techStack?.join(', ') || "Key Tools, Methodologies, Systems";

  const systemInstruction = `
    Você é um Entrevistador Sênior e Líder de Contratação Global para a vaga de "${targetRole}" na empresa "${companyName}".
    As ferramentas, habilidades e stack exigidas são: ${techStackList}.
    ${jobContext?.summary ? `Contexto da vaga: ${jobContext.summary}` : ''}
    ${jobContext?.keyTopics ? `Tópicos chave esperados na entrevista: ${jobContext.keyTopics.join('; ')}` : ''}

    Regras da Simulação:
    1. Conduza a entrevista em INGLÊS profissional de alto nível, calibrado exatamente para a área da vaga (Engenharia de Software, Design UI/UX, Audiovisual/Filmmaking, Administração & Finanças, Produto ou Marketing).
    2. Avalie as respostas do candidato com foco em tom de senioridade, decisões práticas, métricas de impacto, trade-offs e vocabulário técnico/executivo natural da profissão.
    3. Em CADA resposta do recrutador, inclua:
       - Um breve feedback sobre o que o candidato falou e a próxima pergunta em inglês.
       - Um bloco explicativo e construtivo com a tag "💡 *English Pro-Tip:*" dando uma sugestão prática de como um profissional Staff/Senior/Executivo formularia aquela ideia com vocabulário em inglês mais assertivo e persuasivo.
    4. Se o usuário falar em português ou pedir ajuda, encoraje-o com carinho em português e forneça a tradução técnica ideal antes de continuar em inglês.
  `;

  // Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // English interview

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Reconhecimento de voz não é suportado pelo seu navegador neste momento. Você pode digitar sua resposta!");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  // Text-To-Speech (Recruiter Voice)
  const speakText = (text: string) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // stop previous speech

    // Clean markdown/tips from text for natural speech
    const cleanSpeech = text
      .replace(/💡[\s\S]*$/g, '')
      .replace(/[*_#`]/g, '')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'en-US';
    utterance.rate = 0.95; // realistic cadence

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isStarted) {
      startInterview();
    }
  }, [isStarted]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const initialPrompt = jobContext?.firstQuestion 
        ? `Start the technical interview for the ${targetRole} role at ${companyName}. Open with this question: "${jobContext.firstQuestion}"`
        : `Start the technical interview for the ${targetRole} position at ${companyName}. Introduce yourself as the Senior Engineering Manager and ask the first technical question about their recent projects and architectural trade-offs.`;

      const response = await generateContent(initialPrompt, systemInstruction);
      const recruiterText = response.text || `Welcome to ${companyName}! We are excited to interview you for the ${targetRole} position. Could you introduce yourself and walk me through a technical architecture you designed recently?`;
      
      setMessages([{ role: 'model', parts: [{ text: recruiterText }] }]);
      setIsStarted(true);
      speakText(recruiterText);
    } catch (error) {
      console.error(error);
      const fallbackText = `Hello! Welcome to ${companyName}. I am the hiring manager for the ${targetRole} role. To get started, could you tell me about a high-scale system you worked on and the main technical trade-offs you faced?`;
      setMessages([{ role: 'model', parts: [{ text: fallbackText }] }]);
      setIsStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentInput = input;
    const userMsg: ChatMessage = { role: 'user', parts: [{ text: currentInput }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(currentInput, messages, systemInstruction);
      const modelText = response.text;
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: modelText }] }]);
      speakText(modelText);

      // Award XP for answering technical questions
      const earned = 50;
      setEarnedXpToast(earned);
      if (onEarnXp) {
        onEarnXp(earned);
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });

      setTimeout(() => setEarnedXpToast(null), 3500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#07070c] flex flex-col text-white overflow-hidden"
    >
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-pink-600 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 p-4 md:px-8 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-bold text-sm">Dashboard</span>
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Job Target Badge */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-wide">{companyName}</span>
                {jobContext?.level && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.2 rounded-full font-bold border border-purple-500/30">
                    {jobContext.level}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50 truncate max-w-xs">{targetRole}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & XP Indicator */}
        <div className="flex items-center gap-3">
          {jobContext && (
            <button
              onClick={() => setShowJobDrawer(!showJobDrawer)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden md:inline">Ver Requisitos da Vaga</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsSpeechEnabled(!isSpeechEnabled);
              if (isSpeechEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            title={isSpeechEnabled ? "Desativar áudio do recrutador" : "Ativar áudio do recrutador"}
            className={cn(
              "p-2 rounded-xl border transition-all",
              isSpeechEnabled 
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            )}
          >
            {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {earnedXpToast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                +{earnedXpToast} XP Ganho!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Chat Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full"
        >
          {/* Welcome Alert */}
          <div className="glass-card p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 text-xs text-purple-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-white block font-bold">Simulação Ativa com IA: {targetRole} @ {companyName}</strong>
                <span>Fale ou digite em inglês. A IA fornecerá dicas de vocabulário e +50 XP a cada resposta!</span>
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "flex flex-col gap-2 max-w-[90%] md:max-w-[85%]",
                    isUser ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/40 px-1">
                    {isUser ? (
                      <span>Você (Candidato)</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-purple-400">
                        <Building2 className="w-3.5 h-3.5" /> Recrutador @ {companyName}
                      </span>
                    )}
                  </div>

                  <div className={cn(
                    "p-5 md:p-6 rounded-3xl leading-relaxed text-sm md:text-base border shadow-xl relative",
                    isUser 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-white/20 glow-purple font-medium" 
                      : "glass-card text-white/90 border-white/10 bg-slate-900/80"
                  )}>
                    <div className="whitespace-pre-wrap">
                      {msg.parts[0].text}
                    </div>

                    {!isUser && isSpeechEnabled && (
                      <button
                        onClick={() => speakText(msg.parts[0].text)}
                        title="Ouvir pronúncia novamente"
                        className="mt-3 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Ouvir em Inglês
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-purple-300 text-sm italic font-medium p-4 glass-card rounded-2xl w-fit border border-purple-500/20 bg-purple-950/30"
            >
              <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
              <span>O Recrutador da {companyName} está avaliando sua resposta técnica...</span>
            </motion.div>
          )}
        </div>

        {/* Job Details Drawer (if toggled) */}
        <AnimatePresence>
          {showJobDrawer && jobContext && (
            <motion.aside
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-80 border-l border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 overflow-y-auto space-y-6 hidden lg:block"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-pink-400" />
                  Mapeamento da Vaga
                </h4>
                <button 
                  onClick={() => setShowJobDrawer(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Empresa & Cargo</span>
                <p className="font-bold text-white text-base">{jobContext.roleTitle}</p>
                <p className="text-xs text-pink-400 font-semibold">{jobContext.company} • {jobContext.level}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Tech Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {jobContext.techStack.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Dica STAR da IA</span>
                <p className="text-xs text-purple-200 leading-relaxed bg-purple-950/40 p-3 rounded-xl border border-purple-500/20">
                  {jobContext.starTip}
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Input Area */}
      <footer className="relative z-10 p-4 md:p-6 bg-[#07070c]/90 backdrop-blur-2xl border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative flex items-center gap-3">
            {/* Voice Input Button */}
            <button
              onClick={toggleRecording}
              title={isRecording ? "Parar de falar" : "Falar em Inglês (Voz)"}
              className={cn(
                "p-4 rounded-2xl font-bold transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-lg",
                isRecording 
                  ? "bg-rose-600 text-white animate-pulse shadow-[0_0_25px_rgba(225,29,72,0.6)] scale-105" 
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              )}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-pink-400" />}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isRecording ? "Ouvindo sua resposta em inglês..." : "Fale ou digite sua resposta técnica em inglês..."}
                className="w-full bg-white/5 border border-white/15 p-4 pr-14 rounded-2xl outline-none focus:border-purple-500 transition-all text-sm md:text-base font-medium placeholder-white/40"
              />

              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white hover:opacity-90 transition-all disabled:opacity-30 shadow-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/40 px-2 pt-1">
            <span>{isRecording ? "🎙️ Gravando... Fale claramente em inglês." : "💡 Dica: Use termos técnicos como 'scalability', 'trade-offs' e 'p99 latency'."}</span>
            <span className="text-amber-300 font-semibold">+50 XP por resposta</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
