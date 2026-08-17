import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Code2, 
  GraduationCap, 
  ArrowRight, 
  Loader2,
  Building2,
  ShieldCheck,
  Instagram
} from 'lucide-react';
import { JobAnalysis, PreRegistrationLead } from '../types';
import { saveLead } from '../services/leadService';

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobAnalysis: JobAnalysis | null;
  onSuccess?: (lead: PreRegistrationLead) => void;
}

const COMMON_TECHS = [
  "Figma",
  "Adobe Premiere",
  "After Effects",
  "DaVinci Resolve",
  "Excel Avançado / FP&A",
  "Notion / Jira",
  "Design Systems",
  "UI / UX Research",
  "Storyboarding & Roteiro",
  "Color Grading",
  "Gestão Ágil / Scrum",
  "Google Analytics / SEO",
  "React / Next.js",
  "Node.js",
  "Python",
  "JavaScript / TypeScript",
  "SQL / PostgreSQL",
  "AWS / Cloud",
  "Docker",
  "Java / Spring",
  "HubSpot / CRM"
];

const AREAS = [
  "Engenharia de Software (Fullstack / Backend / Frontend)",
  "Design, UI/UX & Product Design",
  "Filmmaker, Vídeo & Motion Design",
  "Administração, Finanças & Operações",
  "Product Management & Projetos",
  "Marketing Digital, Growth & Conteúdo",
  "Vendas, BDR & Customer Success",
  "Dados, BI & Inteligência Artificial",
  "DevOps, SRE & Cloud",
  "Outra Carreira / Transição"
];

