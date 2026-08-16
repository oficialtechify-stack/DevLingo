import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const SalaryCalculator: React.FC<{ onOpenPreReg: () => void }> = ({ onOpenPreReg }) => {
  const [usdSalary, setUsdSalary] = useState<number>(5500); // $5,500 USD default
  const exchangeRate = 5.65; // Taxa de câmbio USD -> BRL
  const brlEquivalent = usdSalary * exchangeRate;
  const annualBrl = brlEquivalent * 12;

  // Comparação média com salário sênior Brasil CLT (~R$ 14.000)
  const averageLocalSalary = 14000;
  const monthlyDifference = brlEquivalent - averageLocalSalary;
  const annualDifference = monthlyDifference * 12;

  return (
    <section className="section-padding bg-[#090812] border-t border-b border-white/5 relative overflow-hidden">
      <div className="container-wide space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Calculadora de Impacto Financeiro</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white">
            O Retorno Real de Destravar o Inglês Técnico
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Profissionais brasileiros (Devs, Designers, Filmmakers, Administradores e Líderes) com inglês fluente ganham em média de <span className="text-white font-bold">$3.500 a $10.000+ USD/mês</span> trabalhando remotamente para o exterior.
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-10 border-white/10 bg-slate-950/80 shadow-2xl space-y-8">
          {/* Slider control */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-300 font-mono">
                Salário Remoto Estimado (USD / mês):
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                ${usdSalary.toLocaleString('en-US')} USD
              </span>
            </div>

            <input
              type="range"
              min="3000"
              max="12000"
              step="500"
              value={usdSalary}
              onChange={(e) => setUsdSalary(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>$3.000 USD (Mid-Level)</span>
              <span>$6.000 USD (Senior)</span>
              <span>$12.000 USD (Staff / Principal)</span>
            </div>
          </div>

          {/* Metrics comparison grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase">Salário Mensal Convertido</span>
              <div className="text-2xl font-black text-white font-mono">
                R$ {Math.round(brlEquivalent).toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-slate-500">Câmbio comercial estimado: 1 USD = R$ {exchangeRate.toFixed(2)}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase">Rendimento Anual Bruto</span>
              <div className="text-2xl font-black text-purple-300 font-mono">
                R$ {Math.round(annualBrl).toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-slate-500">Faturamento anual em contratos PJ / Contractor</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <span className="text-xs text-emerald-400 font-mono uppercase font-bold">Ganho Extra / Mês vs CLT Médio</span>
              <div className="text-2xl font-black text-emerald-300 font-mono">
                +R$ {Math.round(monthlyDifference).toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-emerald-400/80">Diferença em relação a um salário nacional sênior</p>
            </div>
          </div>

          {/* CTA Banner inside calculator */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900/90 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>O único obstáculo entre você e essa remuneração é o inglês falado na entrevista.</span>
              </div>
              <p className="text-xs text-slate-400">
                Faça seu pré-cadastro e receba o diagnóstico gratuito da sua stack técnica.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPreReg}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm font-bold hover:opacity-95 shadow-lg shadow-purple-500/25 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Garantir Vaga no Pré-Registro</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};
