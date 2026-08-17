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
    title: "Senior Product Designer (UI/UX - Figma)",
    company: "Airbnb",
    input: "https://www.linkedin.com/jobs/view/airbnb-senior-product-designer-design-systems-41289102",
    tag: "Design / UI/UX"
  },
  {
    title: "Lead Video Producer & Filmmaker",
    company: "Netflix",
    input: "Vaga de Lead Video Creator & Filmmaker na Netflix para criação de trailers, direção de fotografia, edição de alta retenção no Premiere/DaVinci e pós-produção audiovisual.",
    tag: "Audiovisual / Vídeo"
  },
  {
    title: "Global Operations & Business Admin",
    company: "McKinsey",
    input: "Vaga de Business Operations & Administration Manager na McKinsey para otimização de processos, FP&A, governança corporativa e gestão de stakeholders internacionais.",
    tag: "Administração & Ops"
  },
  {
    title: "Senior Fullstack Engineer (React/Go)",
    company: "Stripe",
    input: "https://www.linkedin.com/jobs/view/stripe-senior-fullstack-engineer-4109283741",
    tag: "Engenharia / Dev"
  },
  {
    title: "Growth & Product Marketing Manager",
    company: "Deel",
    input: "Product Marketing Manager na Deel responsável por estratégias de GTM global, retenção de usuários B2B, copywriting e análise de conversão.",
    tag: "Marketing & Growth"
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
        "Acessando os requisitos da vaga e stack técnica...",
        "Escaneando nível de senioridade, arquitetura e empresa...",
        "Mapeando cenários de System Design e metodologia STAR...",
        "Calibrando o console de avaliação para a entrevista..."
      ]
    : [
        "Analisando descrição técnica e padrões de mercado...",
        "Identificando arquitetura, linguagens e ferramentas exigidas...",
        "Mapeando cenários de alta concorrência e método STAR...",
        "Preparando o console de avaliação técnica..."
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
    <div className={cn("w-full max-w-3xl mx-auto space-y-5", className)}>
      {/* Search / Input Bar Container */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-indigo-600/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-500" />

        <div className="relative rounded-2xl p-2 bg-[#0c0c14] border border-zinc-700/80 shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <div className="flex-1 flex items-center gap-3 w-full px-3 py-1.5">
            {isLink ? (
              <Link2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            )}
            
            <input
              type="text"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Cole o link do LinkedIn ou digite a vaga (ex: Senior Designer na Airbnb, Dev na Stripe)..."
              className="w-full bg-transparent text-white placeholder-zinc-500 text-sm md:text-[15px] outline-none font-medium selection:bg-purple-500 selection:text-white"
            />
            {jobUrl && (
              <button 
                onClick={() => setJobUrl('')}
                className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded cursor-pointer font-mono"
              >
                Limpar
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing}
            className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>{isLink ? "Buscando Vaga..." : "Mapeando Requisitos..."}</span>
              </>
            ) : (
              <>
                <span>Analisar Vaga & Inscrição</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Subtitle / Mode Indicator */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-zinc-400 font-medium tracking-wide">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Link2 className="w-3.5 h-3.5 text-purple-400" /> Links Diretos do LinkedIn
        </span>
        <span className="text-zinc-600">•</span>
        <span className="flex items-center gap-1.5 text-zinc-300">
          <FileText className="w-3.5 h-3.5 text-pink-400" /> Descrição Livre de Vaga
        </span>
        <span className="text-zinc-600">•</span>
        <span className="text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Gratuito
        </span>
      </div>

      {/* Quick Sample Links and Texts */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
        <span className="text-xs text-zinc-400 mr-1">
          Exemplos rápidos:
        </span>
        {SAMPLE_JOBS.map((sample, idx) => (
          <motion.button
            key={idx}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleApplySample(sample.input)}
            className="text-xs px-3 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="font-semibold text-white">{sample.company}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{sample.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-center text-xs text-red-300"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Loading Progress State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-6 rounded-2xl border border-zinc-800 text-center space-y-4 shadow-2xl bg-zinc-950 relative overflow-hidden"
          >
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-purple-400 flex items-center justify-center mx-auto">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Mapeando Requisitos da Vaga
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                {analysisSteps[analysisStep]}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 pt-1">
                {analysisSteps.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i <= analysisStep ? "bg-white scale-110" : "bg-zinc-800"
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
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="rounded-2xl p-6 md:p-7 border border-zinc-800 shadow-2xl bg-zinc-950 space-y-5 relative overflow-hidden text-left"
          >
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-sm">
                  <Building2 className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                      {analyzedJob.company}
                    </span>
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                      {analyzedJob.level}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {analyzedJob.roleTitle}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Requisitos Mapeados
              </span>
            </div>

            {/* Summary & Tech Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" /> Resumo do Cargo
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {analyzedJob.summary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-zinc-400" /> Ferramentas & Habilidades
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analyzedJob.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Topics to expect */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-zinc-400" /> Tópicos Avaliados na Entrevista
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {analyzedJob.keyTopics.map((topic, i) => (
                  <div key={i} className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-zinc-500 font-mono font-bold">{i + 1}.</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STAR Tip */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
              <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5 font-mono text-[11px] uppercase">Dica Estratégica (Método STAR):</strong>
                <span className="text-zinc-300">{analyzedJob.starTip}</span>
              </div>
            </div>

            {/* Start Simulation / Pre-Register Action Button */}
            <div className="pt-1">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => onStartSimulation(analyzedJob)}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inscrever-se com o Perfil da {analyzedJob.company}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
