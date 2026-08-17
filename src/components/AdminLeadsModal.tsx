import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Users, 
  Search, 
  Download, 
  Trash2, 
  Phone, 
  Mail, 
  GraduationCap, 
  Code2, 
  RefreshCw, 
  Building2,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Instagram,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import { PreRegistrationLead } from '../types';
import { getLeadsList, removeLead } from '../services/leadService';

interface AdminLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLeadsModal: React.FC<AdminLeadsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [leads, setLeads] = useState<PreRegistrationLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeadsList();
      setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  const handleExecuteDelete = async (leadId?: string) => {
    if (!leadId) return;

    setIsDeleting(true);
    // Optimistic UI update
    const previousLeads = [...leads];
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setConfirmDeleteId(null);

    try {
      await removeLead(leadId);
    } catch (err) {
      console.error("Error deleting lead:", err);
      // Revert if severe failure
      setLeads(previousLeads);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ["Nome", "Email", "Telefone", "Instagram", "Área", "Habilidades", "Formação", "Detalhes Formação", "Vaga Empresa", "Vaga Cargo", "Data de Cadastro"];
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.instagram || ''}"`,
      `"${l.area}"`,
      `"${(l.knownTechs || []).join('; ')}"`,
      `"${l.hasCourse || ''}"`,
      `"${(l.courseDetails || '').replace(/"/g, '""')}"`,
      `"${(l.jobContext?.company || '').replace(/"/g, '""')}"`,
      `"${(l.jobContext?.roleTitle || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleString('pt-BR')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidatos_devlingo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      lead.phone.includes(term) ||
      (lead.instagram && lead.instagram.toLowerCase().includes(term)) ||
      (lead.jobContext?.company && lead.jobContext.company.toLowerCase().includes(term)) ||
      (lead.knownTechs && lead.knownTechs.some(t => t.toLowerCase().includes(term)));

    const matchesArea = selectedAreaFilter === 'ALL' || lead.area === selectedAreaFilter;
    return matchesSearch && matchesArea;
  });

  const totalLeads = leads.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="admin-leads-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-5xl bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Solid Header */}
          <div className="p-6 md:p-7 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/60 text-zinc-300 text-[11px] font-mono tracking-wide uppercase font-semibold">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>Painel Corporativo • Gestão de Candidaturas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <span>Candidatos & Pré-Cadastros</span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-200 text-xs font-mono border border-zinc-700">
                  {totalLeads} {totalLeads === 1 ? 'registro' : 'registros'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Gerencie todos os profissionais inscritos, visualize dados de contato, redes e cargos de interesse.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchLeads}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium"
                title="Recarregar listagem"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 md:px-7 bg-zinc-950/60 border-b border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail, WhatsApp, Instagram ou stack..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:border-zinc-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedAreaFilter}
                onChange={(e) => setSelectedAreaFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs outline-none cursor-pointer focus:border-zinc-500"
              >
                <option value="ALL">Todas as Áreas</option>
                <option value="Engenharia de Software (Fullstack / Backend / Frontend)">Engenharia de Software</option>
                <option value="Design, UI/UX & Product Design">Design & UI/UX</option>
                <option value="Filmmaker, Vídeo & Motion Design">Filmmaker & Vídeo</option>
                <option value="Administração, Finanças & Operações">Administração & Finanças</option>
                <option value="Product Management & Projetos">Product & Projetos</option>
                <option value="Marketing Digital, Growth & Conteúdo">Marketing & Growth</option>
                <option value="Dados, BI & Inteligência Artificial">Dados & IA</option>
              </select>
            </div>
          </div>

          {/* Leads Content List */}
          <div className="p-4 md:p-7 overflow-y-auto flex-1 space-y-3.5">
            {loading ? (
              <div className="text-center py-20 space-y-3">
                <RefreshCw className="w-7 h-7 animate-spin mx-auto text-zinc-400" />
                <p className="text-sm text-zinc-400 font-mono">Carregando candidatos...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-20 space-y-3 bg-zinc-950/40 rounded-2xl border border-zinc-850 p-8">
                <AlertCircle className="w-10 h-10 mx-auto text-zinc-600" />
                <h3 className="text-base font-bold text-zinc-200">Nenhum registro encontrado</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  {searchTerm 
                    ? "Nenhum candidato corresponde aos termos de busca selecionados." 
                    : "Os pré-registros efetuados pelos usuários aparecerão listados aqui automaticamente em tempo real."}
                </p>
              </div>
            ) : (
              filteredLeads.map((lead, idx) => {
                const leadId = lead.id || `lead-${idx}`;
                const cleanPhone = lead.phone.replace(/\D/g, '');
                const whatsappUrl = `https://wa.me/55${cleanPhone}`;
                const isConfirming = confirmDeleteId === leadId;

                return (
                  <div
                    key={leadId}
                    className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3.5 shadow-sm"
                  >
                    {/* Top Row: User Header & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3.5">
                        {/* Monogram Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                          {lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-white">
                              {lead.name}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 text-[11px] font-mono border border-zinc-800">
                              {lead.area}
                            </span>
                          </div>

                          {/* Contact Badges */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                            {/* Email */}
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-zinc-500" />
                              <a href={`mailto:${lead.email}`} className="text-zinc-300 hover:text-white hover:underline">
                                {lead.email}
                              </a>
                              <button
                                onClick={() => handleCopyEmail(lead.email)}
                                title="Copiar e-mail"
                                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer"
                              >
                                {copiedEmail === lead.email ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                              <Phone className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{lead.phone}</span>
                            </div>

                            {/* Instagram */}
                            {lead.instagram && (
                              <div className="flex items-center gap-1 text-zinc-300">
                                <Instagram className="w-3.5 h-3.5 text-zinc-400" />
                                <a 
                                  href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-zinc-300 hover:text-white underline decoration-zinc-600"
                                >
                                  {lead.instagram}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Direct WhatsApp button */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Inline Delete Button with state confirmation */}
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 p-1 bg-red-950/40 border border-red-800/80 rounded-xl">
                            <span className="text-[11px] text-red-300 px-2 font-medium">Excluir?</span>
                            <button
                              onClick={() => handleExecuteDelete(lead.id)}
                              disabled={isDeleting}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs transition-all cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(leadId)}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800/60 transition-all cursor-pointer"
                            title="Excluir este cadastro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Techs & Courses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-zinc-900 text-xs">
                      <div>
                        <span className="text-zinc-500 block mb-1.5 flex items-center gap-1 font-mono text-[11px]">
                          <Code2 className="w-3.5 h-3.5 text-zinc-400" /> Tecnologias e Habilidades:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {lead.knownTechs && lead.knownTechs.length > 0 ? (
                            lead.knownTechs.map((tech, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-mono">
                                {tech}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-600 italic">Nenhuma informada</span>
                          )}
                          {lead.customTechs && (
                            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-mono">
                              + {lead.customTechs}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-500 block mb-1.5 flex items-center gap-1 font-mono text-[11px]">
                          <GraduationCap className="w-3.5 h-3.5 text-zinc-400" /> Formação Acadêmica:
                        </span>
                        <div className="text-zinc-300 font-medium">
                          <span>{lead.hasCourse || "Não informado"}</span>
                          {lead.courseDetails && (
                            <span className="text-zinc-500 text-[11px] block mt-0.5">
                              "{lead.courseDetails}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Targeted Job if analyzed */}
                    {lead.jobContext && (
                      <div className="px-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-zinc-500">Vaga Pesquisada:</span>
                          <span className="font-semibold text-white">{lead.jobContext.company || "Empresa"}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-300">{lead.jobContext.roleTitle || "Cargo"}</span>
                        </div>
                        {lead.createdAt && (
                          <span className="text-zinc-500 text-[11px] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
