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
    <section className="section-padding bg-[#07070c] border-b border-zinc-800/80 relative overflow-hidden">
      <div className="container-wide space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Calculadora de Impacto Financeiro</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            O Retorno Real de Destravar o Inglês Técnico
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Profissionais brasileiros (Devs, Designers, Filmmakers, Administradores e Líderes) com inglês fluente ganham em média de <span className="text-white font-semibold">$3.500 a $10.000+ USD/mês</span> trabalhando remotamente para o exterior.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl p-6 sm:p-9 border border-zinc-800 bg-zinc-950 shadow-2xl space-y-8">
          {/* Slider control */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wide text-zinc-300">
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
              className="w-full h-2.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-zinc-800"
            />

            <div className="flex justify-between text-xs text-zinc-500 font-mono">
              <span>$3.000 USD (Mid-Level)</span>
              <span>$6.000 USD (Senior)</span>
              <span>$12.000 USD (Staff / Principal)</span>
            </div>
          </div>

          {/* Metrics comparison grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-mono uppercase">Salário Mensal Convertido</span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                R$ {Math.round(brlEquivalent).toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">1 USD = R$ {exchangeRate.toFixed(2)}</p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-mono uppercase">Rendimento Anual Bruto</span>
              <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                R$ {Math.round(annualBrl).toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">Faturamento anual em contratos PJ</p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
              <span className="text-[11px] text-emerald-400 font-mono uppercase font-bold">Ganho Extra vs CLT Médio</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                +R$ {Math.round(monthlyDifference).toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-emerald-400/70 font-mono">Diferença vs salário nacional sênior</p>
            </div>
          </div>

          {/* CTA Banner inside calculator */}
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>O único obstáculo entre você e essa remuneração é o inglês falado na entrevista.</span>
              </div>
              <p className="text-xs text-zinc-400">
                Faça seu pré-cadastro e receba o diagnóstico gratuito da sua stack técnica.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenPreReg}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-bold shadow-sm shrink-0 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Garantir Pré-Registro</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};