const COURSES_OPTIONS = [
  "Faculdade / Graduação (TI, Design, ADM, Cinema, etc)",
  "Rocketseat / Alura",
  "EBAC / Cursos de Design & Audiovisual",
  "Udemy / Coursera",
  "Curso em Vídeo (Gustavo Guanabara)",
  "Bootcamp Intensivo",
  "100% Autodidata / Portfólio Próprio",
  "Outro Curso / Mentoria Especializada"
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
  const [instagram, setInstagram] = useState('');
  const [area, setArea] = useState('Engenharia de Software (Fullstack / Backend / Frontend)');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['React / Next.js', 'JavaScript / TypeScript', 'Figma']);
  const [customTech, setCustomTech] = useState('');
  const [hasCourse, setHasCourse] = useState('Faculdade / Graduação (TI, Design, ADM, Cinema, etc)');
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

  const handleInstagramChange = (val: string) => {
    let formatted = val.trim();
    if (formatted && !formatted.startsWith('@') && !formatted.startsWith('http')) {
      formatted = `@${formatted}`;
    }
    setInstagram(formatted);
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
      setError("Por favor, marque pelo menos 1 ferramenta ou tecnologia.");
      return;
    }

    setIsSubmitting(true);

    const leadData: PreRegistrationLead = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      instagram: instagram.trim() || undefined,
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
      const result = await saveLead(leadData);
      const finalizedLead = {
        ...leadData,
        id: result.id
      };

      setSavedLead(finalizedLead);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(finalizedLead);
      }
    } catch (err: any) {
      console.error("Error submitting lead:", err);
      setError(err?.message || "Ocorreu um erro ao processar sua solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="preregistration-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-2xl bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Solid Header */}
          <div className="p-6 md:p-7 bg-zinc-950 border-b border-zinc-800/80 flex items-start justify-between relative">
            <div className="space-y-2 pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/60 text-zinc-300 text-[11px] font-mono tracking-wide uppercase font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Acesso Antecipado • Vagas Limitadas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isSuccess ? "Inscrição Confirmada" : "Candidatura para Treinamento Internacional"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
                {isSuccess 
                  ? "Sua candidatura foi registrada com sucesso. Entraremos em contato para os próximos passos." 
                  : "Preencha seus dados para calibrar o programa especificamente para o seu cargo e ferramentas."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Job Target Badge Preview if available */}
          {jobAnalysis && (
            <div className="px-6 py-3 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <span>Posição Alvo:</span>
                <span className="text-white font-semibold">{jobAnalysis.company}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300">{jobAnalysis.roleTitle}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-700">
                {jobAnalysis.level}
              </span>
            </div>
          )}

          {/* Modal Content with sleek scroll */}
          <div className="p-6 md:p-7 overflow-y-auto flex-1 space-y-6 text-zinc-200">
            {isSuccess && savedLead ? (
              /* Success View - Solid Black/White High-End */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white">
                    Tudo pronto, {savedLead.name.split(' ')[0]}!
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Recebemos sua solicitação para a área de <strong className="text-white font-semibold">{savedLead.area}</strong>. Nossa equipe entrará em contato em breve via WhatsApp e E-mail.
                  </p>
                </div>

                {/* Profile Summary Card */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-4 max-w-lg mx-auto shadow-sm">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-3 border-b border-zinc-800/80">
                    <span className="font-semibold uppercase tracking-wider text-zinc-300 font-mono text-[11px]">Resumo da Candidatura</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Confirmado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-zinc-500 block mb-0.5">Nome:</span>
                      <span className="text-white font-medium">{savedLead.name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block mb-0.5">E-mail:</span>
                      <span className="text-white font-medium break-all">{savedLead.email}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block mb-0.5">WhatsApp:</span>
                      <span className="text-white font-medium">{savedLead.phone}</span>
                    </div>
                    {savedLead.instagram && (
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Instagram:</span>
                        <span className="text-zinc-300 font-medium">{savedLead.instagram}</span>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 block mb-0.5">Área de Atuação:</span>
                      <span className="text-zinc-200 font-medium">{savedLead.area}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 block mb-0.5">Formação / Experiência:</span>
                      <span className="text-zinc-300 font-medium">{savedLead.hasCourse}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80">
                    <span className="text-zinc-500 text-xs block mb-2">Habilidades Selecionadas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {savedLead.knownTechs.map((tech, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                  >
                    Concluir & Retornar
                  </button>
                </div>
              </div>
            ) : (
              /* Form View - Clean Solid Corporate Design */
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Dados de Contato */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>1. Dados de Contato</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Nome */}
                    <div>
                      <label className="block text-xs text-zinc-300 font-medium mb-1.5">
                        Nome Completo <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Carlos Silva"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:border-zinc-500 focus:bg-zinc-900 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs text-zinc-300 font-medium mb-1.5">
                        E-mail Principal <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:border-zinc-500 focus:bg-zinc-900 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Telefone / WhatsApp */}
                    <div>
                      <label className="block text-xs text-zinc-300 font-medium mb-1.5">
                        WhatsApp (com DDD) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:border-zinc-500 focus:bg-zinc-900 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-xs text-zinc-300 font-medium mb-1.5">
                        Instagram (opcional)
                      </label>
                      <div className="relative">
                        <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          value={instagram}
                          onChange={(e) => handleInstagramChange(e.target.value)}
                          placeholder="@seu.perfil"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:border-zinc-500 focus:bg-zinc-900 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Área de Atuação */}
                <div className="space-y-3 pt-4 border-t border-zinc-850">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    <Briefcase className="w-4 h-4 text-zinc-400" />
                    <span>2. Área de Atuação Profissional <span className="text-red-400">*</span></span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AREAS.map((a) => {
                      const isSelected = area === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setArea(a)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-sm font-semibold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                          }`}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Ferramentas e Habilidades */}
                <div className="space-y-3 pt-4 border-t border-zinc-850">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      <Code2 className="w-4 h-4 text-zinc-400" />
                      <span>3. Ferramentas, Softwares e Habilidades <span className="text-red-400">*</span></span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {selectedTechs.length} selecionada(s)
                    </span>
                  </div>

                  {/* Tech chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_TECHS.map((tech) => {
                      const isSelected = selectedTechs.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white font-semibold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {isSelected && <span className="mr-1 font-bold">✓</span>}
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
                      placeholder="Outra ferramenta ou especialidade..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:border-zinc-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTech}
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                {/* 4. Formação e Cursos */}
                <div className="space-y-3 pt-4 border-t border-zinc-850">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    <GraduationCap className="w-4 h-4 text-zinc-400" />
                    <span>4. Formação Acadêmica ou Cursos</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COURSES_OPTIONS.map((c) => {
                      const isSelected = hasCourse === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setHasCourse(c)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-sm font-semibold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={courseDetails}
                      onChange={(e) => setCourseDetails(e.target.value)}
                      placeholder="Detalhes adicionais (instituição, semestre, certificação - opcional)"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:border-zinc-500 outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-zinc-400" />
                    <span>Seus dados são protegidos com confidencialidade total.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Enviando dados...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar Inscrição</span>
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
