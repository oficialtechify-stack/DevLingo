import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link2, 
  Zap,
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Building2, 
  Cpu, 
  FileText, 
  Loader2, 
  ChevronRight,
  Flame,
  Globe,
  Layers,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzeJobPosition, JobAnalysis } from '../services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SAMPLE_JOBS = [
  {
    title: "Senior Fullstack (React/Go)",
    company: "Stripe",
    input: "https://www.linkedin.com/jobs/view/stripe-senior-fullstack-engineer-4109283741",
    tag: "Link do LinkedIn"
  },
  {
    title: "Staff Backend Engineer (Kafka/Distributed)",
    company: "Uber",
    input: "Vaga de Staff Backend Engineer na Uber para arquitetura de mensageria com Kafka, microservices em Go, caching distribuído com Redis e alta disponibilidade.",
    tag: "Texto Livre / Descrição"
  },
  {
    title: "Senior Frontend Architect (React 19/Next.js)",
    company: "Vercel",
    input: "https://www.linkedin.com/jobs/view/vercel-senior-frontend-architect-nextjs-39872145",
    tag: "Link do LinkedIn"
  },
  {
    title: "Cloud & Distributed Systems",
    company: "Nubank",
    input: "Engenheiro de Software Sênior no Nubank trabalhando com microsserviços em Clojure/Java, Kafka, AWS, arquitetura orientada a eventos e resiliência financeira.",
    tag: "Texto Livre / Descrição"
  }
];

interface LinkedInJobInputProps {
  onStartSimulation: (job: JobAnalysis) => void;
  className?: string;
  requireAuthBeforeStart?: boolean;
}

export const LinkedInJobInput: React.FC<LinkedInJobInputProps> = ({
  onStartSimulation,
  className,
  requireAuthBeforeStart = false
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedJob, setAnalyzedJob] = useState<JobAnalysis | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLink = /^https?:\/\//i.test(jobUrl.trim());

  const analysisSteps = isLink
    ? [
        "Acessando o link da vaga e buscando dados na web...",
        "Escaneando requisitos técnicos, senioridade e empresa...",
        "Mapeando perguntas reais de System Design e Behavioral Fit...",
        "Configurando o Tech Recruiter IA para a entrevista..."
      ]
    : [
        "Analisando sua descrição técnica e pesquisando padrões de mercado...",
        "Identificando empresa, stack de ferramentas e arquitetura...",
        "Mapeando cenários de alta pressão e metodologia STAR...",
        "Preparando o Tech Recruiter IA para conduzir a entrevista..."
      ];

  const handleAnalyze = async (customInput?: string) => {
    const targetInput = (customInput || jobUrl).trim();
    if (!targetInput) {
      setErrorMessage("Por favor, cole a URL do LinkedIn ou descreva o cargo/vaga desejada.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalyzedJob(null);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await analyzeJobPosition(targetInput);
      clearInterval(stepInterval);
      setAnalyzedJob(result);
      setIsAnalyzing(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMessage("Não foi possível analisar a vaga agora. Tente novamente ou use um dos exemplos.");
    }
  };

  const handleApplySample = (sampleInput: string) => {
    setJobUrl(sampleInput);
    handleAnalyze(sampleInput);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto space-y-6", className)}>
      {/* Search / Input Bar Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-75 transition duration-700 animate-pulse-ring" />

        <div className="relative rounded-[2.2rem] p-2 md:p-3 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <div className="flex-1 flex items-center gap-3 w-full px-4 py-2">
            {isLink ? (
              <Link2 className="w-5 h-5 text-pink-400 flex-shrink-0 animate-pulse" />
            ) : (
              <FileText className="w-5 h-5 text-purple-300 flex-shrink-0 animate-pulse" />
            )}
            
            <input
              type="text"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Cole a URL do LinkedIn OU escreva a vaga (ex: Senior React Dev na Stripe)..."
              className="w-full bg-transparent text-white placeholder-white/50 text-sm md:text-base outline-none font-medium selection:bg-purple-500 selection:text-white"
            />
            {jobUrl && (
              <button 
                onClick={() => setJobUrl('')}
                className="text-white/40 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing}
            className="w-full md:w-auto px-7 py-3.5 bg-white text-[#7c3aed] font-extrabold text-sm md:text-base rounded-full hover:bg-slate-100 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#7c3aed]" />
                <span>{isLink ? "Buscando Link..." : "Analisando Vaga..."}</span>
              </>
            ) : (
              <>
                <span>Analisar Vaga & Pré-Registro</span>
                <ChevronRight className="w-4 h-4 text-[#7c3aed]" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Subtitle / Mode Indicator */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-white/70 font-medium tracking-wide">
        <span className="flex items-center gap-1.5 text-pink-300">
          <Link2 className="w-3.5 h-3.5" /> Aceita Links do LinkedIn
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5 text-purple-300">
          <FileText className="w-3.5 h-3.5 text-purple-400" /> Aceita Descrição Escrita Livre
        </span>
        <span>•</span>
        <span>Sem Cartão. É só falar.</span>
      </div>

      {/* Quick Sample Links and Texts */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-xs text-white/50">
          Ou teste com estes exemplos:
        </span>
        {SAMPLE_JOBS.map((sample, idx) => (
          <motion.button
            key={idx}
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleApplySample(sample.input)}
            className="text-xs px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-purple-500/40 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="font-semibold text-pink-300">{sample.company}</span>
            <span className="text-white/40">•</span>
            <span>{sample.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-center text-xs text-rose-200"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Loading Progress State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 rounded-3xl border border-purple-500/30 text-center space-y-4 shadow-2xl bg-slate-900/90 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 animate-gradient" />
            
            <div className="relative z-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto animate-spin">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                Inteligência Artificial Analisando o LinkedIn
              </h4>
              <p className="text-xs md:text-sm text-purple-200 animate-pulse font-medium">
                {analysisSteps[analysisStep]}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-2">
                {analysisSteps.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      i <= analysisStep ? "bg-pink-400 scale-110" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzed Job Preview Card */}
      <AnimatePresence>
        {analyzedJob && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card rounded-3xl p-6 md:p-8 border border-purple-500/40 shadow-2xl bg-slate-900/95 space-y-6 relative overflow-hidden"
          >
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                      {analyzedJob.company}
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                      {analyzedJob.level}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">
                    {analyzedJob.roleTitle}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Vaga Mapeada com Sucesso
              </span>
            </div>

            {/* Summary & Tech Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" /> Resumo do Escopo
                </span>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  {analyzedJob.summary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-pink-400" /> Tech Stack Exigida
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analyzedJob.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Topics to expect */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" /> Perguntas Técnicas Esperadas na Entrevista
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {analyzedJob.keyTopics.map((topic, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 flex items-start gap-2">
                    <span className="text-purple-400 font-bold">{i + 1}.</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STAR Tip */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-3">
              <Zap className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Dica de Ouro para a Simulação (STAR):</strong>
                {analyzedJob.starTip}
              </div>
            </div>

            {/* Start Simulation / Pre-Register Action Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => onStartSimulation(analyzedJob)}
                className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-base rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Fazer Pré-Registro com a Vaga da {analyzedJob.company} (Acesso Antecipado)</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
