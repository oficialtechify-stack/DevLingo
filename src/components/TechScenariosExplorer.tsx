import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, 
  Palette, 
  Video, 
  Briefcase, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Terminal, 
  Volume2 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Scenario {
  id: string;
  category: string;
  icon: React.ElementType;
  role: string;
  companyTarget: string;
  question: string;
  context: string;
  keyTechnicalTerms: string[];
  seniorModelAnswer: string;
  whyItPasses: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'engineering',
    category: 'Engenharia de Software',
    icon: Server,
    role: 'Senior Backend Engineer',
    companyTarget: 'Stripe / Uber',
    question: 'How do you prevent duplicate transactions when a payment webhook fails due to a network timeout?',
    context: 'Evaluating concurrency control, idempotency keys, and database ACID properties under high load.',
    keyTechnicalTerms: ['Idempotency-Key', 'Distributed Locks (Redis)', 'Optimistic Concurrency', 'Transactional Outbox Pattern'],
    seniorModelAnswer: '"We implement an Idempotency-Key header on incoming requests. When a request arrives, we acquire a distributed lock in Redis with a short TTL, verify if the transaction payload has already executed in PostgreSQL within an ACID transaction, and either return the cached successful response or process the charge atomically."',
    whyItPasses: 'Uses precise architecture terms (idempotency, distributed locks, ACID transactions, atomic execution) without translation hesitation.'
  },
  {
    id: 'design',
    category: 'Product Design (UI/UX)',
    icon: Palette,
    role: 'Senior Product Designer',
    companyTarget: 'Airbnb / Figma / Canva',
    question: 'How do you convince engineering and product leadership to adopt multi-brand Design System tokens instead of hardcoded CSS values?',
    context: 'Assessing design governance, accessibility standards (WCAG AAA), and cross-functional design-to-code alignment.',
    keyTechnicalTerms: ['Design Tokens (Style Dictionary)', 'WCAG AAA Contrast Ratio', 'Component Atomic Hierarchy', 'Figma Auto-Layout Variables'],
    seniorModelAnswer: '"I frame design tokens not just as visual consistency, but as engineering velocity. By establishing semantic tokens in Figma synced to code via Style Dictionary, we eliminate 80% of visual QA regressions, guarantee WCAG accessibility compliance across dark/light modes, and allow rebranding across multiple web & mobile platforms with a single token update."',
    whyItPasses: 'Conveys strategic design value in clear business and engineering terms with native design vocabulary.'
  },
  {
    id: 'filmmaker',
    category: 'Filmmaker & Vídeo',
    icon: Video,
    role: 'Lead Video Producer & Filmmaker',
    companyTarget: 'Netflix / Red Bull / Spotify',
    question: 'How do you design high-retention video pacing for global commercial releases without compromising cinematic storytelling?',
    context: 'Evaluating editing rhythm, DaVinci Resolve color workflows, retention curves, and audio sound design.',
    keyTechnicalTerms: ['A/B Retention Curves', 'Color Managed Workflow (ACES/DaVinci)', 'Diegetic Sound Design', 'Pacing & Micro-hooks'],
    seniorModelAnswer: '"I architect the first 3 seconds with a visual and auditory hook before easing into the narrative arc. In DaVinci Resolve, I maintain an ACES color pipeline for HDR consistency across all broadcast standards, while layering multi-track foley and diegetic sound design to sustain tension through key story beats, resulting in a 42% lift in completion rates."',
    whyItPasses: 'Combines technical post-production terminology (ACES color management, diegetic audio) with audience engagement metrics.'
  },
  {
    id: 'admin_ops',
    category: 'Administração & Operações',
    icon: Briefcase,
    role: 'Global Business & Operations Lead',
    companyTarget: 'McKinsey / Deel / Stripe',
    question: 'How do you optimize an international cross-border operational bottleneck where financial reconciliation is lagging by 72 hours?',
    context: 'Checking process engineering, FP&A metrics, automation pipelines, and stakeholder governance.',
    keyTechnicalTerms: ['Process Re-engineering', 'Variance Analysis', 'Automated Reconciliation (RPA)', 'SLA Governance'],
    seniorModelAnswer: '"I map the value stream from transaction ingestion to ledger settlement. By implementing automated bank-feed reconciliation scripts and defining strict cross-departmental SLAs, we reduced manual variance reconciliations by 68% and brought turnaround time from 72 hours down to near real-time T+2 hours with zero audit flags."',
    whyItPasses: 'Demonstrates executive presence with structured operational terms (value stream mapping, variance analysis, SLAs).'
  },
  {
    id: 'product',
    category: 'Product & Growth',
    icon: TrendingUp,
    role: 'Senior Product Manager',
    companyTarget: 'Google / Nubank',
    question: 'How do you prioritize technical debt against revenue-generating features when user churn is beginning to accelerate?',
    context: 'Assessing prioritization frameworks (RICE), cohort retention analysis, and balancing business with engineering needs.',
    keyTechnicalTerms: ['Cohort Churn Analysis', 'RICE Framework', 'Latency-to-Revenue Elasticity', 'Tech Debt Allocation'],
    seniorModelAnswer: '"I quantify the revenue impact of technical debt by correlating error rates and p95 latency with user drop-off in our onboarding funnel. Using the RICE framework backed by cohort data, I allocated a dedicated 20% engineering budget per sprint to fix high-impact database bottlenecks, which reversed churn by 14% while delivering our top commercial feature."',
    whyItPasses: 'Connects engineering health directly to business revenue with structured data-backed storytelling.'
  },
  {
    id: 'behavioral',
    category: 'Liderança & Fit Cultural (STAR)',
    icon: Users,
    role: 'International Team Lead',
    companyTarget: 'Global Big Techs',
    question: 'Tell me about a high-stakes crisis where you had to align conflicting international stakeholders under tight deadlines.',
    context: 'Checking STAR structure, empathetic leadership, crisis management, and assertive English fluency.',
    keyTechnicalTerms: ['Situation-Task-Action-Result', 'Stakeholder Matrix', 'Crisis Communication', 'Root Cause Analysis (RCA)'],
    seniorModelAnswer: '"When a regulatory compliance deadline threatened a multi-country launch (Situation/Task), I established daily transparent syncs with local legal, engineering, and product leads. I decoupled non-blocking features and created an emergency roadmap (Action), resulting in a compliant launch 2 days ahead of schedule across 6 global markets (Result)."',
    whyItPasses: 'Strict STAR methodology with crisp, authoritative English that projects natural executive leadership.'
  }
];

