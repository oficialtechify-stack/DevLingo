import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface StreakCardProps {
  userId: string;
  streak: number;
  xp: number;
  streakShieldActive?: boolean;
  lostStreak?: number;
  onUpdateProfile?: (updated: { streak?: number; xp?: number; streakShieldActive?: boolean; lostStreak?: number }) => void;
  onStartInterview?: () => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  userId,
  streak = 0,
  xp = 0,
  streakShieldActive = false,
  lostStreak = 0,
  onUpdateProfile,
  onStartInterview
}) => {
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);

  const SHIELD_COST = 100;
  const RECOVER_COST = 150;

  const weekDays = [
    { label: 'Seg', active: streak >= 1 },
    { label: 'Ter', active: streak >= 2 },
    { label: 'Qua', active: streak >= 3 },
    { label: 'Qui', active: streak >= 4 },
    { label: 'Sex', active: streak >= 5 },
    { label: 'Sáb', active: streak >= 6 },
    { label: 'Dom', active: streak >= 7 },
  ];

  const handleActivateProtection = async () => {
    if (streakShieldActive) {
      setFeedbackMessage({
        type: 'info',
        text: 'Seu Streak já está protegido! O escudo será consumido se você perder um dia.'
      });
      return;
    }

    if (xp < SHIELD_COST) {
      setFeedbackMessage({
        type: 'error',
        text: `Você precisa de ${SHIELD_COST} XP para ativar a proteção. Você tem ${xp} XP no momento.`
      });
      return;
    }

    setLoading(true);
    try {
      const newXp = xp - SHIELD_COST;
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        xp: newXp,
        streakShieldActive: true
      });

      if (onUpdateProfile) {
        onUpdateProfile({ xp: newXp, streakShieldActive: true });
      }

      setFeedbackMessage({
        type: 'success',
        text: `🛡️ Proteção de Streak ativada com sucesso! Gastou ${SHIELD_COST} XP.`
      });
    } catch (err: any) {
      console.error('Error activating streak protection:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Não foi possível ativar a proteção. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverStreak = async () => {
    if (xp < RECOVER_COST) {
      setFeedbackMessage({
        type: 'error',
        text: `Você precisa de ${RECOVER_COST} XP para recuperar sua sequência. Você tem ${xp} XP.`
      });
      return;
    }

    setLoading(true);
    try {
      const recoveredAmount = lostStreak > 0 ? lostStreak : 5;
      const newStreak = (streak || 0) + recoveredAmount;
      const newXp = xp - RECOVER_COST;
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        xp: newXp,
        streak: newStreak,
        lostStreak: 0,
        streakShieldActive: true
      });

      if (onUpdateProfile) {
        onUpdateProfile({ 
          xp: newXp, 
          streak: newStreak, 
          lostStreak: 0, 
          streakShieldActive: true 
        });
      }

      setShowRecoverModal(false);
      setFeedbackMessage({
        type: 'success',
        text: `⚡ Sequência recuperada para ${newStreak} dias! O escudo protetor foi ativado.`
      });
    } catch (err: any) {
      console.error('Error recovering streak:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao recuperar sequência. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6 md:p-7 rounded-3xl relative overflow-hidden border border-white/10 shadow-xl">
        {/* Background ambient lighting */}
        <div 
          className={cn(
            "absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-500",
            streakShieldActive ? "bg-cyan-500/20" : "bg-orange-500/20"
          )} 
        />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                streakShieldActive 
                  ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/25" 
                  : "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/25"
              )}>
                {streakShieldActive ? (
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                ) : (
                  <Flame className="w-6 h-6 fill-current animate-bounce" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {streak} {streak === 1 ? 'Dia de Foco' : 'Dias Consecutivos'}
                  </h3>
                  {streakShieldActive && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Protegido
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50">
                  {streakShieldActive 
                    ? 'Escudo ativo: sua sequência não será perdida hoje.' 
                    : 'Pratique diariamente para manter seu ritmo de estudos.'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowInfoModal(true)}
              className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Como funciona o Streak Saver?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Visual Trackers */}
          <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-white/[0.03] border border-white/5">
            {weekDays.map((day, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-xl transition-all text-center",
                  day.active 
                    ? "bg-orange-500/15 border border-orange-500/30 text-orange-300" 
                    : "bg-white/[0.02] text-white/30 border border-transparent"
                )}
              >
                <span className="text-[10px] font-semibold uppercase">{day.label}</span>
                <div className="mt-1">
                  {day.active ? (
                    <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/20 my-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status & Protection Banner */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
            streakShieldActive 
              ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-200" 
              : "bg-white/[0.02] border-white/10 text-white/70"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                streakShieldActive ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-white/40"
              )}>
                {streakShieldActive ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {streakShieldActive ? 'Streak Saver Ativo' : 'Proteção Desativada'}
                  </span>
                  <span className="text-[10px] text-white/40">({SHIELD_COST} XP)</span>
                </div>
                <p className="text-[11px] text-white/50">
                  {streakShieldActive 
                    ? 'Se você ficar 24h sem codar, o escudo salvará seus dias.' 
                    : 'Gaste XP para não perder sua sequência caso esqueça um dia.'}
                </p>
              </div>
            </div>

            {/* Action Button: Ativar Proteção */}
            <button
              id="btn-ativar-protecao-streak"
              onClick={handleActivateProtection}
              disabled={loading || streakShieldActive}
              className={cn(
                "w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md whitespace-nowrap",
                streakShieldActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default"
                  : "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] glow-purple"
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : streakShieldActive ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Proteção Ativada</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span>Ativar Proteção ({SHIELD_COST} XP)</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Actions / Streak Recovery */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Seu saldo: <strong className="text-white">{xp} XP</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRecoverModal(true)}
                className="text-white/60 hover:text-white flex items-center gap-1.5 transition-colors underline decoration-white/20 hover:decoration-white"
              >
                <RotateCcw className="w-3 h-3 text-orange-400" />
                <span>Recuperar Sequência Perdida</span>
              </button>
            </div>
          </div>

          {/* Feedback message banner */}
          <AnimatePresence>
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "p-3 rounded-xl text-xs flex items-start gap-2.5 border transition-all",
                  feedbackMessage.type === 'success' && "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
                  feedbackMessage.type === 'error' && "bg-rose-950/40 border-rose-500/30 text-rose-200",
                  feedbackMessage.type === 'info' && "bg-blue-950/40 border-blue-500/30 text-blue-200"
                )}
              >
                {feedbackMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                {feedbackMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                {feedbackMessage.type === 'info' && <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                
                <div className="flex-1">
                  <p>{feedbackMessage.text}</p>
                  {feedbackMessage.type === 'error' && xp < SHIELD_COST && onStartInterview && (
                    <button
                      onClick={onStartInterview}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      Fazer entrevista para ganhar XP (+100 XP)
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setFeedbackMessage(null)}
                  className="text-white/40 hover:text-white p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 relative space-y-5 bg-slate-900/90 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-primary">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="font-bold text-lg text-white">Como funciona o Streak Saver?</h3>
                </div>
                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    1. Escudo de Proteção (100 XP)
                  </div>
                  <p className="text-xs text-white/60">
                    Ao ativar a proteção, seu próximo dia de ausência não zera sua sequência. O escudo absorve a falta automaticamente.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider">
                    <RotateCcw className="w-4 h-4 text-orange-400" />
                    2. Recuperação de Dias (150 XP)
                  </div>
                  <p className="text-xs text-white/60">
                    Perdeu uma sequência por imprevistos no trabalho ou correria? Use seus pontos de XP para restaurar seus dias e voltar com tudo.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-400" />
                    3. Como acumular XP?
                  </div>
                  <p className="text-xs text-white/60">
                    Ganhe XP respondendo perguntas nas simulações de entrevista técnica com a IA (+100 XP), completando trilhas de vocabulário e mantendo seus estudos em dia.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 bg-brand-primary font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
              >
                Entendi, vamos codar!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recover Streak Modal */}
      <AnimatePresence>
        {showRecoverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 relative space-y-5 bg-slate-900/95 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-400">
                  <RotateCcw className="w-6 h-6" />
                  <h3 className="font-bold text-lg text-white">Recuperar Sequência Perdida</h3>
                </div>
                <button 
                  onClick={() => setShowRecoverModal(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/70 leading-relaxed">
                  Deseja usar seus pontos de experiência para restaurar sua sequência de dias consecutivos e já ativar a proteção para o próximo dia?
                </p>

                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-orange-300 font-bold uppercase tracking-wider block">Custo de Recuperação</span>
                    <span className="text-xl font-extrabold text-white">{RECOVER_COST} XP</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/40 block">Seu saldo</span>
                    <span className={cn("text-base font-bold", xp >= RECOVER_COST ? "text-emerald-400" : "text-rose-400")}>
                      {xp} XP
                    </span>
                  </div>
                </div>

                {xp < RECOVER_COST && (
                  <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">
                    Você não tem XP suficiente no momento. Pratique uma simulação de entrevista para ganhar mais XP!
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecoverModal(false)}
                  className="flex-1 py-3 bg-white/10 font-bold text-xs rounded-xl hover:bg-white/15 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRecoverStreak}
                  disabled={loading || xp < RECOVER_COST}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 disabled:opacity-40 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Confirmar ({RECOVER_COST} XP)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
