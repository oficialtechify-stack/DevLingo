import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Terminal, 
  Mic2, 
  Zap, 
  BookOpen, 
  Volume2, 
  Check, 
  RotateCcw,
  Trophy
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LessonQuestion {
  id: string;
  context: string;
  question: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
    explanation: string;
    isCorrect: boolean;
  }[];
}

export interface LessonTrack {
  id: string;
  title: string;
  subtitle: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  icon: 'code' | 'mic' | 'terminal';
  tags: string[];
  xpReward: number;
  questions: LessonQuestion[];
}

export const LESSON_TRACKS: LessonTrack[] = [
  {
    id: 'track-prs',
    title: 'English for Pull Requests',
    subtitle: 'Aprenda a descrever mudanças, apontar bugs e sugerir refatorações com naturalidade.',
    level: 'Iniciante',
    icon: 'code',
    tags: ['Git', 'Code Review', 'Collaboration'],
    xpReward: 100,
    questions: [
      {
        id: 'pr-q1',
        context: 'Você precisa abrir um Pull Request corrigindo uma condição de corrida no carregamento de dados.',
        question: 'Qual é o título mais profissional e claro para o PR?',
        codeSnippet: `// Fix data fetching race condition in UserProfile
const abortController = new AbortController();
fetchUserData({ signal: abortController.signal });`,
        options: [
          {
            id: 'opt-a',
            text: 'fix: resolve race condition in UserProfile data fetching by passing abort signal',
            explanation: 'Excelente! Segue o padrão de Conventional Commits e detalha exatamente o que foi solucionado.',
            isCorrect: true
          },
          {
            id: 'opt-b',
            text: 'fixing bug when profile is loading too fast',
            explanation: 'Muito vago e informal para equipes internacionais.',
            isCorrect: false
          },
          {
            id: 'opt-c',
            text: 'make the code better without bugs in user profile',
            explanation: 'Não explica o problema técnico nem a solução adotada.',
            isCorrect: false
          }
        ]
      },
      {
        id: 'pr-q2',
        context: 'Durante um Code Review, você quer sugerir de forma educada a extração de uma função auxiliar.',
        question: 'Qual frase expressa melhor essa sugestão em inglês técnico?',
        options: [
          {
            id: 'opt-a',
            text: 'You made a mistake here, change this code now.',
            explanation: 'Soa agressivo e inadequado para trabalho colaborativo.',
            isCorrect: false
          },
          {
            id: 'opt-b',
            text: 'Nit: Could we extract this validation logic into a dedicated helper to improve readability?',
            explanation: 'Perfeito! "Nit" (detalhe não-bloqueante) + sugestão construtiva e educada.',
            isCorrect: true
          },
          {
            id: 'opt-c',
            text: 'I don\'t like this syntax, rewrite please.',
            explanation: 'Não oferece justificativa técnica (legibilidade, reutilização).',
            isCorrect: false
          }
        ]
      },
      {
        id: 'pr-q3',
        context: 'Você precisa avisar que fez o rebase com a branch principal e resolveu os conflitos.',
        question: 'Como comunicar isso no comentário do PR?',
        options: [
          {
            id: 'opt-a',
            text: 'I rebased against main, resolved the merge conflicts, and the CI tests are green.',
            explanation: 'Impecável! Vocabulário natural de engenharia de software.',
            isCorrect: true
          },
          {
            id: 'opt-b',
            text: 'I putted the new main inside my branch and fixed errors.',
            explanation: 'Gramaticalmente incorreto ("putted") e pouco profissional.',
            isCorrect: false
          },
          {
            id: 'opt-c',
            text: 'Done everything please merge.',
            explanation: 'Falta contexto sobre o status dos testes e do rebase.',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    id: 'track-interview',
    title: 'Tech Interview Vocab & STAR Method',
    subtitle: 'Domine a terminologia de arquitetura e responda perguntas comportamentais com confiança.',
    level: 'Intermediário',
    icon: 'mic',
    tags: ['Big Tech', 'STAR Method', 'Soft Skills'],
    xpReward: 120,
    questions: [
      {
        id: 'int-q1',
        context: 'O recrutador pergunta: "Can you tell me about a time you handled a production outage?"',
        question: 'Qual é a melhor estrutura para iniciar sua resposta usando o método STAR?',
        options: [
          {
            id: 'opt-a',
            text: 'Sure. In my previous role at FintechX, we experienced a critical latency spike during a flash sale (Situation). My task was to identify the bottleneck and mitigate downtime (Task)...',
            explanation: 'Perfeito! Apresenta contexto claro com métricas e responsabilidades bem delineadas.',
            isCorrect: true
          },
          {
            id: 'opt-b',
            text: 'Yes, servers were down, so I stayed working until 3 AM to fix the database.',
            explanation: 'Foca no esforço pessoal em vez do impacto sistêmico e processo de engenharia.',
            isCorrect: false
          },
          {
            id: 'opt-c',
            text: 'I always write good code so we never have outages in my team.',
            explanation: 'Não responde à pergunta e soa irreal para engenheiros seniores.',
            isCorrect: false
          }
        ]
      },
      {
        id: 'int-q2',
        context: 'O Tech Lead pede para você justificar a escolha entre Client-Side Rendering (CSR) e Server-Side Rendering (SSR).',
        question: 'Qual frase demonstra domínio técnico de performance em inglês?',
        codeSnippet: `// Next.js App Router vs SPA Vite
// Tradeoff: SEO & First Contentful Paint vs Complex Caching`,
        options: [
          {
            id: 'opt-a',
            text: 'We opted for SSR because it drastically improves First Contentful Paint (FCP) and SEO indexability for public catalog pages, while keeping private dashboards on CSR.',
            explanation: 'Excelente! Usa métricas do Core Web Vitals (FCP) e distinção arquitetural apropriada.',
            isCorrect: true
          },
          {
            id: 'opt-b',
            text: 'SSR is newer and better than CSR so everyone should use it.',
            explanation: 'Falta análise de trade-offs de computação no servidor e latência TTFB.',
            isCorrect: false
          },
          {
            id: 'opt-c',
            text: 'CSR is bad because HTML is empty in initial response.',
            explanation: 'Muito simplista; ignora cenários onde SPAs são mais eficientes.',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    id: 'track-docs',
    title: 'Technical Documentation & Architecture',
    subtitle: 'Aprenda a redigir RFCs, ADRs (Architecture Decision Records) e Readmes de alto impacto.',
    level: 'Avançado',
    icon: 'terminal',
    tags: ['Architecture', 'ADR', 'Standards'],
    xpReward: 150,
    questions: [
      {
        id: 'doc-q1',
        context: 'Você está escrevendo uma ADR sobre migração de monólito para microsserviços.',
        question: 'Qual seção resume os efeitos colaterais e desvantagens de uma escolha técnica?',
        options: [
          {
            id: 'opt-a',
            text: 'Trade-offs & Negative Consequences (e.g., increased network overhead and eventual consistency complexity)',
            explanation: 'Correto! Em ADRs internacionais, a transparência sobre trade-offs é o ponto mais valorizado.',
            isCorrect: true
          },
          {
            id: 'opt-b',
            text: 'Why our tech stack has no flaws',
            explanation: 'Qualquer decisão de arquitetura tem trade-offs.',
            isCorrect: false
          },
          {
            id: 'opt-c',
            text: 'Random thoughts about microservices',
            explanation: 'Completamente fora dos padrões de documentação corporativa.',
            isCorrect: false
          }
        ]
      },
      {
        id: 'doc-q2',
        context: 'Ao descrever uma API RESTful em inglês, como documentar o comportamento de rate limiting?',
        question: 'Qual é a descrição técnica mais apropriada para a resposta 429?',
        codeSnippet: `HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Remaining: 0`,
        options: [
          {
            id: 'opt-a',
            text: 'When rate limits are exceeded, the API returns a 429 status code with a Retry-After header indicating cooldown duration in seconds.',
            explanation: 'Perfeito! Claro, preciso e padronizado com as especificações HTTP RFC.',
            isCorrect: true
          },
          {
            id: 'opt-b',
            text: 'If you click too much we block you for some minutes.',
            explanation: 'Informal e não documenta cabeçalhos nem códigos de resposta HTTP.',
            isCorrect: false
          }
        ]
      }
    ]
  }
];

interface LessonModalProps {
  track: LessonTrack;
  onClose: () => void;
  onCompleteLesson: (results: {
    trackId: string;
    xpEarned: number;
    correctCount: number;
    totalCount: number;
  }) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  track,
  onClose,
  onCompleteLesson
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalXpGained, setTotalXpGained] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = track.questions[currentIndex];
  const progressPercent = ((currentIndex) / track.questions.length) * 100;

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    
    const selected = currentQuestion.options.find(o => o.id === selectedOptionId);
    const isCorrect = Boolean(selected?.isCorrect);

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
      const earned = Math.round(track.xpReward / track.questions.length);
      setTotalXpGained(prev => prev + earned);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < track.questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished all questions
      const finalXp = totalXpGained + (correctAnswersCount > 0 ? 20 : 0); // completion bonus
      setIsFinished(true);
      onCompleteLesson({
        trackId: track.id,
        xpEarned: finalXp,
        correctCount: correctAnswersCount,
        totalCount: track.questions.length
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card max-w-2xl w-full rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-slate-900 text-white flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary/20 text-brand-primary">
              {track.icon === 'code' && <Code2 className="w-5 h-5" />}
              {track.icon === 'mic' && <Mic2 className="w-5 h-5" />}
              {track.icon === 'terminal' && <Terminal className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                {track.level} • {track.title}
              </span>
              <h3 className="text-base font-bold text-white">
                {isFinished ? 'Aula Concluída!' : `Exercício ${currentIndex + 1} de ${track.questions.length}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              +{totalXpGained} XP
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
            style={{ width: isFinished ? '100%' : `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {!isFinished ? (
            <>
              {/* Context and Scenario */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
                  <BookOpen className="w-3.5 h-3.5 text-brand-secondary" /> Cenário de Trabalho
                </div>
                <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  {currentQuestion.context}
                </p>

                {currentQuestion.codeSnippet && (
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-brand-primary overflow-x-auto leading-relaxed">
                    <pre>{currentQuestion.codeSnippet}</pre>
                  </div>
                )}

                <h4 className="text-base md:text-lg font-bold text-white pt-2">
                  {currentQuestion.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = option.isCorrect;

                  let borderStyle = "border-white/10 hover:border-white/20 hover:bg-white/[0.04]";
                  let bgStyle = "bg-white/[0.02]";

                  if (isSelected && !isAnswerSubmitted) {
                    borderStyle = "border-brand-primary bg-brand-primary/10 text-white";
                  }

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      borderStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-100";
                    } else if (isSelected && !isCorrect) {
                      borderStyle = "border-rose-500 bg-rose-950/40 text-rose-100";
                    } else {
                      borderStyle = "border-white/5 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={isAnswerSubmitted}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 relative",
                        borderStyle,
                        bgStyle
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium leading-relaxed flex-1">
                          {option.text}
                        </span>

                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        )}
                      </div>

                      {isAnswerSubmitted && (isSelected || isCorrect) && (
                        <p className={cn(
                          "text-xs leading-relaxed pt-2 border-t border-white/5",
                          isCorrect ? "text-emerald-300/90 font-medium" : "text-rose-300/90"
                        )}>
                          {option.explanation}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center mx-auto shadow-2xl glow-purple animate-bounce">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold text-white">Parabéns, Dev!</h3>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  Você completou a trilha <strong className="text-white">{track.title}</strong> e expandiu seu vocabulário técnico para o mercado internacional.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">XP Ganho</span>
                  <span className="text-2xl font-extrabold text-amber-400">+{totalXpGained} XP</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">Acertos</span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {correctAnswersCount}/{track.questions.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
          {!isFinished ? (
            <>
              <div className="text-xs text-white/40">
                {selectedOptionId && !isAnswerSubmitted && "Clique em verificar resposta"}
                {isAnswerSubmitted && "Revise a explicação acima e avance"}
              </div>

              {!isAnswerSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOptionId}
                  className="px-6 py-3 bg-brand-primary disabled:opacity-40 font-bold text-sm rounded-xl hover:opacity-90 transition-opacity glow-purple flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Verificar Resposta
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary font-bold text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                >
                  <span>{currentIndex + 1 < track.questions.length ? 'Próximo Exercício' : 'Concluir Aula'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary font-bold text-sm rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Voltar ao Dashboard e Salvar Progresso
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