export const TechScenariosExplorer: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('engineering');
  const activeScenario = SCENARIOS.find(s => s.id === activeId) || SCENARIOS[0];

  return (
    <section className="section-padding bg-[#050508] border-b border-zinc-800/80 relative overflow-hidden">
      <div className="container-wide space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Simulador de Cenários Profissionais</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Perguntas Reais. Respostas de Alto Impacto.
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Veja como profissionais de elite (Engenharia, Design, Vídeo, Gestão e Produto) estruturam respostas em inglês para conquistar vagas internacionais em dólares.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = scenario.id === activeId;
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveId(scenario.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border",
                  isSelected
                    ? "bg-zinc-100 border-white text-black font-semibold shadow-sm"
                    : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-black" : "text-zinc-400")} />
                <span>{scenario.category}</span>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-6 sm:p-8 md:p-9 border border-zinc-800 bg-zinc-950 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide">
                    {activeScenario.role}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs font-mono text-zinc-400">
                    Target: {activeScenario.companyTarget}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
                  "{activeScenario.question}"
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono shrink-0">
                Rubrica de Avaliação
              </span>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
              {/* Left Column: Context & Terms */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Objetivo da Avaliação
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeScenario.context}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Vocabulário Técnico Chave
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeScenario.keyTechnicalTerms.map((term, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Por que essa resposta garante a vaga:</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {activeScenario.whyItPasses}
                  </p>
                </div>
              </div>

              {/* Right Column: Model Answer */}
              <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="text-zinc-200 font-bold uppercase tracking-wider">
                      Resposta Articulada do Candidato Sênior
                    </span>
                    <span className="text-zinc-500 text-[11px]">Speech Fluency: 98%</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed italic font-serif bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                    {activeScenario.seniorModelAnswer}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Calibrado com padrões L5/L6 Silicon Valley
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
