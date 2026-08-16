import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Code2, 
  GraduationCap, 
  ArrowRight, 
  Loader2,
  Building2,
  Lock,
  Star
} from 'lucide-react';
import { JobAnalysis, PreRegistrationLead } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobAnalysis: JobAnalysis | null;
  onSuccess?: (lead: PreRegistrationLead) => void;
}

const COMMON_TECHS = [
  "Frontend",
  "Java",
  "CSS / HTML",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Go (Golang)",
  "C# / .NET",
  "PHP",
  "Kotlin",
  "Swift",
  "SQL / PostgreSQL",
  "Docker",
  "AWS / Cloud",
  "Next.js",
  "Vue.js",
  "Angular",
  "C++"
];

const AREAS = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "DevOps / Cloud",
  "Mobile (iOS / Android)",
  "Data & Inteligência Artificial",
  "QA / Testes & Automação",
  "Engenharia de Segurança",
  "Estudante / Transição de Carreira"
];

const COURSES_OPTIONS = [
  "Faculdade de TI (ADS, Ciência da Comp, SI, etc)",
  "Rocketseat",
  "Alura",
  "Curso em Vídeo (Gustavo Guanabara)",
  "Udemy / Coursera",
  "Bootcamp Intensivo",
  "100% Autodidata / Documentação",
  "Outro Curso / Mentoria"
];

