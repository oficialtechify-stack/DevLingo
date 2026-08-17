import React from 'react';
import { Check, X, Sparkles, Scale, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COMPARISONS = [
  {
    criterion: 'Foco no Seu Cargo & Habilidades Reais',
    traditional: 'Gramática básica e conversas de aeroporto/restaurante',
    apps: 'Frases genéricas ("The boy eats an apple")',
    devlingo: 'System Design, Figma Tokens, Pós-Produção, FP&A e Metodologia STAR',
    highlight: true
  },
  {
    criterion: 'Simulação Vaga-Específica (LinkedIn)',
    traditional: 'Aulas fixas de livro didático sem contexto de mercado',
    apps: 'Trilhas lineares pré-programadas',
    devlingo: 'Análise em tempo real do link ou texto da vaga do LinkedIn',
    highlight: true
  },
  {
    criterion: 'Treino de Fala em Tempo Real sob Pressão',
    traditional: '1 ou 2 minutos por aula em turmas de 10 alunos',
    apps: 'Apenas repetição mecânica de palavras isoladas',
    devlingo: 'Sessões de áudio simulando entrevistadores e executivos globais',
    highlight: true
  },
  {
    criterion: 'Feedback de Vocabulário Executivo & Sênior',
    traditional: 'Professores sem conhecimento técnico do seu mercado',
    apps: 'Apenas certo ou errado sem refinamento profissional',
    devlingo: 'Sugestões de como um profissional sênior nativo articularia a ideia',
    highlight: true
  },
  {
    criterion: 'Metodologia STAR & Perguntas de Liderança',
    traditional: 'Inexistente',
    apps: 'Inexistente',
    devlingo: 'Treinamento focado em Situation, Task, Action & Result para empresas globais',
    highlight: true
  }
];

export const MethodologyMatrix: React.FC = () => {
  return (
    <section className="section-padding bg-[#050508] border-b border-zinc-800/80 relative overflow-hidden">
      <div className="container-wide space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-zinc-400" />
            <span>Comparativo de Eficiência</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Por Que Cursos Tradicionais Não Preparam Para Vagas Globais
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Entrevistas internacionais exigem vocabulário de senioridade, métricas de impacto e defesa de decisões práticas na sua área.
          </p>
        </div>

        {/* Desktop Table & Mobile Cards */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="p-5 sm:p-6 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Critério de Preparação
                  </th>
                  <th className="p-5 sm:p-6 text-xs sm:text-sm font-mono font-semibold text-zinc-400 w-1/4">
                    Escolas Tradicionais
                  </th>
                  <th className="p-5 sm:p-6 text-xs sm:text-sm font-mono font-semibold text-zinc-400 w-1/4">
                    Apps de Idiomas
                  </th>
                  <th className="p-5 sm:p-6 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white bg-zinc-900 w-1/3 border-l border-zinc-800">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>DevLingo</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {COMPARISONS.map((row, index) => (
                  <tr key={index} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-5 sm:p-6 text-xs sm:text-sm font-bold text-white">
                      {row.criterion}
                    </td>
                    <td className="p-5 sm:p-6 text-xs text-zinc-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-xs text-zinc-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>{row.apps}</span>
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-xs sm:text-sm text-zinc-200 bg-zinc-900/40 border-l border-zinc-800 font-medium">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.devlingo}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
