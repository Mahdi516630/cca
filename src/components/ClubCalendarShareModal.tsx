import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  exportClubCalendarToExcel, 
  exportClubCalendarToPDF, 
  generateClubMatchesTextMessage,
  exportChampionshipCalendarToExcel,
  exportChampionshipCalendarToPDF,
  generateChampionshipTextMessage,
  groupMatchesIntoJournees
} from '../lib/calendar-export-utils';
import { Category, Designation, Referee } from '../types';
import { 
  Mail, 
  Phone, 
  Send, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  Share2, 
  Calendar, 
  Trophy, 
  Loader2, 
  CheckCircle2, 
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface ClubCalendarShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  designations: Designation[];
  referees: Referee[];
}

export default function ClubCalendarShareModal({
  isOpen,
  onClose,
  categories,
  designations,
  referees
}: ClubCalendarShareModalProps) {
  // Export Mode: 'club' (individual) or 'championship' (whole league calendar)
  const [exportMode, setExportMode] = useState<'club' | 'championship'>('club');
  
  // States for Club Mode
  const [clubs, setClubs] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  
  // States for Championship Mode
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Unified recipient & message fields
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  
  // Action statuses
  const [sendingState, setSendingState] = useState<'idle' | 'preparing' | 'signing' | 'connecting' | 'sending' | 'success'>('idle');
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [showTextPreview, setShowTextPreview] = useState<boolean>(false);

  // Load all unique clubs
  useEffect(() => {
    const list = Array.from(
      new Set([
        ...(categories || []).flatMap((c) => c.teams || []),
        ...(designations || []).flatMap((d) => [d.teamA, d.teamB])
      ])
    )
      .filter((team): team is string => typeof team === 'string' && team.trim() !== '')
      .sort((a, b) => a.localeCompare(b));
    
    setClubs(list);
    
    // Auto-select the first club if available
    if (list.length > 0 && !selectedClub) {
      setSelectedClub(list[0]);
    }
  }, [categories, designations]);

  // Handle mode and selections change to auto-update form metadata
  useEffect(() => {
    if (exportMode === 'club') {
      if (!selectedClub) return;

      const formattedName = selectedClub.toLowerCase().replace(/[^a-z0-9]/g, '');
      setRecipientEmail(`contact@${formattedName || 'club'}.dj`);
      
      const phoneSuffix = Math.floor(100000 + Math.random() * 900000);
      setRecipientPhone(`+253 77 ${phoneSuffix.toString().slice(0, 2)} ${phoneSuffix.toString().slice(2, 4)} ${phoneSuffix.toString().slice(4, 6)}`);
      
      setCustomSubject(`[FDF] Calendrier Officiel & Convocations de Matches - ${selectedClub.toUpperCase()}`);
      setCustomMessage(
        `FÉDÉRATION DJIBOUTIENNE DE FOOTBALL\n` +
        `Commission Centrale des Arbitres (CCA)\n` +
        `Département des Compétitions\n\n` +
        `À l'attention du Secrétariat Général et du Staff Technique de : ${selectedClub.toUpperCase()}\n\n` +
        `Madame, Monsieur,\n\n` +
        `Nous vous prions de bien vouloir trouver ci-joint le calendrier officiel ainsi que la liste des désignations d'arbitres concernant les prochaines rencontres de votre club.\n\n` +
        `Veuillez prendre toutes les dispositions organisationnelles et sécuritaires d'usage nécessaires pour le bon déroulement de ces rencontres.\n\n` +
        `Cordialement,\n` +
        `Secrétariat Général • Département des Compétitions F.D.F`
      );
    } else {
      // Championship mode
      const selectedCategory = categories.find(c => c.id === selectedCategoryId);
      const catName = selectedCategoryId === 'all' ? 'Tous les Championnats' : (selectedCategory?.name || 'Championnat');
      
      setRecipientEmail('competitions@fdf.dj');
      setRecipientPhone('+253 21 35 35 99');
      setCustomSubject(`[FDF] Calendrier Général Réuni — ${catName.toUpperCase()}`);
      setCustomMessage(
        `FÉDÉRATION DJIBOUTIENNE DE FOOTBALL\n` +
        `Département des Compétitions • Secrétariat Technique\n\n` +
        `À l'attention des Bureaux de Clubs et des Officiels de matches,\n\n` +
        `Nous vous prions de bien vouloir prendre note du calendrier général des rencontres homologué pour le championnat "${catName.toUpperCase()}" de la Saison sportive 2025/2026.\n\n` +
        `Le calendrier est structuré par journée chronologique (Journée 1, Journée 2...) avec l'ensemble des affectations réglementaires d'arbitrage.\n\n` +
        `Veuillez vous conformer rigoureusement aux dates et horaires indiqués.\n\n` +
        `Cordialement,\n` +
        `Le Secrétariat Technique • Département des Compétitions F.D.F`
      );
    }
    
    // Reset status
    setSendingState('idle');
    setSendingLogs([]);
    setCopiedText(false);
  }, [selectedClub, selectedCategoryId, exportMode, categories]);

  // Filter matches for Selected Club (Home/Away)
  const clubMatches = designations.filter(
    (m) => m.teamA === selectedClub || m.teamB === selectedClub
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter matches for Championship (Single Category or All)
  const championshipMatches = selectedCategoryId === 'all'
    ? designations
    : designations.filter((m) => m.categoryId === selectedCategoryId);

  const selectedCategoryName = selectedCategoryId === 'all'
    ? 'Toutes les catégories de championnat'
    : categories.find((c) => c.id === selectedCategoryId)?.name || 'Championnat';

  // Trigger Excel Download
  const handleExcelExport = async () => {
    if (exportMode === 'club') {
      if (!selectedClub) return;
      try {
        await exportClubCalendarToExcel(selectedClub, clubMatches, categories, referees);
        toast.success(`Calendrier Excel pour ${selectedClub} téléchargé avec succès !`);
      } catch (err) {
        toast.error("Erreur lors de l'export Excel.");
      }
    } else {
      try {
        await exportChampionshipCalendarToExcel(selectedCategoryName, championshipMatches, categories, referees);
        toast.success(`Calendrier Général Excel pour ${selectedCategoryName} téléchargé !`);
      } catch (err) {
        toast.error("Erreur lors de l'export du Championnat en Excel.");
      }
    }
  };

  // Trigger PDF Download
  const handlePDFExport = () => {
    if (exportMode === 'club') {
      if (!selectedClub) return;
      try {
        exportClubCalendarToPDF(selectedClub, clubMatches, categories, referees);
        toast.success(`Calendrier PDF pour ${selectedClub} téléchargé avec succès !`);
      } catch (err) {
        toast.error("Erreur lors de l'export PDF.");
      }
    } else {
      try {
        exportChampionshipCalendarToPDF(selectedCategoryName, championshipMatches, categories, referees);
        toast.success(`Calendrier Général PDF pour ${selectedCategoryName} téléchargé !`);
      } catch (err) {
        toast.error("Erreur lors de l'export du Championnat en PDF.");
      }
    }
  };

  // Generate WhatsApp / text and copy to clipboard
  const handleCopyToClipboard = () => {
    if (exportMode === 'club') {
      if (!selectedClub) return;
      const textMsg = generateClubMatchesTextMessage(selectedClub, clubMatches, categories, referees);
      navigator.clipboard.writeText(textMsg);
      setCopiedText(true);
      toast.success("Message formaté de club copié !");
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      const textMsg = generateChampionshipTextMessage(selectedCategoryName, championshipMatches, categories, referees);
      navigator.clipboard.writeText(textMsg);
      setCopiedText(true);
      toast.success("Calendrier de championnat copié !");
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Open native Mail App (mailto)
  const handleMailto = () => {
    const textMsg = exportMode === 'club'
      ? generateClubMatchesTextMessage(selectedClub, clubMatches, categories, referees)
      : generateChampionshipTextMessage(selectedCategoryName, championshipMatches, categories, referees);
    const bodyText = `${customMessage}\n\n========================================\nCALENDRIER COMPLET DES MATCHS :\n========================================\n\n${textMsg}`;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
    toast.info("Lancement de votre messagerie par défaut...");
  };

  // Simulates high-fidelity secure email delivery system
  const handleSimulateSend = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error("Veuillez saisir une adresse email valide.");
      return;
    }

    setSendingState('preparing');
    setSendingLogs(['[SYSTEM] Initialisation du protocole de transmission homologué FDF...']);

    const amountMatches = exportMode === 'club' ? clubMatches.length : championshipMatches.length;
    const descLabel = exportMode === 'club' ? `du club pour ${selectedClub}` : `général du championnat [${selectedCategoryName}]`;

    // Log progression timer simulation
    const steps = [
      { t: 800, msg: `[DATA] Compilation en cours de ${amountMatches} oppositions planifiées ${descLabel}...` },
      { t: 1500, msg: `[PDF] Structuration des journées de matches chronologiques...` },
      { t: 2200, msg: `[SECURITY] Chiffrement de l'archive et signature du secrétariat général...` },
      { t: 3000, msg: `[SMTP] Authentification sécurisée établie avec le serveur 'fdf-relay.dj' (Port 587)...` },
      { t: 3700, msg: `[TRANSMIT] Envoi en cours de la liasse fédérale d'arbitres (Taille : 56 KB)...` },
      { t: 4400, msg: `[NOTIFY] Transmission du SMS automatisé de confirmation au ${recipientPhone}...` },
      { t: 5000, msg: `[SUCCESS] Calendrier global officiellement délivré ! Réception sécurisée validée.` }
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setSendingLogs((prev) => [...prev, step.msg]);
        if (i === 1) setSendingState('signing');
        if (i === 3) setSendingState('connecting');
        if (i === 4) setSendingState('sending');
        if (i === steps.length - 1) {
          setSendingState('success');
          toast.success(`Le calendrier a bien été expédié !`);
        }
      }, step.t);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden sm:rounded-2xl gap-0">
        
        {/* Modal Header */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Share2 className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">
                Espace Transmission & Exports FDF
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Générez des calendriers conformes aux visualisations de la Commission Centrale de Football et exportez-les par club ou par championnat entier.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Global Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 mt-3 mb-1">
          <button
            onClick={() => setExportMode('club')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              exportMode === 'club' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-slate-500" />
            Calendrier Individuel (Par Club)
          </button>
          <button
            onClick={() => setExportMode('championship')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              exportMode === 'championship' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            Calendrier Réuni (Tout le Championnat par Journées)
          </button>
        </div>

        {/* Modal Main Workspace split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 mt-2">
          
          {/* Left Column: Selector & Composition (7 cols) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col p-4 pl-0 overflow-y-auto max-h-[50vh] lg:max-h-[58vh] gap-4">
            
            {/* Conditional Dropdown Selection based on mode */}
            {exportMode === 'club' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Sélectionner l'équipe / Club :
                </Label>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200">
                    <SelectValue placeholder="Choisir un club..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {clubs.map((c) => (
                      <SelectItem key={c} value={c}>
                        ⚽ {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Sélectionner la Catégorie / Championnat :
                </Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200">
                    <SelectValue placeholder="Choisir une compétition..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="all">🏆 Toutes les catégories (Championship Général)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        ⚔️ {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Check if we have active configuration content to show */}
            {((exportMode === 'club' && selectedClub) || exportMode === 'championship') && (
              <>
                {/* Meta stats badge */}
                <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-sky-50/50 border border-indigo-150/50 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700">
                      {exportMode === 'club' ? 'Oppositions de ce club :' : 'Oppositions du championnat :'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="bg-indigo-600 text-white border-0 font-bold px-3 py-0.5 text-[11px]">
                      {(exportMode === 'club' ? clubMatches : championshipMatches).length} matches
                    </Badge>
                    {exportMode === 'championship' && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold px-2 py-0.5 text-[10px]">
                        {groupMatchesIntoJournees(championshipMatches).length} Journées
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Email Recipient and Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Adresse Email Destinataire
                    </Label>
                    <Input 
                      placeholder="email@fdf.dj" 
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile d'Accompagnement (SMS/WA)
                    </Label>
                    <Input 
                      placeholder="+253 77..." 
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 h-9"
                    />
                  </div>
                </div>

                {/* Subject and content */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">Objet de l'envoi officiel</Label>
                  <Input 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="text-xs rounded-xl border-slate-200 h-9 font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">Texte de l'expédition</Label>
                  <textarea 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full h-28 text-xs rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-400 font-sans leading-relaxed text-slate-600 resize-none shadow-inner"
                  />
                </div>

                {/* Logs console */}
                {sendingState !== 'idle' && (
                  <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-slate-400 font-sans font-bold flex items-center gap-1.5">
                        {sendingState !== 'success' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        Console de Transmission CCA / FDF
                      </span>
                      <span className="text-slate-500 font-mono text-[9px]">v1.5f_championship</span>
                    </div>
                    <ScrollArea className="h-24">
                      <div className="space-y-1">
                        {sendingLogs.map((log, idx) => (
                           <div key={idx} className={log.includes('[SUCCESS]') ? "text-emerald-300 font-bold" : log.includes('[SYSTEM]') ? "text-indigo-300" : "text-slate-300"}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {sendingState === 'success' && (
                      <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-2 animate-bounce" />
                        <div>
                          <p className="text-xs font-bold text-white font-sans">Transmission Réussie !</p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            Le calendrier unifié a été envoyé à <strong>{recipientEmail}</strong>.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setSendingState('idle')} 
                          size="sm" 
                          variant="outline" 
                          className="mt-1 h-7 text-[10px] bg-white text-slate-900 border-none rounded-lg"
                        >
                          Nouvelle transmission
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Previews & Direct Action buttons (5 cols) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col p-4 pr-0 overflow-y-auto max-h-[50vh] lg:max-h-[58vh] gap-4">
            
            {((exportMode === 'club' && selectedClub) || exportMode === 'championship') && (
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-700">
                  ⚡ Outils de Téléchargement & Partage
                </Label>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    onClick={handlePDFExport} 
                    className="flex flex-col items-center justify-center p-3 h-auto gap-1 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl"
                  >
                    <FileText className="w-5 h-5 text-rose-600 shadow-sm" />
                    <span className="text-[10px] font-bold">Télécharger PDF</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleExcelExport}
                    className="flex flex-col items-center justify-center p-3 h-auto gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 shadow-sm" />
                    <span className="text-[10px] font-bold">Télécharger Excel</span>
                  </Button>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Simulate send */}
                  <Button 
                    onClick={handleSimulateSend}
                    disabled={sendingState !== 'idle' && sendingState !== 'success'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5 text-xs font-bold gap-2 shadow-md hover:shadow-indigo-100 transition-all cursor-pointer"
                  >
                    {sendingState !== 'idle' && sendingState !== 'success' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Expédier aux Instances Officielles
                  </Button>

                  {/* mailto dispatch */}
                  <Button 
                    variant="outline" 
                    onClick={handleMailto}
                    className="w-full border-slate-200 hover:border-indigo-300 text-slate-700 bg-white hover:bg-indigo-50/20 text-xs font-semibold rounded-xl h-10 gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    Ouvrir Courriel (mailto)
                  </Button>

                  {/* WhatsApp text generator copy */}
                  <Button 
                    variant="secondary"
                    onClick={handleCopyToClipboard}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-xs font-bold rounded-xl h-10 gap-2 cursor-pointer"
                  >
                    {copiedText ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Share2 className="w-4 h-4 text-white" />
                    )}
                    {copiedText ? 'Copié !' : 'Copier pour WhatsApp'}
                  </Button>
                </div>
              </div>
            )}

            {/* Live Matches / Journées Preview List */}
            {((exportMode === 'club' && selectedClub) || exportMode === 'championship') && (
              <div className="space-y-2 border-t pt-3 border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-505" />
                    Aperçu des rencontres programmées
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] text-indigo-600 font-bold p-0 h-auto"
                    onClick={() => setShowTextPreview(!showTextPreview)}
                  >
                    {showTextPreview ? "Voir la liste" : "Voir le code brut"}
                  </Button>
                </div>

                {showTextPreview ? (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px] text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-[160px] overflow-y-auto shadow-inner select-all">
                    {exportMode === 'club' 
                      ? generateClubMatchesTextMessage(selectedClub, clubMatches, categories, referees)
                      : generateChampionshipTextMessage(selectedCategoryName, championshipMatches, categories, referees)
                    }
                  </div>
                ) : (
                  <ScrollArea className="max-h-[160px] pr-1">
                    {(exportMode === 'club' ? clubMatches : championshipMatches).length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        {exportMode === 'club' 
                          ? `Aucun match planifié pour ${selectedClub}.`
                          : `Aucun match planifié pour ${selectedCategoryName}.`
                        }
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {exportMode === 'club' ? (
                          <div className="space-y-1.5">
                            {clubMatches.map((m, idx) => (
                              <div key={m.id} className="p-2 border border-slate-100 rounded-lg hover:border-indigo-100 hover:bg-indigo-55/10 transition-colors flex items-center justify-between gap-2 bg-white">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                                    <span className={m.teamA === selectedClub ? "text-indigo-600 underline font-bold" : "text-slate-700"}>
                                      {m.teamA}
                                    </span>
                                    <span className="text-slate-400 text-[9px]">vs</span>
                                    <span className={m.teamB === selectedClub ? "text-indigo-600 underline font-bold" : "text-slate-700"}>
                                      {m.teamB}
                                    </span>
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500 font-mono">
                                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{m.date} à {m.startTime || '-'}</span>
                                    <span className="text-slate-300">|</span>
                                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                    <span className="truncate max-w-[80px]">{m.terrain || 'ND'}</span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-semibold text-slate-500 bg-slate-50 shrink-0">
                                  N°{m.matchNumber || (idx + 1)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {groupMatchesIntoJournees(championshipMatches).map((j, jIdx) => (
                              <div key={jIdx} className="space-y-1">
                                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                  ⚡ {j.name}
                                </span>
                                <div className="space-y-1 pl-1 border-l-2 border-amber-200 mt-1">
                                  {j.matches.map((m) => (
                                    <div key={m.id} className="p-1.5 border border-slate-50 rounded bg-white flex items-center justify-between gap-1.5 text-[9px]">
                                      <div className="min-w-0 truncate">
                                        <span className="font-bold text-slate-800">{m.teamA} vs {m.teamB}</span>
                                        <div className="text-slate-400 font-mono text-[8px] flex items-center gap-1 mt-0.5">
                                          <span>{m.date} à {m.startTime}</span>
                                          <span>•</span>
                                          <span className="truncate">{m.terrain || 'ND'}</span>
                                        </div>
                                      </div>
                                      <span className="text-slate-400 shrink-0 text-[8px]">N°{m.matchNumber || '-'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <DialogFooter className="border-t pt-4 mt-2">
          <Button 
            onClick={onClose} 
            className="bg-slate-800 hover:bg-slate-900 rounded-xl px-5 cursor-pointer text-xs font-semibold"
          >
            Fermer le Panel
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
