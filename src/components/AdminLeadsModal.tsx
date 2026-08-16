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
  Briefcase, 
  GraduationCap, 
  Code2, 
  RefreshCw, 
  Building2,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle
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
  const [selectedLead, setSelectedLead] = useState<PreRegistrationLead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    }
  }, [isOpen]);

  const handleDeleteLead = async (leadId?: string) => {
    if (!leadId) return;
    if (!window.confirm("Deseja realmente remover este pré-registro da listagem?")) return;

    setDeletingId(leadId);
    try {
      await removeLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
    } catch (err) {
      console.error("Error deleting lead:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert("Nenhum lead para exportar.");
      return;
    }

    const headers = ["Nome", "Email", "Telefone", "Área", "Linguagens", "Cursos", "Detalhes Curso", "Vaga Empresa", "Vaga Cargo", "Data"];
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.area}"`,
      `"${(l.knownTechs || []).join('; ')}"`,
      `"${l.hasCourse || ''}"`,
      `"${(l.courseDetails || '').replace(/"/g, '""')}"`,
      `"${(l.jobContext?.company || '').replace(/"/g, '""')}"`,
      `"${(l.jobContext?.roleTitle || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleString('pt-BR')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tech_recruiter_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute metrics
  const totalLeads = leads.length;
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.jobContext?.company && lead.jobContext.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.knownTechs && lead.knownTechs.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesArea = selectedAreaFilter === 'ALL' || lead.area === selectedAreaFilter;
    return matchesSearch && matchesArea;
  });

  // Calculate tech frequencies
  const techCounts: { [key: string]: number } = {};
  leads.forEach(l => {
    (l.knownTechs || []).forEach(t => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });
  const topTechs = Object.entries(techCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="admin-leads-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative w-full max-w-5xl bg-[#0e1017] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-purple-950/80 via-[#131322] to-pink-950/50 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-pink-300" />
                <span>Área Administrativa • Painel de Controle de Usuários</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Leads & Pré-Cadastros</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30">
                  {totalLeads} {totalLeads === 1 ? 'usuário' : 'usuários'}
                </span>
              </h2>
              <p className="text-xs md:text-sm text-white/70">
                Visualize todos os candidatos que inseriram suas vagas, dados de contato e stacks técnicas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchLeads}
                disabled={loading}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                title="Atualizar listagem"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg shadow-purple-900/30"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/50 block mb-1">Total de Cadastros</span>
              <span className="text-xl font-bold text-white">{totalLeads}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/50 block mb-1">Stack Mais Popular</span>
              <span className="text-base font-bold text-pink-300">
                {topTechs[0] ? `${topTechs[0][0]} (${topTechs[0][1]})` : "N/D"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/50 block mb-1">2ª Stack em Alta</span>
              <span className="text-base font-bold text-purple-300">
                {topTechs[1] ? `${topTechs[1][0]} (${topTechs[1][1]})` : "N/D"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/50 block mb-1">Status do Banco</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Sincronizado
              </span>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="p-4 md:px-6 bg-[#0a0c12] border-b border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail, telefone, empresa ou tecnologia..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs md:text-sm focus:border-purple-400 outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedAreaFilter}
                onChange={(e) => setSelectedAreaFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL" className="bg-[#12131f]">Todas as Áreas</option>
                <option value="Frontend" className="bg-[#12131f]">Frontend</option>
                <option value="Backend" className="bg-[#12131f]">Backend</option>
                <option value="Full-Stack" className="bg-[#12131f]">Full-Stack</option>
                <option value="DevOps / Cloud" className="bg-[#12131f]">DevOps / Cloud</option>
                <option value="Mobile (iOS / Android)" className="bg-[#12131f]">Mobile</option>
                <option value="Data & Inteligência Artificial" className="bg-[#12131f]">Data / IA</option>
              </select>
            </div>
          </div>

          {/* Leads Table / List */}
          <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                <p className="text-sm text-white/60">Carregando usuários cadastrados...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-white/30" />
                <h3 className="text-base font-bold text-white/80">Nenhum pré-registro encontrado</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  {searchTerm 
                    ? "Nenhum resultado corresponde à sua pesquisa atual. Tente alterar os filtros."
                    : "Assim que os usuários colarem uma vaga ou escreverem o cargo na página inicial e preencherem o pré-registro, os dados aparecerão aqui em tempo real."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead, idx) => {
                  const cleanPhone = lead.phone.replace(/\D/g, '');
                  const whatsappUrl = `https://wa.me/55${cleanPhone}`;

                  return (
                    <div
                      key={lead.id || idx}
                      className="p-4 md:p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-md">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                              <span>{lead.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-400/30">
                                {lead.area}
                              </span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mt-0.5">
                              <span className="flex items-center gap-1 text-white/80">
                                <Mail className="w-3.5 h-3.5 text-purple-400" />
                                <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                              </span>
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{lead.phone}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {/* Direct WhatsApp button */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            disabled={deletingId === lead.id}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer"
                            title="Remover Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Techs & Courses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                        <div>
                          <span className="text-white/50 block mb-1 flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5 text-amber-400" /> Tecnologias que Sabe:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {lead.knownTechs && lead.knownTechs.length > 0 ? (
                              lead.knownTechs.map((tech, tIdx) => (
                                <span key={tIdx} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/20 text-[11px]">
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <span className="text-white/40 italic">Nenhuma informada</span>
                            )}
                            {lead.customTechs && (
                              <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-200 border border-pink-400/20 text-[11px]">
                                + {lead.customTechs}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-white/50 block mb-1 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Formação / Curso:
                          </span>
                          <div className="text-white/80 font-medium">
                            <span>{lead.hasCourse || "Não informado"}</span>
                            {lead.courseDetails && (
                              <span className="text-white/50 text-[11px] block mt-0.5">
                                "{lead.courseDetails}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Job Analysis Attachment Preview */}
                      {lead.jobContext && (
                        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-white/90">
                            <Building2 className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-white/50">Vaga Pesquisada:</span>
                            <span className="font-semibold text-pink-300">{lead.jobContext.company || "Empresa"}</span>
                            <span className="text-white/40">•</span>
                            <span className="text-purple-200">{lead.jobContext.roleTitle || "Cargo"}</span>
                          </div>
                          {lead.createdAt && (
                            <span className="text-white/40 text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(lead.createdAt).toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