export const PreRegistrationModal: React.FC<PreRegistrationModalProps> = ({
  isOpen,
  onClose,
  jobAnalysis,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Full-Stack');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['Frontend', 'JavaScript', 'CSS / HTML']);
  const [customTech, setCustomTech] = useState('');
  const [hasCourse, setHasCourse] = useState('Rocketseat');
  const [courseDetails, setCourseDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedLead, setSavedLead] = useState<PreRegistrationLead | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Phone auto formatting (Brazilian standard)
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.substring(0, 11);
    
    if (clean.length > 6) {
      clean = `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
    } else if (clean.length > 2) {
      clean = `(${clean.substring(0, 2)}) ${clean.substring(2)}`;
    }
    setPhone(clean);
  };

  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter(t => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const handleAddCustomTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!customTech.trim()) return;
    const trimmed = customTech.trim();
    if (!selectedTechs.includes(trimmed)) {
      setSelectedTechs([...selectedTechs, trimmed]);
    }
    setCustomTech('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Por favor, preencha nome, e-mail e telefone/WhatsApp.");
      return;
    }

    if (selectedTechs.length === 0) {
      setError("Por favor, marque pelo menos 1 linguagem ou tecnologia que você conhece ou estuda.");
      return;
    }

    setIsSubmitting(true);

    const leadData: PreRegistrationLead = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      area,
      knownTechs: selectedTechs,
      customTechs: customTech.trim() || undefined,
      hasCourse,
      courseDetails: courseDetails.trim() || undefined,
      jobContext: jobAnalysis ? {
        company: jobAnalysis.company,
        roleTitle: jobAnalysis.roleTitle,
        level: jobAnalysis.level,
        techStack: jobAnalysis.techStack,
        rawInput: jobAnalysis.sourceUrl || jobAnalysis.summary
      } : null,
      createdAt: new Date().toISOString(),
      status: 'novo'
    };

    try {
      // 1. Salva no backend local/API
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (!res.ok) {
        throw new Error("Falha ao registrar dados na API");
      }

      // 2. Salva também no Firestore para persistência em nuvem
      try {
        await addDoc(collection(db, 'leads'), {
          ...leadData,
          firestoreCreatedAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.warn("Firestore sync warning (API fallback active):", firestoreErr);
      }

      setSavedLead(leadData);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(leadData);
      }
    } catch (err: any) {
      console.error("Error submitting lead:", err);
      setError("Ocorreu um erro ao salvar o pré-registro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="preregistration-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f1019] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative p-6 md:p-8 bg-gradient-to-r from-purple-900/60 via-[#18112e] to-pink-900/40 border-b border-white/10 flex items-start justify-between">
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
                <span>Pré-Registro • Acesso Antecipado à IA</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {isSuccess ? "Pré-Registro Confirmado" : "Garanta Sua Vaga na Próxima Turma de Simulações"}
              </h2>
              <p className="text-xs md:text-sm text-white/70">
                {isSuccess 
                  ? "Seus dados foram salvos com sucesso no sistema. Entraremos em contato para liberar a simulação com Tech Recruiters." 
                  : "Preencha seus dados técnicos para calibrar o recrutador IA especificamente para o seu perfil e sua stack."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Job Target Badge Preview if available */}
          {jobAnalysis && (
            <div className="px-6 py-3 bg-purple-950/40 border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-white/90 font-medium">
                <Building2 className="w-4 h-4 text-pink-400" />
                <span>Vaga Analisada:</span>
                <span className="text-pink-300 font-semibold">{jobAnalysis.company}</span>
                <span className="text-white/40">•</span>
                <span className="text-purple-300">{jobAnalysis.roleTitle}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-200 text-[11px] font-semibold border border-pink-500/30">
                Nível: {jobAnalysis.level}
              </span>
            </div>
          )}

          {/* Modal Content */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-white">
            {isSuccess && savedLead ? (
              /* Success View */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    Parabéns, {savedLead.name.split(' ')[0]}!
                  </h3>
                  <p className="text-sm text-white/70 max-w-md mx-auto">
                    Seu perfil para a área de <strong className="text-pink-300">{savedLead.area}</strong> foi registrado no banco de dados com sucesso.
                  </p>
                </div>

                {/* Profile Summary Card */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3 max-w-lg mx-auto">
                  <div className="flex items-center justify-between text-xs text-white/60 pb-2 border-b border-white/10">
                    <span>Resumo do Pré-Registro</span>
                    <span className="text-emerald-400 font-semibold">● Salvo no Banco Admin</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/50 block">E-mail:</span>
                      <span className="text-white font-medium break-all">{savedLead.email}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">WhatsApp:</span>
                      <span className="text-white font-medium">{savedLead.phone}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Área de Atuação:</span>
                      <span className="text-purple-300 font-medium">{savedLead.area}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Curso / Formação:</span>
                      <span className="text-pink-300 font-medium">{savedLead.hasCourse}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/50 text-xs block mb-1.5">Linguagens & Tecnologias Marcadas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {savedLead.knownTechs.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200 border border-purple-400/20 text-[11px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    Concluir & Fechar
                  </button>
                </div>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Dados Pessoais */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>1. Seus Dados de Contato</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-xs text-white/70 font-medium mb-1">
                        Nome Completo <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Carlos Silva"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-sm focus:border-purple-400 focus:bg-white/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs text-white/70 font-medium mb-1">
                        E-mail Principal <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-sm focus:border-purple-400 focus:bg-white/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Telefone / WhatsApp */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-white/70 font-medium mb-1">
                        Telefone / WhatsApp (com DDD) <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-sm focus:border-purple-400 focus:bg-white/10 outline-none transition-all"
                        />
                      </div>
                      <span className="text-[11px] text-white/50 mt-1 block">
                        Usaremos este número para enviar notificações e novidades das turmas de entrevista.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Área de Atuação */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <Briefcase className="w-4 h-4 text-pink-400" />
                    <span>2. Em qual área você atua ou gostaria de atuar? <span className="text-pink-400">*</span></span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AREAS.map((a) => {
                      const isSelected = area === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setArea(a)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-900/30 ring-1 ring-purple-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Linguagens e Tecnologias que Sabe */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                      <Code2 className="w-4 h-4 text-amber-400" />
                      <span>3. Quais linguagens & tecnologias você sabe ou estuda? <span className="text-pink-400">*</span></span>
                    </div>
                    <span className="text-xs text-purple-300 font-medium">
                      {selectedTechs.length} selecionada(s)
                    </span>
                  </div>

                  {/* Tech chips */}
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TECHS.map((tech) => {
                      const isSelected = selectedTechs.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-400 text-white shadow-md'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {tech}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom tech addition */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customTech}
                      onChange={(e) => setCustomTech(e.target.value)}
                      onKeyDown={handleAddCustomTech}
                      placeholder="Adicionar outra linguagem ou ferramenta..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:border-purple-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTech}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                {/* 4. Cursos e Formação */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>4. Você faz ou já fez algum curso / faculdade?</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COURSES_OPTIONS.map((c) => {
                      const isSelected = hasCourse === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setHasCourse(c)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1">
                      Detalhes do curso, faculdade ou semestre (opcional):
                    </label>
                    <input
                      type="text"
                      value={courseDetails}
                      onChange={(e) => setCourseDetails(e.target.value)}
                      placeholder="Ex: Formação Ignite React na Rocketseat / 4º semestre de ADS"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Lock className="w-3.5 h-3.5 text-white/40" />
                    <span>Seus dados são 100% confidenciais e protegidos.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Salvando no Banco de Dados...</span>
                      </>
                    ) : (
                      <>
                        <span>Salvar Pré-Registro & Acessar Análise</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
