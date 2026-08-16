import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Terminal, 
  Trophy, 
  MessageSquare, 
  User as UserIcon, 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  ChevronRight, 
  Star, 
  Zap, 
  Mic,
  Mic2,
  CheckCircle2,
  LogOut,
  Github,
  Search,
  Sparkles,
  Shield,
  ShieldCheck,
  Flame,
  Users,
  UserPlus
} from 'lucide-react';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { InterviewSim } from './components/InterviewSim';
import { StreakCard } from './components/StreakCard';
import { LessonModal, LESSON_TRACKS, LessonTrack } from './components/LessonModal';
import { LinkedInJobInput } from './components/LinkedInJobInput';
import { PreRegistrationModal } from './components/PreRegistrationModal';
import { AdminLeadsModal } from './components/AdminLeadsModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AnimatedReveal } from './components/AnimatedReveal';
import { JobAnalysis, UserProfile, ChatMessage, PreRegistrationLead } from './types';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Contexts ---
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetToZero: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (u) {
        const userDoc = doc(db, 'users', u.uid);
        unsubscribeDoc = onSnapshot(userDoc, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore user sync error:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, data);
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const resetToZero = async () => {
    if (!user) return;
    try {
      const userDoc = doc(db, 'users', user.uid);
      const resetData: Partial<UserProfile> = {
        level: 1,
        xp: 0,
        streak: 0,
        streakShieldActive: false,
        lostStreak: 0,
        issuesResolved: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        completedLessons: [],
        reviewedWords: []
      };
      await updateDoc(userDoc, resetData);
      setProfile(prev => prev ? { ...prev, ...resetData } : null);
    } catch (err) {
      console.error("Failed to reset profile to zero:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, updateProfile, resetToZero }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext)!;

// --- Components ---

const Navbar = ({ onOpenPreReg }: { onOpenPreReg?: () => void }) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#07070c]/90 border-b border-white/10 backdrop-blur-xl">
      <div className="container-wide h-16 flex items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="text-white font-extrabold text-xl sm:text-2xl tracking-tight">DevLingo</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-white/70 text-sm font-semibold">
          <a href="#solucoes" className="hover:text-white transition-colors">Como Funciona</a>
          <a href="#preview" className="hover:text-white transition-colors">Preview</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={onOpenPreReg}
            className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-purple-500/30 cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pré-Registro</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="font-bold text-white text-base md:text-lg group-hover:text-purple-300 transition-colors pr-4">{question}</span>
        <ChevronRight className={cn("w-5 h-5 text-white/50 transition-transform flex-shrink-0 duration-200", isOpen && "rotate-90 text-pink-400")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-slate-300 leading-relaxed text-sm md:text-base font-normal">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = () => {
  const { signIn } = useAuth();
  const [guestInterviewJob, setGuestInterviewJob] = useState<JobAnalysis | null>(null);
  const [guestInterviewOpen, setGuestInterviewOpen] = useState(false);
  const [isPreRegOpen, setIsPreRegOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Atalho secreto do Admin: Shift + Ctrl + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verifica se Shift + Ctrl + 'a' ou 'A' foram pressionados simultaneamente
      if (e.shiftKey && (e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) {
        e.preventDefault();
        setIsAdminAuthOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Proteção contra cópia do site
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('input, textarea')) {
        e.preventDefault();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('input, textarea')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, []);
  
  if (guestInterviewOpen) {
    return (
      <InterviewSim
        jobContext={guestInterviewJob}
        userArea={guestInterviewJob?.roleTitle || "Fullstack"}
        onClose={() => setGuestInterviewOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07070c] text-white flex flex-col selection:bg-purple-600 selection:text-white relative">
      <Navbar 
        onOpenPreReg={() => setIsPreRegOpen(true)}
      />
      
      {/* Hero Section */}
      <section className="w-full max-w-full hero-gradient pt-32 sm:pt-36 pb-20 sm:pb-28 text-center text-white relative px-4 sm:px-6 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500 rounded-full blur-[120px] sm:blur-[140px] animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-pink-500 rounded-full blur-[120px] sm:blur-[140px] animate-pulse" />
        </div>

        <div className="container-wide relative z-10 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
          <AnimatedReveal direction="up" delay={0.1}>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold max-w-5xl mx-auto leading-[1.15] tracking-tight text-white px-2">
              Passe na entrevista em inglês das maiores <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Big Techs do mundo.</span>
            </h1>
          </AnimatedReveal>
          
          <AnimatedReveal direction="up" delay={0.2}>
            <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal px-2">
              Cole o link ou texto da vaga do LinkedIn. Ao analisar os requisitos técnicos, faça seu pré-cadastro gratuito para calibrar as perguntas com base na sua stack de linguagens e cursos.
            </p>
          </AnimatedReveal>

          {/* Interactive LinkedIn Job Input Component */}
          <AnimatedReveal direction="up" delay={0.4} className="pt-2">
            <LinkedInJobInput
              onStartSimulation={(job) => {
                setGuestInterviewJob(job);
                setIsPreRegOpen(true);
              }}
            />
          </AnimatedReveal>
        </div>
      </section>

      {/* Problem Section */}
      <section id="solucoes" className="w-full max-w-full section-padding bg-[#0a0914] border-t border-b border-white/5 relative overflow-hidden">
        <div className="container-wide text-center space-y-12 sm:space-y-16">
          <AnimatedReveal direction="up">
            <div className="space-y-4">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" /> O Problema Real
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white">
                Você domina a Stack,<br /> mas o seu inglês te trava na hora da entrevista?
              </h2>
              <p className="text-slate-300 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
                Você lê documentação em inglês o dia todo sem problemas. Mas na hora de defender uma decisão de arquitetura para um Tech Lead gringo, a história é outra. <span className="font-bold text-white">Não é falta de capacidade técnica, é a falta de prática de fala sob pressão técnica.</span>
              </p>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-left">
            <AnimatedReveal direction="up" delay={0.15}>
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  A Armadilha do "Inglês Passivo de Documentação"
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  O seu vocabulário técnico hoje é gigantesco, mas ele é <span className="italic text-pink-300 font-medium">passivo</span>. Quando você precisa defender o uso de microsserviços, cache distribuído ou passar pelo temido <span className="font-bold text-white">Behavioral Fit (Método STAR)</span>, o cérebro trava na tradução. A DevLingo é o simulador que transforma seu inglês passivo em fala destravada.
                </p>

                <div className="space-y-4 pt-1">
                  {/* Item 1 */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>Leitura & Código (Passivo)</span>
                      </span>
                      <span className="text-blue-400 font-mono font-bold">90%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "90%" }}
                        viewport={{ once: false }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-blue-500 shadow-sm"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Ler documentações, Stack Overflow e código-fonte.</p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 rounded-2xl bg-pink-500/[0.04] border border-pink-500/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
                      <span className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-pink-400" />
                        <span>Prática de Conversação (Ativo)</span>
                      </span>
                      <span className="text-pink-400 font-mono font-bold">10%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-pink-500/20">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "10%" }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm"
                      />
                    </div>
                    <p className="text-[11px] text-pink-300/80">Onde a maioria trava: simular respostas sob pressão técnica.</p>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
            
            <AnimatedReveal direction="up" delay={0.25}>
              <div className="glass-card rounded-3xl p-6 sm:p-8 border-white/10 bg-[#0d0f1a] relative shadow-2xl flex flex-col justify-between gap-6">
                {/* Header do Card */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Diagnóstico de Fluência</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold">
                    Destrave seu Speaking
                  </span>
                </div>

                {/* Área dos Gráficos com Proporções Claras */}
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end h-44 sm:h-48 px-4">
                    {/* Coluna 1: Passivo */}
                    <div className="flex flex-col items-center justify-end h-full gap-3">
                      <span className="text-xs font-mono font-bold text-blue-400">90%</span>
                      <div className="w-full max-w-[80px] bg-blue-500/10 rounded-2xl p-1.5 border border-blue-500/30 flex flex-col justify-end h-32">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: "90%" }}
                          viewport={{ once: false }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="w-full bg-blue-500 rounded-xl"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-300 text-center">Leitura Passiva</span>
                    </div>

                    {/* Coluna 2: Ativo */}
                    <div className="flex flex-col items-center justify-end h-full gap-3">
                      <span className="text-xs font-mono font-bold text-pink-400">10%</span>
                      <div className="w-full max-w-[80px] bg-pink-500/10 rounded-2xl p-1.5 border border-pink-500/30 flex flex-col justify-end h-32">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: "18%" }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                          className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-xl"
                        />
                      </div>
                      <span className="text-xs font-bold text-pink-300 text-center">Fala Ativa</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé Informativo */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A DevLingo equilibra essa proporção para você falar com a mesma naturalidade com que lê código.
                  </p>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="w-full max-w-full section-padding bg-[#07070c] relative overflow-hidden">
        <div className="container-wide text-center space-y-12 sm:space-y-16">
          <AnimatedReveal direction="up">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white">O Que Torna a DevLingo Única</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">Três pilares inteligentes que preparam você para qualquer processo seletivo internacional.</p>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Code2, 
                title: "IA Que Simula o Tech Recruiter", 
                desc: "Esqueça cursinhos de inglês genéricos. A nossa IA assume a persona de um Engineering Manager de Big Tech. Gagueje, erre tempos verbais e treine à vontade num ambiente seguro.",
                color: "bg-purple-500/20 text-purple-300 border-purple-500/30"
              },
              { 
                icon: Github, 
                title: "Entrevistas Vaga-Específicas", 
                desc: "Cada entrevista é única. A IA lê a descrição da vaga que você colar do LinkedIn e gera perguntas focadas na sua stack real (React, AWS, Node, Go, Python, etc).",
                color: "bg-pink-500/20 text-pink-300 border-pink-500/30",
                primary: true
              },
              { 
                icon: Mic2, 
                title: "Treine Sua Fala por Voz", 
                desc: "Responda pelo microfone em inglês. A IA transcreve sua resposta, avalia a clareza técnica e devolve sugestões com vocabulário de desenvolvedor sênior nativo.",
                color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
              }
            ].map((card, i) => (
              <AnimatedReveal key={i} direction="up" delay={i * 0.15}>
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={cn(
                    "p-8 rounded-3xl text-left space-y-6 transition-all border outline-none h-full relative group cursor-default",
                    card.primary 
                      ? "bg-gradient-to-b from-purple-900/50 to-slate-900/90 border-purple-500/40 shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400" 
                      : "glass-card border-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-900/20"
                  )}
                >
                  <div className={cn("p-3 rounded-2xl w-fit border transition-transform duration-300 group-hover:scale-110", card.color)}>
                    <card.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {card.desc}
                  </p>
                  {card.primary && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["System Design", "Behavioral Fit", "STAR Method"].map(t => (
                        <span key={t} className="text-[10px] font-bold uppercase bg-white/10 px-2.5 py-1 rounded-md text-purple-200 border border-white/5">{t}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="section-padding bg-[#0a0914] border-t border-b border-white/5 relative overflow-hidden">
        <div className="container-wide space-y-16">
          <AnimatedReveal direction="up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" /> Como Funciona
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white">3 Passos Para<br /><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Destravar Seu Inglês Técnico</span></h2>
              </div>
              <p className="text-slate-400 text-sm md:text-base max-w-sm">Cole o link da vaga e receba feedback detalhado de pronúncia e vocabulário.</p>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Cole a Vaga do LinkedIn", 
                desc: "Cole a URL ou descrição da vaga dos seus sonhos (Stripe, Nubank, Vercel, Uber, etc).",
                icon: Github
              },
              { 
                step: "02", 
                title: "Simule a Entrevista por Voz", 
                desc: "A IA processa os requisitos técnicos e conduz uma entrevista ao vivo com perguntas de arquitetura e fit cultural.",
                icon: Zap
              },
              { 
                step: "03", 
                title: "Receba Dicas Sênior", 
                desc: "A cada resposta, receba dicas de como engenheiros Staff formulariam as ideias com vocabulário mais assertivo.",
                icon: CheckCircle2
              }
            ].map((step, i) => (
              <AnimatedReveal key={i} direction="up" delay={i * 0.15}>
                <motion.div 
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="glass-card p-8 rounded-3xl border-white/10 flex flex-col gap-6 relative group hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-900/20 transition-all h-full cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:scale-110 transition-transform">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black text-white/20 group-hover:text-purple-400 transition-colors font-mono">{step.step}</div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">{step.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Preview */}
      <section id="preview" className="section-padding bg-[#07070c] relative">
        <div className="container-wide text-center space-y-16">
          <AnimatedReveal direction="up">
            <div className="space-y-4">
               <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Preview da Experiência
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">Veja Como É a Simulação</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">Perguntas contextualizadas com sua stack e feedbacks com vocabulário técnico refinado.</p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal direction="up" delay={0.2}>
            <div className="max-w-4xl mx-auto p-4 md:p-8 rounded-[2.5rem] glass-card border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-950/80 shadow-2xl relative">
              <div className="bg-slate-900/90 rounded-2xl overflow-hidden text-left border border-white/10 shadow-2xl">
                <div className="bg-slate-950/90 p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Technical Interview — Senior Fullstack (Stripe)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="w-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="p-6 border-r border-white/10 bg-slate-950/50 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" /> Cenário Ativo
                      </div>
                      <h4 className="font-bold text-sm text-white">System Design & Latency</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">O entrevistador quer saber como você lida com picos de latência e concorrência em transações de pagamento.</p>
                    </div>

                    {/* Audio Wave Visualizer Simulation */}
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold">
                        <span>AI Voice Stream</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Live</span>
                      </div>
                      <div className="flex items-center gap-1 h-5 justify-between">
                        {[40, 75, 55, 90, 45, 80, 60, 95, 50, 70, 85, 40, 65, 80].map((h, idx) => (
                          <motion.div
                            key={idx}
                            animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                            transition={{
                              duration: 0.8 + (idx % 4) * 0.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: idx * 0.05
                            }}
                            className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-100 text-sm">
                        <p className="font-medium">"Welcome! Could you explain how you would design an idempotent payment processing pipeline to prevent duplicate charges during network timeouts?"</p>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>English Pro-Tip da IA:</span>
                          <span className="inline-block w-1.5 h-3 bg-pink-400 animate-pulse" />
                        </span>
                        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
                          "We implemented distributed locks with Redis and stored an <span className="text-purple-300 font-bold">idempotency key</span> in PostgreSQL with strict ACID transactions."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-padding bg-[#0a0914] border-t border-white/5">
        <div className="container-wide max-w-3xl space-y-12">
          <AnimatedReveal direction="up">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">Perguntas Frequentes</h2>
              <p className="text-slate-400">Tire suas dúvidas sobre o simulador com IA.</p>
            </div>
          </AnimatedReveal>
          
          <AnimatedReveal direction="up" delay={0.2}>
            <div className="glass-card p-6 md:p-8 rounded-3xl border-white/10">
              <FaqItem 
                question="A IA entende de programação e arquitetura de verdade?" 
                answer="Sim! Nossa IA é alimentada com modelos de última geração (Gemini 2.5 Flash), treinada com trilhões de tokens de código, System Design, trade-offs de escalabilidade e metodologia STAR de entrevistas internacionais."
              />
              <FaqItem 
                question="Como funciona a simulação com a vaga do LinkedIn?" 
                answer="Basta colar o link ou a descrição da vaga. A IA extrai automaticamente a empresa, requisitos de stack e senioridade, assumindo a persona do Tech Recruiter daquela empresa específica."
              />
              <FaqItem 
                question="Preciso pagar para simular?" 
                answer="Não! Você pode testar simulações completas gratuitamente por voz e texto diretamente na plataforma."
              />
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#07070c] border-t border-white/10 pt-16 pb-12">
        <div className="container-wide grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-2xl text-white tracking-tight">DevLingo</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma para desenvolvedores destravarem o inglês técnico para vagas internacionais.
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">Recursos</h4>
            <div className="flex flex-col gap-2 text-slate-400">
              <button 
                onClick={() => setIsPreRegOpen(true)}
                className="text-left hover:text-pink-300 transition-colors cursor-pointer"
              >
                Formulário de Pré-Registro
              </button>
              <a href="#solucoes" className="hover:text-purple-300 transition-colors">Simulador com IA</a>
              <a href="#preview" className="hover:text-purple-300 transition-colors">Analisador de Vagas LinkedIn</a>
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-400">
             <h4 className="font-bold text-white uppercase tracking-wider">DevLingo</h4>
             <p>© 2026 DevLingo. Fluência técnica para desenvolvedores.</p>
          </div>
        </div>
      </footer>

      {/* Pre-Registration Modal */}
      <PreRegistrationModal
        isOpen={isPreRegOpen}
        onClose={() => setIsPreRegOpen(false)}
        jobAnalysis={guestInterviewJob}
        onSuccess={(lead) => {
          console.log("Pré-registro realizado com sucesso:", lead);
        }}
      />

      {/* Admin Password Gate Modal */}
      <AdminPasswordModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Leads Dashboard Modal */}
      <AdminLeadsModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />
    </div>
  );
};

const Onboarding = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.displayName || '');
  const [area, setArea] = useState('');
  
  const finishOnboarding = async () => {
    if (!user) return;
    const profile: UserProfile = {
      uid: user.uid,
      name,
      email: user.email || '',
      area,
      level: 1,
      xp: 0,
      streak: 0,
      streakShieldActive: false,
      lostStreak: 0,
      issuesResolved: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      completedLessons: [],
      reviewedWords: [],
      techStack: [],
      onboarded: true
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary/10 via-bg-dark to-bg-dark">
      <motion.div 
        layout
        className="glass-card w-full max-w-lg p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 code-font text-brand-secondary">
                <span className="opacity-50"># onboarding.tsx</span>
              </div>
              <h2 className="text-3xl font-bold">Qual seu nome, dev?</h2>
              <div className="space-y-2">
                <p className="code-font text-sm text-white/40">const devName = </p>
                <input 
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='"Seu nome aqui"'
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl code-font focus:border-brand-primary outline-none transition-colors"
                />
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!name}
                className="w-full py-4 bg-brand-primary font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Continuar();
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 code-font text-brand-secondary">
                <span className="opacity-50"># stack_selector.ts</span>
              </div>
              <h2 className="text-3xl font-bold">Qual sua stack principal?</h2>
              <div className="grid grid-cols-2 gap-3">
                {["Frontend", "Backend", "Full-Stack", "DevOps", "Mobile", "Data"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-sm font-medium",
                      area === a ? "bg-brand-primary/20 border-brand-primary" : "glass-card border-white/5 hover:border-white/20"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button 
                onClick={finishOnboarding}
                disabled={!area}
                className="w-full py-4 bg-brand-primary font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                Finalizar Build & Começar.
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { profile, logout, updateProfile, resetToZero } = useAuth();
  const [view, setView] = useState<'dashboard' | 'interview'>('dashboard');
  const [activeLessonTrack, setActiveLessonTrack] = useState<LessonTrack | null>(null);
  const [activeJobContext, setActiveJobContext] = useState<JobAnalysis | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];
  const isWordReviewed = Boolean(profile?.reviewedWords?.includes(todayDate));

  const handleReviewWord = async () => {
    if (!profile || isWordReviewed) return;
    const addedXp = 25;
    const newXp = (profile.xp || 0) + addedXp;
    const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);
    const newStreak = Math.max(1, (profile.streak || 0) + (profile.streak === 0 ? 1 : 0));
    const newIssues = (profile.issuesResolved || 0) + 1;
    const updatedWords = [...(profile.reviewedWords || []), todayDate];

    await updateProfile({
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      issuesResolved: newIssues,
      reviewedWords: updatedWords
    });
  };

  const handleCompleteLesson = async (results: {
    trackId: string;
    xpEarned: number;
    correctCount: number;
    totalCount: number;
  }) => {
    if (!profile) return;
    const newXp = (profile.xp || 0) + results.xpEarned;
    const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);
    const newStreak = Math.max(1, (profile.streak || 0) + (profile.streak === 0 ? 1 : 0));
    const newIssues = (profile.issuesResolved || 0) + results.correctCount;
    const newCorrect = (profile.correctAnswers || 0) + results.correctCount;
    const newTotal = (profile.totalAnswers || 0) + results.totalCount;
    const newCompleted = Array.from(new Set([...(profile.completedLessons || []), results.trackId]));

    await updateProfile({
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      issuesResolved: newIssues,
      correctAnswers: newCorrect,
      totalAnswers: newTotal,
      completedLessons: newCompleted
    });
  };

  const handleResetConfirm = async () => {
    setResetting(true);
    await resetToZero();
    setResetting(false);
    setShowSettingsModal(false);
  };
  
  if (view === 'interview') {
    return (
      <InterviewSim 
        userArea={profile?.area || 'Full-Stack'} 
        userId={profile?.uid}
        jobContext={activeJobContext}
        onEarnXp={async (amount) => {
          if (profile) {
            const newXp = (profile.xp || 0) + amount;
            const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);
            const newStreak = Math.max(1, (profile.streak || 0) + (profile.streak === 0 ? 1 : 0));
            const newIssues = (profile.issuesResolved || 0) + 1;
            await updateProfile({ 
              xp: newXp,
              level: newLevel,
              streak: newStreak,
              issuesResolved: newIssues,
              correctAnswers: (profile.correctAnswers || 0) + 1,
              totalAnswers: (profile.totalAnswers || 0) + 1
            });
          }
        }}
        onClose={() => setView('dashboard')} 
      />
    );
  }

  // Calculate dynamic accuracy
  const totalAns = profile?.totalAnswers || 0;
  const correctAns = profile?.correctAnswers || 0;
  const accuracyStr = totalAns > 0 ? `${Math.round((correctAns / totalAns) * 100)}%` : '0%';
  
  return (
    <div className="min-h-screen flex bg-bg-dark text-white">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-white/5 flex flex-col items-center md:items-stretch p-4 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-lg bg-brand-primary/20">
            <Code2 className="w-6 h-6 text-brand-primary" />
          </div>
          <span className="hidden md:block font-bold text-xl">DevLingo</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true, action: () => setView('dashboard') },
            { icon: BookOpen, label: "Aulas", count: `${profile?.completedLessons?.length || 0}/3`, action: () => setActiveLessonTrack(LESSON_TRACKS[0]) },
            { icon: MessageSquare, label: "Entrevistas", popular: true, action: () => setView('interview') },
            { icon: Trophy, label: "Ranking", action: () => {} },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={item.action}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer",
                item.active ? "bg-white/5 text-white font-bold" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="hidden md:block font-medium">{item.label}</span>
              {item.count && <span className="hidden md:block ml-auto text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-bold">{item.count}</span>}
              {item.popular && <span className="hidden md:block ml-auto text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full uppercase font-bold">HOT</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <div className="hidden md:block glass-card p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-white/40 font-bold uppercase tracking-wider">
              <span>Nível {profile?.level || 1}</span>
              <span>{(profile?.xp || 0) % 300}/300 XP</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary glow-purple transition-all duration-500" 
                style={{ width: `${Math.min(100, (((profile?.xp || 0) % 300) / 300) * 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 p-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-bold">
              {profile?.name ? profile.name[0].toUpperCase() : 'D'}
            </div>
            <div className="hidden md:block flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate">{profile?.name || 'Dev'}</p>
              <p className="text-[10px] text-white/40 truncate">{profile?.email}</p>
            </div>
            <button onClick={logout} title="Sair da conta" className="p-2 text-white/40 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10">
        <header className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-white/40 text-sm">Bem-vindo, {profile?.name || 'Dev'}! Comece suas aulas e entrevistas para acumular XP.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
              profile?.streakShieldActive
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-orange-500/10 border-orange-500/20 text-orange-400"
            )}>
              {profile?.streakShieldActive ? (
                <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
              ) : (
                <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
              )}
              <span className="font-bold">{profile?.streak || 0} dias</span>
              {profile?.streakShieldActive && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Protegido
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-bold">{profile?.xp || 0} XP</span>
            </div>

            <button 
              onClick={() => setShowSettingsModal(true)}
              title="Configurações e Reset"
              className="p-2 glass-card rounded-xl text-white/60 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* LinkedIn Job Analyzer Section (AI Powered) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-pink-400 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="w-4 h-4 animate-spin-slow" /> Mapeamento de Vaga Internacional
            </div>
            {activeJobContext && (
              <span className="text-xs text-purple-300 font-semibold">
                Vaga Ativa: {activeJobContext.company} ({activeJobContext.roleTitle})
              </span>
            )}
          </div>
          
          <div className="glass-card p-6 md:p-8 rounded-3xl border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-900/90 shadow-2xl">
            <LinkedInJobInput
              onStartSimulation={(job) => {
                setActiveJobContext(job);
                setView('interview');
              }}
            />
          </div>
        </section>

        {/* Hero Section / Current Task */}
        <section className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-primary/20 blur-[100px] rounded-full group-hover:bg-brand-primary/30 transition-all" />
          <div className="glass-card p-8 rounded-3xl relative flex flex-col md:flex-row gap-8 items-center border-brand-primary/20">
            <div className="text-center md:text-left space-y-6 flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-brand-secondary font-bold uppercase tracking-widest text-xs">
                <span className="animate-pulse">●</span> Próximo Desafio
              </div>
              <h1 className="text-3xl md:text-5xl font-bold">
                {activeJobContext 
                  ? `Entrevista: ${activeJobContext.roleTitle} @ ${activeJobContext.company}` 
                  : `Simulação de Entrevista: ${profile?.area || 'Senior Dev'}`}
              </h1>
              <p className="text-white/60 leading-relaxed text-base md:text-lg max-w-xl">
                Prepare-se com perguntas reais da stack {activeJobContext ? activeJobContext.techStack.slice(0, 4).join(', ') : (profile?.area || 'Fullstack')}, responda em inglês por voz e ganhe <strong>+50 XP</strong> por resposta.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => setView('interview')}
                  className="px-8 py-4 bg-brand-primary rounded-xl font-bold glow-purple hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Mic2 className="w-5 h-5" />
                  Iniciar Simulação com IA (+50 XP)
                </button>
                <button 
                  onClick={() => setActiveLessonTrack(LESSON_TRACKS[0])}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-brand-secondary" />
                  Fazer Aula Interativa (+100 XP)
                </button>
              </div>
            </div>
            <div className="w-full md:w-80 aspect-square glass-card rounded-2xl flex items-center justify-center p-8 bg-white/5">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary blur-3xl opacity-20" />
                <Terminal className="w-32 h-32 text-brand-primary relative" />
              </div>
            </div>
          </div>
        </section>

        {/* Streak Saver Card & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Streak Saver Interactive Card */}
          <div className="lg:col-span-2">
            <StreakCard
              userId={profile?.uid || ''}
              streak={profile?.streak || 0}
              xp={profile?.xp || 0}
              streakShieldActive={Boolean(profile?.streakShieldActive)}
              lostStreak={profile?.lostStreak || 0}
              onUpdateProfile={(updated) => updateProfile(updated)}
              onStartInterview={() => setView('interview')}
            />
          </div>

          {/* Word of the Day */}
          <div className="glass-card p-6 rounded-3xl border-brand-secondary/20 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-secondary/10 blur-2xl rounded-full group-hover:bg-brand-secondary/20 transition-all" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-secondary font-bold text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Termo do Dia
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-bold code-font">"Scalability"</h4>
                <p className="text-white/40 text-xs italic">escalabilidade técnica / throughput</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                A capacidade de uma arquitetura manter alta performance sob aumento de carga distribuída.
              </p>
              <div className="pt-2">
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter mb-1">Exemplo no Código:</p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 code-font text-xs text-white/60">
                  "We need to ensure horizontal <span className="text-brand-secondary">scalability</span> for our stateful microservices."
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              {isWordReviewed ? (
                <>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Revisado hoje (+25 XP ganhos)
                  </span>
                  <span className="text-emerald-400 font-bold">✓ Concluído</span>
                </>
              ) : (
                <>
                  <span className="text-white/40">+25 XP ao revisar</span>
                  <button
                    onClick={handleReviewWord}
                    className="px-3 py-1.5 bg-brand-secondary/20 hover:bg-brand-secondary/30 text-brand-secondary border border-brand-secondary/30 rounded-lg font-bold text-xs transition-all hover:scale-105"
                  >
                    Revisar Termo (+25 XP)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Issues Resolvidas", value: `${profile?.issuesResolved || 0}`, icon: CheckCircle2, color: "text-green-400" },
            { label: "Média de Precisão", value: accuracyStr, icon: Star, color: "text-yellow-400" },
            { label: "XP Acumulado", value: `${profile?.xp || 0}`, icon: Trophy, color: "text-purple-400" },
            { label: "Nível Global", value: `Nível ${profile?.level || 1}`, icon: UserIcon, color: "text-blue-400" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 md:p-6 rounded-2xl flex items-center gap-4">
              <div className={cn("p-3 rounded-xl bg-white/5 flex-shrink-0", stat.color)}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Tracks Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Trilhas de Aprendizado Interativas</h3>
              <p className="text-white/40 text-sm">Complete as aulas para ganhar XP e turbinar seu vocabulário profissional.</p>
            </div>
            <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
              {profile?.completedLessons?.length || 0} de {LESSON_TRACKS.length} Concluídas
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LESSON_TRACKS.map((track) => {
              const isCompleted = Boolean(profile?.completedLessons?.includes(track.id));
              const progress = isCompleted ? 100 : 0;
              
              return (
                <div 
                  key={track.id} 
                  onClick={() => setActiveLessonTrack(track)}
                  className="glass-card p-6 rounded-2xl space-y-4 group cursor-pointer hover:bg-white/[0.06] hover:border-brand-primary/40 transition-all border border-white/5 relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-xl bg-brand-primary/20 text-brand-primary group-hover:scale-110 transition-transform">
                        {track.icon === 'code' && <Code2 className="w-6 h-6" />}
                        {track.icon === 'mic' && <Mic2 className="w-6 h-6" />}
                        {track.icon === 'terminal' && <Terminal className="w-6 h-6" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">
                          +{track.xpReward} XP
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-white/5 px-2 py-0.5 rounded-md text-white/40">
                          {track.level}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-lg text-white group-hover:text-brand-secondary transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-xs text-white/50 leading-relaxed mt-1 line-clamp-2">
                        {track.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {track.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded-md bg-white/[0.02]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-white/40">
                      <span>Status</span>
                      <span className={isCompleted ? "text-emerald-400 font-bold" : "text-white/40"}>
                        {isCompleted ? "Concluída ✓" : "Não iniciada"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          isCompleted ? "bg-emerald-400" : "bg-brand-primary"
                        )} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="text-center pt-2">
                      <button className="text-xs font-bold text-brand-primary group-hover:underline flex items-center justify-center gap-1 w-full">
                        {isCompleted ? "Refazer Aula" : "Iniciar Aula"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Lesson Modal */}
      {activeLessonTrack && (
        <LessonModal
          track={activeLessonTrack}
          onClose={() => setActiveLessonTrack(null)}
          onCompleteLesson={(results) => {
            handleCompleteLesson(results);
          }}
        />
      )}

      {/* Settings & Reset Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-6 bg-slate-900 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-primary" />
                Configurações da Conta
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Desenvolvedor:</span>
                <span className="font-bold">{profile?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Email:</span>
                <span className="font-bold">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Stack Principal:</span>
                <span className="font-bold text-brand-secondary">{profile?.area}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">XP Atual:</span>
                <span className="font-bold text-purple-400">{profile?.xp || 0} XP</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Sequência (Streak):</span>
                <span className="font-bold text-orange-400">{profile?.streak || 0} dias</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-3">
              <p className="text-xs text-rose-300/90 leading-relaxed font-medium">
                Deseja reiniciar seu perfil com tudo zerado (0 XP, Nível 1, 0 dias de sequência, 0 aulas feitas) para testar sua evolução desde o início?
              </p>
              <button
                onClick={handleResetConfirm}
                disabled={resetting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all"
              >
                {resetting ? "Zerando dados..." : "Zerar Tudo para 0 XP (Resetar)"}
              </button>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 font-bold text-sm rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App ---

const RootApp = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <Code2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary" />
        </div>
      </div>
    );
  }

  if (!user) return <LandingPage />;
  if (!profile) return <Onboarding />;
  
  return <Dashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
