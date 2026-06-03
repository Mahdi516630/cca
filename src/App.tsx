import React, { useState, useEffect } from 'react';
import { Referee, Category, Designation } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ClubCalendarShareModal from './components/ClubCalendarShareModal';
import { 
  PlusCircle, 
  Share2, 
  Trash2, 
  Pencil, 
  FileText, 
  Users, 
  Layers, 
  Calendar, 
  LogIn, 
  LogOut,
  Download,
  Filter,
  UserPlus,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Info,
  BookOpen,
  Shield,
  Trophy,
  Clock,
  MapPin,
  CalendarDays,
  Upload,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  startOfWeek, 
  startOfMonth, 
  startOfQuarter, 
  startOfYear, 
  isAfter, 
  parseISO 
} from 'date-fns';
import { generateRefereeExcelReport, generateSingleCategoryExcelAudit, exportDesignationsToExcel, generateBulkDesignationsExcel, generateNetAPayerExcelReport } from './lib/excel-utils';


const HomePage = ({ token, setCurrentPage, setIsRegister }: any) => (
  <motion.div 
    key="home"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
    className="space-y-12 py-12"
  >
    <section className="text-center space-y-6">
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl"
      >
        Referee <span className="text-primary italic">Manager</span>
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
      >
        L'excellence de l'arbitrage djiboutien portée par une technologie de pointe. Gérez, suivez et optimisez chaque sifflet.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-4"
      >
        {token ? (
          <Button size="lg" onClick={() => setCurrentPage('manager')} className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
            Dashboard <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button size="lg" onClick={() => { setCurrentPage('manager'); setIsRegister(false); }} className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
            Se Connecter <LogIn className="w-5 h-5 ml-2" />
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={() => setCurrentPage('about')} className="h-12 px-8 text-lg rounded-full border-2">
          En savoir plus
        </Button>
      </motion.div>
    </section>

    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      {[
        { icon: Calendar, title: "Désignations", desc: "Affectation intelligente et suivi des matchs en temps réel.", color: "text-orange-500", bg: "bg-orange-50" },
        { icon: FileText, title: "Rapports", desc: "Génération instantanée de documents financiers certifiés.", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Users, title: "Fédérateur", desc: "Un annuaire centralisé pour tous les arbitres de la nation.", color: "text-green-500", bg: "bg-green-50" }
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + (i * 0.1), duration: 0.5 }}
        >
          <Card className="border-none shadow-xl hover:translate-y-[-4px] transition-transform duration-300 overflow-hidden group">
            <div className={`h-2 ${item.bg.replace('50', '500')}`} />
            <CardHeader>
              <div className={`${item.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription className="text-slate-600 leading-relaxed text-base">{item.desc}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const AboutPage = () => (
  <motion.div 
    key="about"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-4xl mx-auto py-12 space-y-8 px-4"
  >
    <div className="flex items-center gap-4 border-b pb-6">
      <div className="bg-primary/10 p-3 rounded-xl">
        <Info className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-4xl font-bold tracking-tight">À Propos de la CCA</h2>
    </div>
    
    <Card className="border-none shadow-2xl bg-white p-8 md:p-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="space-y-8 text-lg leading-relaxed text-slate-700 relative z-10">
        <p className="font-medium text-xl text-slate-900 border-l-4 border-primary pl-6">
          La Commission Centrale des Arbitres (CCA) est le garant de l'équité sportive et de l'excellence technique du football djiboutien.
        </p>
        <p>
          Sous l'égide de la Fédération Djiboutienne de Football (FDF), nous formons la nouvelle génération d'officiels capables de briller sur la scène nationale et internationale.
        </p>
        <div className="grid sm:grid-cols-2 gap-8 my-12">
          <div className="bg-slate-50 p-6 rounded-2xl">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full p-0 bg-green-500 border-none" /> Modernisation
            </h4>
            <p className="text-slate-600 text-base">Digitalisation complète du flux de travail des désignations.</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full p-0 bg-blue-500 border-none" /> Transparence
            </h4>
            <p className="text-slate-600 text-base">Gestion rigoureuse et automatisée des indemnités d'arbitrage.</p>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Nos Coordonnées</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-base text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span>Fédération Djiboutienne de Football</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span>cca@fdf.dj</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const DocumentationPage = () => {
  const [activeDocSection, setActiveDocSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Vue d\'ensemble', icon: Info },
    { id: 'referees', title: 'Gestion des Arbitres', icon: Users },
    { id: 'categories', title: 'Catégories & Tarifs', icon: Layers },
    { id: 'designations', title: 'Désignations', icon: Calendar },
    { id: 'reports', title: 'Rapports & Finance', icon: FileText },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto py-8 px-4"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <Card className="border-none shadow-sm sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Sommaire</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveDocSection(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeDocSection === s.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                    {s.title}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeDocSection === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tight">Bienvenue sur Referee Manager</h2>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Cette plateforme est l'outil central de la Commission Centrale des Arbitres (CCA). 
                    Elle permet de centraliser l'administration, de sécuriser les données et d'automatiser 
                    les processus financiers complexes.
                  </p>
                </div>
                
                <img src="/artifacts/referee_dashboard_preview.png" alt="Dashboard Preview" className="w-full rounded-2xl shadow-2xl border" referrerPolicy="no-referrer" />

                <div className="grid sm:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">🚀 Objectifs</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600">
                      Zéro papier, une rapidité de traitement multipliée par 10 et une précision comptable absolue.
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">🛡️ Sécurité</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600">
                      Accès restreint par rôles, validation par l'administrateur et traçabilité des modifications.
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeDocSection === 'referees' && (
              <motion.div
                key="referees"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold">Gestion des Arbitres</h2>
                <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-lg">
                  <p>
                    La gestion des arbitres est le socle de l'application. Chaque arbitre possède une fiche détaillée
                    indispensable pour les désignations et la paie.
                  </p>
                  <div className="bg-white p-6 rounded-2xl border-l-4 border-primary shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900">Champs obligatoires :</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Nom complet :</strong> Identité officielle pour les rapports Excel.</li>
                      <li><strong>Grade :</strong> Détermine la légitimité pour certaines catégories de matchs.</li>
                      <li><strong>Téléphone :</strong> Coordonnées de contact pour les urgences.</li>
                    </ul>
                  </div>
                  <p className="text-sm italic bg-slate-100 p-4 rounded-xl">
                    Note : Seuls les Admin et Managers peuvent ajouter ou modifier des arbitres.
                  </p>
                </div>
              </motion.div>
            )}

            {activeDocSection === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold">Catégories & Système de Paie</h2>
                <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-lg">
                  <p>
                    Le système calcule automatiquement les sommes dues en fonction de la catégorie définie pour le match.
                  </p>
                  <div className="grid gap-4">
                    <div className="flex gap-4 items-start bg-white p-6 rounded-2xl shadow-sm">
                      <div className="bg-green-100 p-3 rounded-xl text-green-600"><Layers className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Frais par Rôle</h4>
                        <p>Vous pouvez définir des tarifs spécifiques pour l'Arbitre Central, les Assistants et le 4ème Arbitre.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeDocSection === 'designations' && (
              <motion.div
                key="designations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold">Désignations de Match</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Le module de désignation permet de planifier les rencontres et d'affecter les officiels. 
                  Il vérifie en amont la cohérence des dates et des terrains.
                </p>
                <img src="/artifacts/referee_reports_preview.png" alt="Reports View" className="w-full rounded-2xl shadow-2xl border" referrerPolicy="no-referrer" />
                <div className="bg-blue-600 text-white p-8 rounded-3xl space-y-4">
                  <h4 className="text-xl font-bold">Processus de désignation :</h4>
                  <ol className="list-decimal pl-5 space-y-3 opacity-90">
                    <li>Sélectionner la catégorie (ex: Championnat D1)</li>
                    <li>Choisir l'Arbitre Central dans la liste filtrable</li>
                    <li>Assigner les assistants et le 4ème arbitre (si nécessaire)</li>
                    <li>Vérifier les horaires et le lieu du match</li>
                  </ol>
                </div>
              </motion.div>
            )}

            {activeDocSection === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold">Exportations financières</h2>
                <p className="text-lg text-slate-600">
                  Générez des documents Excel prêts pour la signature et le paiement.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-dashed p-6 rounded-3xl hover:border-primary transition-all">
                    <FileText className="w-12 h-12 text-primary mb-4" />
                    <h4 className="text-xl font-bold mb-2">Rapport Audit Mensuel</h4>
                    <p className="text-slate-500">Détaille match par match les rôles occupés par chaque arbitre sur une période donnée.</p>
                  </Card>
                  <Card className="border-2 border-dashed p-6 rounded-3xl hover:border-green-500 transition-all">
                    <Download className="w-12 h-12 text-green-500 mb-4" />
                    <h4 className="text-xl font-bold mb-2">Rapport Net à Payer</h4>
                    <p className="text-slate-500">Récapitulatif financier global regroupant les sommes par arbitre pour la comptabilité.</p>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  // Navigation state
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'doc' | 'manager'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  
  // Selection state
  const [selectedDesignationIds, setSelectedDesignationIds] = useState<string[]>([]);
  
  // Auth form states
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [securityAccepted, setSecurityAccepted] = useState(false);
  const [showSecurityClause, setShowSecurityClause] = useState(false);

  // Form states
  const [newReferee, setNewReferee] = useState<{name: string; phone: string; grade: string; allowedCategories: string[]}>({ name: '', phone: '', grade: '', allowedCategories: [] });
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [newCategory, setNewCategory] = useState<{name: string; centralFee: number; assistantFee: number; fourthFee: number; teams: string[]}>({ name: '', centralFee: 0, assistantFee: 0, fourthFee: 0, teams: [] });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newTeamsInput, setNewTeamsInput] = useState('');
  const [editTeamsInput, setEditTeamsInput] = useState('');
  const [newDesignation, setNewDesignation] = useState<Partial<Designation>>({
    date: '', teamA: '', teamB: '', matchNumber: '', startTime: '', endTime: '',
    categoryId: '', centralId: '', assistant1Id: '', assistant2Id: '', fourthId: '',
    mayorCommissioner: ''
  });
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'>('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [refereeSearch, setRefereeSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categoryToDeleteCalendar, setCategoryToDeleteCalendar] = useState<{ id: string, name: string } | null>(null);

  // Match Sheet State
  const [matchSheets, setMatchSheets] = useState<any[]>([]);
  const [selectedMatchForSheet, setSelectedMatchForSheet] = useState<string>("");
  const [sheetForm, setSheetForm] = useState({
    categoryId: "",
    matchNumber: "",
    scoreA: 0,
    scoreB: 0,
    scorers: "",
    cards: "",
    observations: "",
    scannedSheet: ""
  });

  // Automated Planning States
  const [designationMethod, setDesignationMethod] = useState<'manual' | 'auto'>('manual');
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showClubShareModal, setShowClubShareModal] = useState(false);
  const [planningConfig, setPlanningConfig] = useState({
    categoryId: '',
    type: 'simple' as 'simple' | 'aller-retour',
    weekDays: [] as number[], // Sunday (0) to Saturday (6)
    terrain: '',
    matchesPerWeek: 2,
    halfDuration: 45,
    startDate: new Date().toISOString().split('T')[0],
    startHour: '14:00'
  });

  const getEligibleReferees = (categoryId: string | undefined) => {
    if (!categoryId) return referees;
    return referees.filter(r => r.allowedCategories?.includes(categoryId));
  };

  // API Helper
  const api = async (path: string, options: any = {}) => {
    console.log(`API Call: ${path}`, options.body ? JSON.parse(options.body) : '');
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (res.status === 401) {
      handleLogout();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erreur serveur');
    }
    return data;
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setUsers([]);
      setReferees([]);
      setCategories([]);
      setDesignations([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, user?.role]);

  const fetchUser = async () => {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
      handleLogout();
    }
  };

  const fetchData = async () => {
    try {
      const [refs, cats, desigs, sheets] = await Promise.all([
        api('/api/referees'),
        api('/api/categories'),
        api('/api/designations'),
        api('/api/match_sheets').catch(() => [])
      ]);
      setReferees(refs);
      setCategories(cats);
      setDesignations(desigs);
      setMatchSheets(sheets);
      
      if (user?.role === 'admin') {
        try {
          const userData = await api('/api/users');
          setUsers(userData);
        } catch (err) {
          console.error("Error fetching users list:", err);
        }
      }

      // Clear selection when data is refreshed to avoid stale selection
      setSelectedDesignationIds([]);
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  const updateUserRole = async (id: number, role: string) => {
    try {
      await api(`/api/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      fetchData();
      toast.success('Rôle mis à jour');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (id: any, email: string) => {
    const userId = id || id === 0 ? id : null;
    if (!userId) {
      toast.error("ID d'utilisateur invalide");
      return;
    }

    if (email && user?.email && email.toLowerCase() === user.email.toLowerCase()) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (email === 'mahdiyacoubali318@gmail.com') {
      toast.error("Le compte super-administrateur ne peut pas être supprimé.");
      return;
    }
    
    if (!confirm(`Supprimer l'utilisateur ${email || 'inconnu'} (ID: ${userId}) ? Cette action est irréversible.`)) return;
    try {
      await api(`/api/users/${userId}`, { method: 'DELETE' });
      fetchData();
      toast.success('Utilisateur supprimé');
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !securityAccepted) {
      toast.error("Veuillez accepter la clause de sécurité pour continuer.");
      return;
    }
    const path = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const data = await api(path, {
        method: 'POST',
        body: JSON.stringify(authForm),
      });
      if (!isRegister) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        toast.success('Connexion réussie');
      } else {
        setIsRegister(false);
        toast.success('Compte créé, connectez-vous');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentPage('home');
  };

  const addReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferee.name.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api('/api/referees', {
        method: 'POST',
        body: JSON.stringify({ ...newReferee, id, createdAt: new Date().toISOString() }),
      });
      setNewReferee({ name: '', phone: '', grade: '', allowedCategories: [] });
      fetchData();
      toast.success('Arbitre ajouté');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReferee || !editingReferee.name.trim()) return;
    try {
      await api(`/api/referees/${editingReferee.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: editingReferee.name, 
          phone: editingReferee.phone || '',
          grade: editingReferee.grade || '',
          allowedCategories: editingReferee.allowedCategories || []
        }),
      });
      setEditingReferee(null);
      fetchData();
      toast.success('Arbitre mis à jour');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    try {
      await api(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingCategory),
      });
      setEditingCategory(null);
      fetchData();
      toast.success('Catégorie mise à jour');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const checkRefereeGapViolation = (
    refereeId: string,
    teamName: string,
    matchDate: string,
    matchId: string,
    categoryId: string
  ): { violated: boolean; message: string } => {
    if (!refereeId || refereeId === 'none') return { violated: false, message: '' };

    // Get all matches in this category, including the hypothetical/modified state of this match
    const catMatches = designations
      .filter(d => d.categoryId === categoryId && d.id !== matchId);
    
    // Create a temporary list adding our match
    const tempMatch = { id: matchId, date: matchDate, centralId: '', assistant1Id: '', assistant2Id: '', fourthId: '', teamA: teamName, teamB: '' };
    const allMatches = [...catMatches, tempMatch]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find our index
    const myIndex = allMatches.findIndex(m => m.id === matchId);

    // Look backward
    let lastRefIndex = -1;
    for (let i = myIndex - 1; i >= 0; i--) {
      const m = allMatches[i];
      const isRef = m.centralId === refereeId || 
                    m.assistant1Id === refereeId || 
                    m.assistant2Id === refereeId || 
                    m.fourthId === refereeId;
      const possessesTeam = m.teamA === teamName || m.teamB === teamName;
      if (isRef && possessesTeam) {
        lastRefIndex = i;
        break;
      }
    }

    if (lastRefIndex !== -1) {
      const gap = myIndex - lastRefIndex - 1;
      if (gap < 2) {
        const prevMatch = allMatches[lastRefIndex];
        return { 
          violated: true, 
          message: `L'arbitre a déjà arbitré l'équipe ${teamName} lors du match N° ${prevMatch.matchNumber || '-'} (${prevMatch.date}). Il n'y a que ${gap} match(s) d'écart (minimum 2 requis).`
        };
      }
    }

    // Look forward
    let nextRefIndex = -1;
    for (let i = myIndex + 1; i < allMatches.length; i++) {
      const m = allMatches[i];
      const isRef = m.centralId === refereeId || 
                    m.assistant1Id === refereeId || 
                    m.assistant2Id === refereeId || 
                    m.fourthId === refereeId;
      const possessesTeam = m.teamA === teamName || m.teamB === teamName;
      if (isRef && possessesTeam) {
        nextRefIndex = i;
        break;
      }
    }

    if (nextRefIndex !== -1) {
      const gap = nextRefIndex - myIndex - 1;
      if (gap < 2) {
        const nextMatch = allMatches[nextRefIndex];
        return { 
          violated: true, 
          message: `L'arbitre est déjà planifié pour arbitrer l'équipe ${teamName} lors du match futur N° ${nextMatch.matchNumber || '-'} (${nextMatch.date}). Il n'y a que ${gap} match(s) d'écart (minimum 2 requis).`
        };
      }
    }

    return { violated: false, message: '' };
  };

  const handleUpdateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesignation || !editingDesignation.categoryId || !editingDesignation.centralId) return;

    // Validate referee gap rules for the four roles
    const rolesToCheck = [
      { id: editingDesignation.centralId, label: 'Central' },
      { id: editingDesignation.assistant1Id, label: 'Assistant 1' },
      { id: editingDesignation.assistant2Id, label: 'Assistant 2' },
      { id: editingDesignation.fourthId, label: '4ème Arbitre' }
    ];

    for (const role of rolesToCheck) {
      if (role.id && role.id !== 'none') {
        const refObj = referees.find(r => r.id === role.id);
        const refName = refObj ? refObj.name : 'Arbitre';
        
        // Check Team A
        if (editingDesignation.teamA) {
          const checkA = checkRefereeGapViolation(role.id, editingDesignation.teamA, editingDesignation.date || '', editingDesignation.id, editingDesignation.categoryId);
          if (checkA.violated) {
            toast.error(`Règles d'espacement de matches violées pour ${refName} (${role.label}) avec l'équipe ${editingDesignation.teamA}.\n${checkA.message}`);
            return;
          }
        }

        // Check Team B
        if (editingDesignation.teamB) {
          const checkB = checkRefereeGapViolation(role.id, editingDesignation.teamB, editingDesignation.date || '', editingDesignation.id, editingDesignation.categoryId);
          if (checkB.violated) {
            toast.error(`Règles d'espacement de matches violées pour ${refName} (${role.label}) avec l'équipe ${editingDesignation.teamB}.\n${checkB.message}`);
            return;
          }
        }
      }
    }

    try {
      await api(`/api/designations/${editingDesignation.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingDesignation),
      });
      setEditingDesignation(null);
      fetchData();
      toast.success('Désignation mise à jour');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ ...newCategory, id }),
      });
      setNewCategory({ name: '', centralFee: 0, assistantFee: 0, fourthFee: 0, teams: [] });
      setNewTeamsInput('');
      fetchData();
      toast.success('Catégorie créée');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignation.categoryId || !newDesignation.centralId) {
      toast.error('Veuillez sélectionner au moins une catégorie et un arbitre central');
      return;
    }

    const id = Math.random().toString(36).substr(2, 9);

    // Validate referee gap rules for the four roles before manual creation
    const rolesToCheck = [
      { id: newDesignation.centralId, label: 'Central' },
      { id: newDesignation.assistant1Id, label: 'Assistant 1' },
      { id: newDesignation.assistant2Id, label: 'Assistant 2' },
      { id: newDesignation.fourthId, label: '4ème Arbitre' }
    ];

    for (const role of rolesToCheck) {
      if (role.id && role.id !== 'none') {
        const refObj = referees.find(r => r.id === role.id);
        const refName = refObj ? refObj.name : 'Arbitre';
        
        // Check Team A
        if (newDesignation.teamA) {
          const checkA = checkRefereeGapViolation(role.id, newDesignation.teamA, newDesignation.date || '', id, newDesignation.categoryId);
          if (checkA.violated) {
            toast.error(`Règles d'espacement de matches violées pour ${refName} (${role.label}) avec l'équipe ${newDesignation.teamA}.\n${checkA.message}`);
            return;
          }
        }

        // Check Team B
        if (newDesignation.teamB) {
          const checkB = checkRefereeGapViolation(role.id, newDesignation.teamB, newDesignation.date || '', id, newDesignation.categoryId);
          if (checkB.violated) {
            toast.error(`Règles d'espacement de matches violées pour ${refName} (${role.label}) avec l'équipe ${newDesignation.teamB}.\n${checkB.message}`);
            return;
          }
        }
      }
    }

    try {
      await api('/api/designations', {
        method: 'POST',
        body: JSON.stringify({ ...newDesignation, id }),
      });
      setNewDesignation({ 
        date: '', teamA: '', teamB: '', matchNumber: '', startTime: '', endTime: '',
        categoryId: '', centralId: '', assistant1Id: '', assistant2Id: '', fourthId: '',
        mayorCommissioner: ''
      });
      fetchData();
      toast.success('Désignation enregistrée');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSelectMatchForSaisie = (matchId: string) => {
    setSelectedMatchForSheet(matchId);
    if (!matchId || matchId === "custom") {
      setSheetForm({
        categoryId: "",
        matchNumber: "",
        scoreA: 0,
        scoreB: 0,
        scorers: "",
        cards: "",
        observations: "",
        scannedSheet: ""
      });
      return;
    }

    const match = designations.find(d => d.id === matchId);
    if (match) {
      // Find if we already have a match sheet saved
      const existingSheet = matchSheets.find(s => s.categoryId === match.categoryId && s.matchNumber === match.matchNumber);
      if (existingSheet) {
        setSheetForm({
          categoryId: match.categoryId,
          matchNumber: match.matchNumber || "",
          scoreA: existingSheet.scoreA || 0,
          scoreB: existingSheet.scoreB || 0,
          scorers: existingSheet.scorers || "",
          cards: existingSheet.cards || "",
          observations: existingSheet.observations || "",
          scannedSheet: existingSheet.scannedSheet || ""
        });
      } else {
        setSheetForm({
          categoryId: match.categoryId,
          matchNumber: match.matchNumber || "",
          scoreA: 0,
          scoreB: 0,
          scorers: "",
          cards: "",
          observations: "",
          scannedSheet: ""
        });
      }
    }
  };

  const handleSaveMatchSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetForm.categoryId || !sheetForm.matchNumber) {
      toast.error("Veuillez choisir une catégorie et un numéro de match");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api('/api/match_sheets', {
        method: 'POST',
        body: JSON.stringify({ ...sheetForm, id }),
      });
      toast.success("Feuille de match enregistrée avec succès");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const generateRoundRobinMatches = (teams: string[], type: 'simple' | 'aller-retour') => {
    let list = [...teams];
    if (list.length < 2) return [];
    
    const hasDummy = list.length % 2 !== 0;
    if (hasDummy) {
      list.push("BYE_DUMMY_TEAM");
    }
    
    const numTeams = list.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;
    
    let rounds: { teamA: string; teamB: string }[][] = [];
    
    for (let r = 0; r < numRounds; r++) {
      let roundMatches: { teamA: string; teamB: string }[] = [];
      for (let m = 0; m < matchesPerRound; m++) {
        const home = (r + m) % (numTeams - 1);
        const away = (numTeams - 1 - m + r) % (numTeams - 1);
        
        const teamHome = m === 0 ? list[numTeams - 1] : list[home];
        const teamAway = list[away];
        
        if (teamHome !== "BYE_DUMMY_TEAM" && teamAway !== "BYE_DUMMY_TEAM") {
          if (r % 2 === 0) {
            roundMatches.push({ teamA: teamHome, teamB: teamAway });
          } else {
            roundMatches.push({ teamA: teamAway, teamB: teamHome });
          }
        }
      }
      rounds.push(roundMatches);
    }
    
    let finalMatches: { teamA: string; teamB: string }[] = [];
    
    // Simple Aller
    rounds.forEach((roundMatches) => {
      finalMatches.push(...roundMatches);
    });
    
    // Aller-Retour
    if (type === 'aller-retour') {
      rounds.forEach((roundMatches) => {
        roundMatches.forEach((m) => {
          finalMatches.push({ teamA: m.teamB, teamB: m.teamA });
        });
      });
    }
    
    return finalMatches;
  };

  const handleGeneratePlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    const { categoryId, type, weekDays, terrain, matchesPerWeek, halfDuration, startDate, startHour } = planningConfig;
    
    if (!categoryId) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }
    if (weekDays.length === 0) {
      toast.error('Veuillez sélectionner au moins un jour de la semaine disponible');
      return;
    }
    if (!terrain.trim()) {
      toast.error('Veuillez renseigner le nom du terrain');
      return;
    }
    if (!matchesPerWeek || matchesPerWeek < 1) {
      toast.error('Nombre de matchs par semaine invalide');
      return;
    }
    
    const cat = categories.find(c => c.id === categoryId);
    if (!cat || !cat.teams || cat.teams.length < 2) {
      toast.error("Cette catégorie n'a pas assez d'équipes pour générer un calendrier (minimum 2).");
      return;
    }
    
    const matches = generateRoundRobinMatches(cat.teams, type);
    if (matches.length === 0) {
      toast.error('Impossible de générer les oppositions.');
      return;
    }
    
    const slotDurationMinutes = halfDuration * 2 + 15; // 2 mi-temps + 15 min de pause
    
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    let matchIndex = 0;
    let weekOffset = 0;
    
    const generated: any[] = [];
    const eligibleReferees = referees.filter(r => r.allowedCategories?.includes(categoryId));
    
    while (matchIndex < matches.length) {
      let weekStartDate = new Date(currentDate);
      weekStartDate.setDate(weekStartDate.getDate() + weekOffset * 7);
      
      let weekDaysWithDates: { dayIndex: number; date: Date }[] = [];
      for (let d = 0; d < 7; d++) {
        let dDate = new Date(weekStartDate);
        dDate.setDate(dDate.getDate() + d);
        const dayIndex = dDate.getDay();
        if (weekDays.includes(dayIndex)) {
          weekDaysWithDates.push({ dayIndex, date: dDate });
        }
      }
      
      weekDaysWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (weekDaysWithDates.length === 0) {
        weekOffset++;
        // prevent infinite loop if somehow no match can be scheduled
        if (weekOffset > 100) break;
        continue;
      }
      
      let matchesThisWeekCount = Math.min(matchesPerWeek, matches.length - matchIndex);
      let distributedSlots = weekDaysWithDates.map(wd => ({
        date: wd.date,
        count: 0
      }));
      
      let mAssigned = 0;
      let slotIdx = 0;
      while (mAssigned < matchesThisWeekCount && distributedSlots.length > 0) {
        distributedSlots[slotIdx % distributedSlots.length].count++;
        mAssigned++;
        slotIdx++;
      }
      
      for (let ds of distributedSlots) {
        if (ds.count === 0) continue;
        
        const [startH, startM] = startHour.split(":").map(Number);
        let dayCurrentTime = new Date(ds.date);
        dayCurrentTime.setHours(startH || 14, startM || 0, 0, 0);
        
        for (let c = 0; c < ds.count; c++) {
          if (matchIndex >= matches.length) break;
          
          const m = matches[matchIndex];
          
          const shStr = String(dayCurrentTime.getHours()).padStart(2, '0') + ":" + String(dayCurrentTime.getMinutes()).padStart(2, '0');
          
          let endTime = new Date(dayCurrentTime);
          endTime.setMinutes(endTime.getMinutes() + slotDurationMinutes);
          const ehStr = String(endTime.getHours()).padStart(2, '0') + ":" + String(endTime.getMinutes()).padStart(2, '0');
          
          const dateStr = dayCurrentTime.toISOString().split('T')[0];
          
          // Assign referees for this match honoring the strict 2-match gap rule (where they haven't refereed either team recently)
          const getRefereeGap = (refId: string, teamName: string, currentIndex: number, generatedSoFar: any[]): number => {
            let lastIdx = -1;
            for (let i = currentIndex - 1; i >= 0; i--) {
              const prevMatchObj = generatedSoFar[i];
              const isRefInMatch = prevMatchObj.centralId === refId ||
                                   prevMatchObj.assistant1Id === refId ||
                                   prevMatchObj.assistant2Id === refId ||
                                   prevMatchObj.fourthId === refId;
              const hasTeam = prevMatchObj.teamA === teamName || prevMatchObj.teamB === teamName;
              if (isRefInMatch && hasTeam) {
                lastIdx = i;
                break;
              }
            }
            if (lastIdx === -1) return 999;
            return currentIndex - lastIdx - 1;
          };

          const getRefereeAssignmentCount = (refId: string, generatedSoFar: any[]): number => {
            let count = 0;
            for (const prevMatchObj of generatedSoFar) {
              if (prevMatchObj.centralId === refId) count++;
              if (prevMatchObj.assistant1Id === refId && prevMatchObj.assistant1Id !== 'none') count++;
              if (prevMatchObj.assistant2Id === refId && prevMatchObj.assistant2Id !== 'none') count++;
              if (prevMatchObj.fourthId === refId && prevMatchObj.fourthId !== 'none') count++;
            }
            return count;
          };

          const selectRoles = () => {
            const roles = ['central', 'assistant1', 'assistant2', 'fourth'];
            const assignments: Record<string, string> = {
              central: '',
              assistant1: 'none',
              assistant2: 'none',
              fourth: 'none'
            };

            const selectedIds = new Set<string>();

            // Pre-score each referee for this match
            const scoredRefs = eligibleReferees.map((ref) => {
              const gapA = getRefereeGap(ref.id, m.teamA, matchIndex, generated);
              const gapB = getRefereeGap(ref.id, m.teamB, matchIndex, generated);
              const minGap = Math.min(gapA, gapB);
              const isPerfect = minGap >= 2;
              const totalAssignments = getRefereeAssignmentCount(ref.id, generated);
              
              return {
                ref,
                minGap,
                isPerfect,
                totalAssignments
              };
            });

            for (const role of roles) {
              const candidates = scoredRefs.filter(c => !selectedIds.has(c.ref.id));
              if (candidates.length === 0) {
                if (role === 'central') {
                  assignments[role] = '';
                } else {
                  assignments[role] = 'none';
                }
                continue;
              }

              // Sort rules:
              // 1. isPerfect (true satisfies the minimum 2 matches gap rule)
              // 2. larger minGap
              // 3. fewer total assignments so far in planning (load balancing)
              candidates.sort((x, y) => {
                if (x.isPerfect !== y.isPerfect) {
                  return x.isPerfect ? -1 : 1;
                }
                if (x.minGap !== y.minGap) {
                  return y.minGap - x.minGap;
                }
                return x.totalAssignments - y.totalAssignments;
              });

              const best = candidates[0];
              assignments[role] = best.ref.id;
              selectedIds.add(best.ref.id);
            }

            return assignments;
          };

          const assignments = selectRoles();
          const centralId = assignments.central;
          const assistant1Id = assignments.assistant1;
          const assistant2Id = assignments.assistant2;
          const fourthId = assignments.fourth;
          
          generated.push({
            id: Math.random().toString(36).substr(2, 9),
            categoryId,
            centralId,
            assistant1Id,
            assistant2Id,
            fourthId,
            date: dateStr,
            teamA: m.teamA,
            teamB: m.teamB,
            matchNumber: `${cat.name}_M${matchIndex + 1}`,
            startTime: shStr,
            endTime: ehStr,
            terrain,
            assessor: ""
          });
          
          matchIndex++;
          dayCurrentTime = new Date(endTime);
          dayCurrentTime.setMinutes(dayCurrentTime.getMinutes() + 15); // petite pause
        }
      }
      weekOffset++;
    }
    
    try {
      const toastId = toast.loading("Génération du planning et enregistrement...");
      for (const d of generated) {
        await api('/api/designations', {
          method: 'POST',
          body: JSON.stringify(d)
        });
      }
      fetchData();
      toast.dismiss(toastId);
      toast.success(`${generated.length} matchs planifiés avec succès pour le championnat ${cat.name} !`);
    } catch (err: any) {
      toast.dismiss();
      toast.error("Erreur d'enregistrement: " + err.message);
    }
  };

  const deleteItem = async (collectionName: string, id: string) => {
    try {
      await api(`/api/${collectionName}/${id}`, { method: 'DELETE' });
      fetchData();
      toast.success('Supprimé');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteCategoryCalendar = async (categoryId: string) => {
    try {
      await api(`/api/designations/category/${categoryId}`, { method: 'DELETE' });
      fetchData();
      toast.success('Le calendrier de cette catégorie a été supprimé avec succès.');
      setCategoryToDeleteCalendar(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getFilteredDesignations = (list: Designation[], filter: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    
    // Helper to get start of today properly
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today': startDate = startOfToday; break;
      case 'week': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'quarter': startDate = startOfQuarter(now); break;
      case 'year': startDate = startOfYear(now); break;
      default: return list;
    }

    return list.filter(d => {
      if (!d.date) return false;
      const dDate = parseISO(d.date);
      if (filter === 'today') {
        return dDate.getTime() === startOfToday.getTime();
      }
      return isAfter(dDate, startDate!) || dDate.getTime() === startDate!.getTime();
    });
  };

  const filteredDesignations = getFilteredDesignations(designations, timeFilter);
  const historyDesignations = getFilteredDesignations(designations, historyFilter).filter(d => 
    historyCategoryFilter === 'all' || d.categoryId === historyCategoryFilter
  );

  const toggleSelectAll = () => {
    if (selectedDesignationIds.length === historyDesignations.length) {
      setSelectedDesignationIds([]);
    } else {
      setSelectedDesignationIds(historyDesignations.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedDesignationIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const exportSelected = () => {
    const selected = designations.filter(d => selectedDesignationIds.includes(d.id));
    if (selected.length === 0) {
      toast.error('Aucun match sélectionné');
      return;
    }
    generateBulkDesignationsExcel(selected, referees, categories);
  };

  if (!token && (currentPage === 'manager' || currentPage === 'doc')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <Toaster position="top-center" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader className="text-center space-y-2 pt-10">
              <motion.div 
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="mx-auto bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              >
                <Users className="w-10 h-10 text-primary" />
              </motion.div>
              <CardTitle className="text-3xl font-bold tracking-tight">Espace Arbitres</CardTitle>
              <CardDescription className="text-slate-500 text-base">{isRegister ? 'Créez votre compte pour commencer' : 'Bienvenue, veuillez vous identifier'}</CardDescription>
            </CardHeader>
            <CardContent className="pb-10">
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    required
                    value={authForm.email} 
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})} 
                    placeholder="nom@exemple.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input 
                    type="password" 
                    required
                    value={authForm.password} 
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})} 
                    placeholder="••••••••"
                    className="h-11 rounded-xl"
                  />
                </div>
                {isRegister && (
                  <div className="space-y-4 py-2">
                    <div className="flex items-start space-x-3">
                      <input 
                        id="security"
                        type="checkbox" 
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                        checked={securityAccepted}
                        onChange={(e) => setSecurityAccepted(e.target.checked)}
                      />
                      <Label htmlFor="security" className="text-sm leading-tight text-slate-600 cursor-pointer">
                        J'accepte la <button type="button" onClick={() => setShowSecurityClause(true)} className="text-primary hover:underline font-bold">clause de sécurité et de confidentialité</button>
                      </Label>
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full h-12 text-lg gap-2 rounded-xl shadow-lg ring-offset-background transition-all active:scale-[0.98]">
                  {isRegister ? <><UserPlus className="w-5 h-5" /> S'inscrire</> : <><LogIn className="w-5 h-5" /> Connexion</>}
                </Button>
              </form>
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm text-primary hover:underline font-bold"
                >
                  {isRegister ? "Déjà un compte ? Se connecter" : "Première visite ? Créer un compte"}
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setCurrentPage('home')} className="w-full text-sm text-slate-500 rounded-xl">
                  Retour au site public
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={showSecurityClause} onOpenChange={setShowSecurityClause}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" /> Clause de Sécurité et Confidentialité
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 text-slate-600 leading-relaxed py-4 text-sm sm:text-base">
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3">1. Protection des Données</h3>
                <p>
                  Toutes les données saisies dans Referee Manager sont cryptées et stockées de manière sécurisée. Nous utilisons des protocoles de sécurité avancés pour empêcher tout accès non autorisé à vos informations personnelles et professionnelles.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3">2. Confidentialité des Désignations</h3>
                <p>
                  Les informations relatives aux matchs, aux arbitres désignés et aux frais d'arbitrage sont strictement confidentielles. Elles ne sont accessibles qu'aux utilisateurs dûment autorisés par l'administration centrale.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3">3. Usage Responsable</h3>
                <p>
                  En créant un compte, vous vous engagez à ne pas partager vos identifiants de connexion et à utiliser la plateforme exclusivement dans le cadre de vos fonctions officielles. Toute tentative d'intrusion ou de manipulation des données sera poursuivie.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3">4. Audit et Traçabilité</h3>
                <p>
                  Pour garantir l'intégrité du système, toutes les actions critiques (création, modification, suppression) sont enregistrées et peuvent faire l'objet d'un audit par les administrateurs système.
                </p>
              </section>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3 mt-6">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs italic">
                  En cochant la case d'acceptation, vous reconnaissez avoir pris connaissance de ces dispositions et acceptez de vous y conformer sans réserve.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSecurityClause(false)} className="rounded-xl w-full sm:w-auto">Compris</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      <Toaster position="top-center" />
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="group flex items-center gap-3 cursor-pointer" 
              onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}
            >
              <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                REF<span className="text-primary italic">MGR</span>
              </h1>
            </motion.div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {[
                { id: 'home', label: 'Accueil' },
                { id: 'about', label: 'À Propos' },
                ...(token ? [{ id: 'doc', label: 'Aide' }] : [])
              ].map(item => (
                <Button 
                  key={item.id}
                  variant={currentPage === item.id ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setCurrentPage(item.id as any)}
                  className={`rounded-full px-5 font-semibold transition-all ${currentPage === item.id ? 'text-primary' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {item.label}
                </Button>
              ))}
              {token && (
                <Button 
                  variant={currentPage === 'manager' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setCurrentPage('manager')}
                  className={`rounded-full px-5 font-bold ${currentPage === 'manager' ? 'bg-primary text-white hover:bg-primary/90' : 'text-primary hover:bg-primary/5'}`}
                >
                  Manager
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Nav Actions */}
            <div className="hidden sm:flex items-center gap-3">
              {token ? (
                <div className="flex items-center gap-3 pr-3 border-r">
                   <div className="text-right hidden xl:block">
                     <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{user?.email}</p>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                       {user?.role === 'admin' ? 'Administrateur' : user?.role === 'manager' ? 'Gestionnaire' : 'Auditeur'}
                     </p>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={handleLogout} 
                     className="w-10 h-10 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                     title="Déconnexion"
                   >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => { setCurrentPage('manager'); setIsRegister(false); }} 
                  className="rounded-full px-6 shadow-lg shadow-primary/20 font-bold"
                >
                  Se connecter
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-full w-12 h-12"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-white border-b shadow-2xl lg:hidden overflow-hidden"
            >
              <nav className="p-6 flex flex-col gap-2">
                {[
                  { id: 'home', label: 'Accueil', icon: Calendar },
                  { id: 'about', label: 'À Propos', icon: Info },
                  ...(token ? [{ id: 'doc', label: 'Aide & Documentation', icon: BookOpen }] : [])
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id as any); setIsMenuOpen(false); }}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl w-full text-left font-bold transition-all ${currentPage === item.id ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
                {token ? (
                  <>
                    <button
                      onClick={() => { setCurrentPage('manager'); setIsMenuOpen(false); }}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl w-full text-left font-bold transition-all ${currentPage === 'manager' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-primary'}`}
                    >
                      <Users className="w-5 h-5" />
                      Espace Manager
                    </button>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between px-4">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold">
                          {user?.email?.[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700 truncate">{user?.email}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive">
                        <LogOut className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    className="mt-4 rounded-2xl h-14 text-lg font-bold"
                    onClick={() => { setCurrentPage('manager'); setIsMenuOpen(false); setIsRegister(false); }}
                  >
                    Se connecter
                  </Button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && <HomePage token={token} setCurrentPage={setCurrentPage} setIsRegister={setIsRegister} />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'doc' && <DocumentationPage />}
          
          {currentPage === 'manager' && (
            <motion.div
              key="manager"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs defaultValue="referees" className="space-y-6">
              <ScrollArea className="w-full whitespace-nowrap rounded-2xl border bg-white p-1">
                <TabsList className="w-full justify-start bg-transparent">
                  <TabsTrigger value="referees" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Users className="w-4 h-4" /> Arbitres</TabsTrigger>
                  <TabsTrigger value="categories" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Layers className="w-4 h-4" /> Catégories</TabsTrigger>
                  <TabsTrigger value="designations" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Calendar className="w-4 h-4" /> Désignations</TabsTrigger>
                  <TabsTrigger value="matches" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Trophy className="w-4 h-4" /> Manager/Match</TabsTrigger>
                  <TabsTrigger value="reports" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><FileText className="w-4 h-4" /> Rapports</TabsTrigger>
                  {user?.role === 'admin' && (
                    <TabsTrigger value="roles" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Users className="w-4 h-4" /> Utilisateurs</TabsTrigger>
                  )}
                </TabsList>
              </ScrollArea>

            <TabsContent value="referees" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Card className="lg:col-span-1 border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Ajouter un Arbitre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addReferee} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="referee-name">Nom complet</Label>
                        <Input 
                          id="referee-name" 
                          value={newReferee.name} 
                          onChange={(e) => setNewReferee({...newReferee, name: e.target.value})} 
                          placeholder="Ex: Ahmed Ali"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="referee-phone">Téléphone</Label>
                        <Input 
                          id="referee-phone" 
                          value={newReferee.phone} 
                          onChange={(e) => setNewReferee({...newReferee, phone: e.target.value})} 
                          placeholder="Ex: 77865024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="referee-grade">Grades</Label>
                        <Input 
                          id="referee-grade" 
                          value={newReferee.grade || ''} 
                          onChange={(e) => setNewReferee({...newReferee, grade: e.target.value})} 
                          placeholder="Ex: Stagiaire 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Catégories Autorisées (allowed)</Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {categories.map((cat) => {
                            const isChecked = newReferee.allowedCategories?.includes(cat.id);
                            return (
                              <label key={cat.id} className="flex items-center gap-2 bg-slate-50 border hover:bg-slate-100 rounded-lg p-2 cursor-pointer select-none transition-all">
                                <input 
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                                  checked={isChecked || false}
                                  onChange={(e) => {
                                    const updated = e.target.checked 
                                      ? [...(newReferee.allowedCategories || []), cat.id]
                                      : (newReferee.allowedCategories || []).filter(id => id !== cat.id);
                                    setNewReferee({...newReferee, allowedCategories: updated});
                                  }}
                                />
                                <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                              </label>
                            );
                          })}
                          {categories.length === 0 && (
                            <p className="text-xs text-slate-500 italic">Aucune catégorie créée</p>
                          )}
                        </div>
                      </div>
                      <Button type="submit" className="w-full gap-2">
                        <PlusCircle className="w-4 h-4" /> Ajouter
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className={(user?.role === 'admin' || user?.role === 'manager') ? "lg:col-span-2 border-none shadow-md" : "lg:col-span-3 border-none shadow-md"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Liste des Arbitres</CardTitle>
                  <div className="w-64">
                    <Input 
                      placeholder="Rechercher un arbitre..." 
                      value={refereeSearch}
                      onChange={(e) => setRefereeSearch(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Catégories Autorisées</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referees
                          .filter(r => r.name.toLowerCase().includes(refereeSearch.toLowerCase()))
                          .map((ref) => (
                          <TableRow key={ref.id}>
                            <TableCell className="font-medium">{ref.name}</TableCell>
                            <TableCell>{ref.grade || '-'}</TableCell>
                            <TableCell>{ref.phone || '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {ref.allowedCategories && ref.allowedCategories.length > 0 ? (
                                  ref.allowedCategories.map((catId) => {
                                    const cat = categories.find(c => c.id === catId);
                                    return cat ? (
                                      <Badge key={catId} variant="secondary" className="text-[10px] px-1.5 py-0.5 font-bold bg-primary/10 text-primary border-none">
                                        {cat.name}
                                      </Badge>
                                    ) : null;
                                  })
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic font-semibold">Aucune</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => setEditingReferee(ref)}>
                                    <Pencil className="w-4 h-4 text-primary" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => deleteItem('referees', ref.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Card className="lg:col-span-1 border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Créer une Catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom de la catégorie</Label>
                        <Input 
                          value={newCategory.name} 
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} 
                          placeholder="Ex: 1er Division"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Central (FDJ)</Label>
                          <Input 
                            type="number" 
                            value={newCategory.centralFee} 
                            onChange={(e) => setNewCategory({...newCategory, centralFee: Number(e.target.value)})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Assistant (FDJ)</Label>
                          <Input 
                            type="number" 
                            value={newCategory.assistantFee} 
                            onChange={(e) => setNewCategory({...newCategory, assistantFee: Number(e.target.value)})} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>4ème Arbitre (FDJ)</Label>
                        <Input 
                          type="number" 
                          value={newCategory.fourthFee} 
                          onChange={(e) => setNewCategory({...newCategory, fourthFee: Number(e.target.value)})} 
                        />
                      </div>
                      
                      <div className="space-y-2 border-t pt-4">
                        <Label className="text-sm font-semibold">Saisie des Équipes</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={newTeamsInput} 
                            onChange={(e) => setNewTeamsInput(e.target.value)} 
                            placeholder="Nom de l'équipe (ex: PSG)"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newTeamsInput.trim()) {
                                  if (!newCategory.teams?.includes(newTeamsInput.trim())) {
                                    setNewCategory({
                                      ...newCategory,
                                      teams: [...(newCategory.teams || []), newTeamsInput.trim()]
                                    });
                                  }
                                  setNewTeamsInput('');
                                }
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => {
                              if (newTeamsInput.trim()) {
                                if (!newCategory.teams?.includes(newTeamsInput.trim())) {
                                  setNewCategory({
                                    ...newCategory,
                                    teams: [...(newCategory.teams || []), newTeamsInput.trim()]
                                  });
                                }
                                setNewTeamsInput('');
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                        
                        {newCategory.teams && newCategory.teams.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-lg max-h-32 overflow-y-auto">
                            {newCategory.teams.map((team, idx) => (
                              <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-[11px] font-medium bg-slate-200 text-slate-800 pr-1 hover:bg-slate-300">
                                {team}
                                <span 
                                  onClick={() => {
                                    setNewCategory({
                                      ...newCategory,
                                      teams: newCategory.teams.filter(t => t !== team)
                                    });
                                  }}
                                  className="hover:bg-slate-400 p-0.5 rounded cursor-pointer leading-none text-[8px]"
                                >
                                  ✕
                                </span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button type="submit" className="w-full gap-2">
                        <PlusCircle className="w-4 h-4" /> Créer
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className={(user?.role === 'admin' || user?.role === 'manager') ? "lg:col-span-2 border-none shadow-md" : "lg:col-span-3 border-none shadow-md"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Catégories & Tarifs</CardTitle>
                  <div className="w-64">
                    <Input 
                      placeholder="Rechercher une catégorie..." 
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Central</TableHead>
                          <TableHead>Assistant</TableHead>
                          <TableHead>4ème</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories
                          .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                          .map((cat) => (
                          <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>{cat.centralFee} FDJ</TableCell>
                            <TableCell>{cat.assistantFee} FDJ</TableCell>
                            <TableCell>{cat.fourthFee} FDJ</TableCell>
                            <TableCell className="text-right space-x-2">
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => setEditingCategory(cat)}>
                                    <Pencil className="w-4 h-4 text-primary" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => deleteItem('categories', cat.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste d'affichage des équipes par catégorie */}
            <Card className="border-none shadow-md mt-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-slate-50/50 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Liste des Équipes par Catégorie</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Visualisation des clubs engagés pour chaque niveau de compétition</CardDescription>
                </div>
                <Badge variant="outline" className="font-bold bg-white text-slate-700 self-start sm:self-center border-slate-200 shadow-sm">
                  Total : {categories.reduce((acc, cat) => acc + (cat.teams?.length || 0), 0)} équipes
                </Badge>
              </CardHeader>
              <CardContent className="pt-6">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 italic">
                    Aucune catégorie disponible. Créez-en une pour commencer à saisir des équipes.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat) => {
                      const teamCount = cat.teams?.length || 0;
                      return (
                        <div key={cat.id} className="flex flex-col rounded-xl border border-slate-200/80 bg-white text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <h3 className="font-bold text-slate-700 text-xs flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="truncate max-w-[120px]">{cat.name}</span>
                            </h3>
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold border-none px-2 py-0.5 shrink-0">
                              {teamCount} {teamCount > 1 ? 'équipes' : 'équipe'}
                            </Badge>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            {!cat.teams || cat.teams.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic text-center py-6">Aucune équipe renseignée</p>
                            ) : (
                              <ul className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                                {cat.teams.map((team, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-xs py-1.5 px-2.5 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-slate-700 font-semibold shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    <span className="truncate">{team}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designations" className="space-y-6">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Card className="border-none shadow-md overflow-hidden bg-white">
                <CardHeader className="border-b bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">Génération Automatique de Matches d'un Championnat</CardTitle>
                      <CardDescription className="text-xs text-slate-500">Générez un calendrier complet (Aller simple ou Aller-Retour) pour les équipes engagées</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleGeneratePlanning} className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Choisir le Championnat (Catégorie)</Label>
                        <Select 
                          value={planningConfig.categoryId} 
                          onValueChange={(v) => setPlanningConfig({...planningConfig, categoryId: v})}
                        >
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.teams?.length || 0} équipes)</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Formule du Championnat</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPlanningConfig({...planningConfig, type: 'simple'})}
                            className={`py-1.5 px-3 border rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${planningConfig.type === 'simple' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            <span>Simple Aller</span>
                            <span className="text-[9px] text-slate-400 font-normal">Rencontre 1 fois</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlanningConfig({...planningConfig, type: 'aller-retour'})}
                            className={`py-1.5 px-3 border rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${planningConfig.type === 'aller-retour' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            <span>Aller-Retour</span>
                            <span className="text-[9px] text-slate-400 font-normal">Domicile et Extérieur</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Nom du Terrain</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input 
                            value={planningConfig.terrain} 
                            onChange={(e) => setPlanningConfig({...planningConfig, terrain: e.target.value})} 
                            placeholder="ex: Stade Municipal" 
                            className="pl-9 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Matchs par Semaine</Label>
                        <Input 
                          type="number" 
                          min={1} 
                          value={planningConfig.matchesPerWeek} 
                          onChange={(e) => setPlanningConfig({...planningConfig, matchesPerWeek: Number(e.target.value)})} 
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Durée du Match (Mi-temps)</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            min={10} 
                            max={60} 
                            value={planningConfig.halfDuration} 
                            onChange={(e) => setPlanningConfig({...planningConfig, halfDuration: Number(e.target.value)})} 
                            className="rounded-xl"
                          />
                          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">min/mi-temps</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Date de début du calendrier</Label>
                        <Input 
                          type="date" 
                          value={planningConfig.startDate} 
                          onChange={(e) => setPlanningConfig({...planningConfig, startDate: e.target.value})} 
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Heure de début des Matchs</Label>
                        <Input 
                          type="time" 
                          value={planningConfig.startHour} 
                          onChange={(e) => setPlanningConfig({...planningConfig, startHour: e.target.value})} 
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        Jours de la semaine disponibles
                      </Label>
                      <p className="text-xs text-slate-400">Cochez les jours prévisibles pour l'organisation de matches dans la semaine :</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          { id: 1, name: 'Lundi' },
                          { id: 2, name: 'Mardi' },
                          { id: 3, name: 'Mercredi' },
                          { id: 4, name: 'Jeudi' },
                          { id: 5, name: 'Vendredi' },
                          { id: 6, name: 'Samedi' },
                          { id: 0, name: 'Dimanche' }
                        ].map(day => {
                          const active = planningConfig.weekDays.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => {
                                const current = [...planningConfig.weekDays];
                                if (current.includes(day.id)) {
                                  setPlanningConfig({...planningConfig, weekDays: current.filter(id => id !== day.id)});
                                } else {
                                  setPlanningConfig({...planningConfig, weekDays: [...current, day.id]});
                                }
                              }}
                              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${active ? 'bg-primary text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                            >
                              {active && <span className="text-[10px]">✓</span>}
                              {day.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 py-2">
                        <Trophy className="w-4 h-4" />
                        Créer et Générer le Planning
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6 border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CardTitle>Historique des Désignations</CardTitle>
                  <Badge variant="secondary" className="hidden sm:flex">
                    {historyDesignations.length} Matchs
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    type="button"
                    onClick={() => setShowCalendarView(true)} 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 h-8 text-xs font-bold rounded-lg px-2.5"
                  >
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                    Voir le Calendrier
                  </Button>

                  <Button 
                    type="button"
                    onClick={() => setShowClubShareModal(true)} 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5 border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 h-8 text-xs font-bold rounded-lg px-2.5"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    Envoyer aux Clubs
                  </Button>

                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Trophy className="w-3 h-3 ml-2 text-slate-500" />
                    <Select value={historyCategoryFilter} onValueChange={(v: string) => setHistoryCategoryFilter(v)}>
                      <SelectTrigger className="w-[120px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-xs font-semibold">
                        <SelectValue placeholder="Catégorie..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Filter className="w-3 h-3 ml-2 text-slate-500" />
                    <Select value={historyFilter} onValueChange={(v: any) => setHistoryFilter(v)}>
                      <SelectTrigger className="w-[110px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-xs">
                        <SelectValue placeholder="Trier par..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les matchs</SelectItem>
                        <SelectItem value="today">Aujourd'hui</SelectItem>
                        <SelectItem value="week">Cette Semaine</SelectItem>
                        <SelectItem value="month">Ce Mois</SelectItem>
                        <SelectItem value="quarter">Ce Trimestre</SelectItem>
                        <SelectItem value="year">Cette Année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedDesignationIds.length > 0 && (
                    <Button onClick={exportSelected} size="sm" className="gap-2 bg-green-600 hover:bg-green-700 h-8 text-xs">
                      <Download className="w-3 h-3" />
                      Exporter ({selectedDesignationIds.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {categories
                  .filter(c => historyCategoryFilter === 'all' || c.id === historyCategoryFilter)
                  .map((cat) => {
                    const catMatches = historyDesignations
                      .filter(d => d.categoryId === cat.id)
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    const isExpanded = expandedCategories.includes(cat.id);
                    const toggleExpand = () => {
                      if (isExpanded) {
                        setExpandedCategories(expandedCategories.filter(id => id !== cat.id));
                      } else {
                        setExpandedCategories([...expandedCategories, cat.id]);
                      }
                    };

                    return (
                      <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-indigo-200">
                        {/* Header bar - click to explore / collapse */}
                        <div 
                          className={`py-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between border-b gap-3 cursor-pointer select-none transition-all ${isExpanded ? 'bg-indigo-50/20' : 'bg-slate-50/50 hover:bg-slate-50'}`}
                          onClick={toggleExpand}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 rounded-md hover:bg-slate-200/50 transition-colors">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-indigo-600 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500 transition-transform duration-200" />
                              )}
                            </div>
                            <span className="p-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 font-sans">
                              🏆 {cat.name}
                            </span>
                            <Badge variant={catMatches.length > 0 ? "secondary" : "outline"} className={`text-[10px] font-semibold ${catMatches.length > 0 ? 'bg-indigo-100/50 text-indigo-700' : 'text-slate-400 border-slate-100'}`}>
                              {catMatches.length} {catMatches.length > 1 ? 'matchs' : 'match'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">
                              Frais : AC {cat.centralFee} | AR {cat.assistantFee} | 4e {cat.fourthFee} DJF
                            </span>

                            {catMatches.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                type="button"
                                className="h-6 text-[10px] text-indigo-600 font-bold hover:bg-slate-200/50 px-2 rounded-lg"
                                onClick={() => {
                                  const catMatchIds = catMatches.map(m => m.id);
                                  const allSelected = catMatchIds.every(id => selectedDesignationIds.includes(id));
                                  if (allSelected) {
                                    setSelectedDesignationIds(prev => prev.filter(id => !catMatchIds.includes(id)));
                                  } else {
                                    setSelectedDesignationIds(prev => Array.from(new Set([...prev, ...catMatchIds])));
                                  }
                                }}
                              >
                                {catMatches.every(m => selectedDesignationIds.includes(m.id)) ? "Désélectionner tout" : "Sélectionner tout"}
                              </Button>
                            )}

                            {(user?.role === 'admin' || user?.role === 'manager') && catMatches.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                type="button"
                                className="h-6 text-[10px] text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 px-2.5 rounded-lg flex items-center gap-1 border border-rose-100"
                                onClick={() => setCategoryToDeleteCalendar({ id: cat.id, name: cat.name })}
                                title="Supprimer tout le calendrier de cette catégorie"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                Supprimer le calendrier
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Collapsible details / explorer portion */}
                        {isExpanded && (
                          <div className="overflow-hidden bg-white">
                            {catMatches.length === 0 ? (
                              <div className="p-8 text-center bg-slate-50/20 text-slate-400 text-xs">
                                <Calendar className="w-8 h-8 mx-auto text-slate-300 opacity-60 mb-2" />
                                <p className="font-semibold text-slate-500">Aucun match disponible pour cette catégorie.</p>
                                <p className="text-[11px] text-slate-400 mt-1">Vous pouvez générer un calendrier complet de matches en utilisant le module de génération automatique ci-dessus.</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-slate-50/20">
                              <TableRow>
                                <TableHead className="w-12 px-4"></TableHead>
                                <TableHead className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">N° Match</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Date & Heure</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Affiche</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Terrain</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Assesseur</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Commissaire du Maire</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Arbitres désignés</TableHead>
                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                  <TableHead className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 font-sans">Actions</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {catMatches.map((d) => {
                                const central = referees.find(r => r.id === d.centralId);
                                const ass1 = referees.find(r => r.id === d.assistant1Id);
                                const ass2 = referees.find(r => r.id === d.assistant2Id);
                                const fourth = referees.find(r => r.id === d.fourthId);

                                return (
                                  <TableRow key={d.id} className={`${selectedDesignationIds.includes(d.id) ? "bg-indigo-50/20" : ""} hover:bg-slate-50/50 transition-colors`}>
                                    <TableCell className="px-4">
                                      <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedDesignationIds.includes(d.id)}
                                        onChange={() => toggleSelect(d.id)}
                                      />
                                    </TableCell>
                                    <TableCell className="text-xs sm:text-sm font-semibold text-slate-700">
                                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-[11px] font-mono border">
                                        {d.matchNumber || '-'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-xs sm:text-sm whitespace-nowrap text-slate-600 font-medium">
                                      <div className="flex flex-col">
                                        <span>{d.date}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{d.startTime} - {d.endTime}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs sm:text-sm font-bold text-slate-800">
                                      <div className="flex items-center gap-1.5">
                                        <span className="truncate max-w-[120px]">{d.teamA}</span>
                                        <span className="text-[10px] text-slate-400 font-normal">vs</span>
                                        <span className="truncate max-w-[120px]">{d.teamB}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 font-medium truncate max-w-[120px]">
                                      {d.terrain || 'Non défini'}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium truncate max-w-[100px]">
                                      {d.assessor || '-'}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                                      {d.mayorCommissioner || '-'}
                                    </TableCell>
                                    <TableCell className="text-[11px] text-slate-500 max-w-[280px]">
                                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 leading-tight font-medium">
                                        <div className="truncate"><span className="text-slate-400 font-semibold font-mono">AC:</span> {central?.name || <span className="text-amber-500 italic">Non désigné</span>}</div>
                                        {d.assistant1Id && d.assistant1Id !== 'none' && (
                                          <div className="truncate"><span className="text-slate-400 font-semibold font-mono">AR1:</span> {ass1?.name || <span className="text-amber-500 italic">Non désigné</span>}</div>
                                        )}
                                        {d.assistant2Id && d.assistant2Id !== 'none' && (
                                          <div className="truncate"><span className="text-slate-400 font-semibold font-mono">AR2:</span> {ass2?.name || <span className="text-amber-500 italic">Non désigné</span>}</div>
                                        )}
                                        {d.fourthId && d.fourthId !== 'none' && (
                                          <div className="truncate"><span className="text-slate-400 font-semibold font-mono">4e:</span> {fourth?.name || <span className="text-amber-500 italic">Non désigné</span>}</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap px-6">
                                      {(user?.role === 'admin' || user?.role === 'manager') && (
                                        <div className="flex items-center justify-end gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-400" 
                                            onClick={() => setEditingDesignation(d)}
                                            title="Modifier le match/les arbitres"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 rounded-lg" 
                                            onClick={() => deleteItem('designations', d.id)}
                                            title="Supprimer ce match"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                          </Button>
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

                {historyDesignations.length === 0 && (
                  <div className="border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center rounded-2xl">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <CalendarDays className="w-12 h-12 stroke-1.5 opacity-40 text-slate-400" />
                      <h4 className="font-semibold text-slate-700 text-base">Aucun match trouvé pour cette période</h4>
                      <p className="text-xs text-slate-400 max-w-sm">Ajustez vos filtres temporels ou de catégorie pour visualiser vos désignations de matches.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Saisie Form side */}
              <Card className="lg:col-span-1 border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-indigo-600" />
                    Saisie Feuille de Match
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Saisissez ou modifiez les résultats, cartons et observations d'un match officiel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveMatchSheet} className="space-y-4">
                    {/* Assistant Dropdown to select scheduled match */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700">Sélectionner un Match Planifié (optionnel)</Label>
                      <Select 
                        value={selectedMatchForSheet} 
                        onValueChange={handleSelectMatchForSaisie}
                      >
                        <SelectTrigger className="rounded-xl text-xs bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Choisir un match planifié..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">-- Saisie Manuelle Libre --</SelectItem>
                          {designations.map(d => {
                            const cat = categories.find(c => c.id === d.categoryId);
                            return (
                              <SelectItem key={d.id} value={d.id}>
                                {cat?.name} (N°{d.matchNumber || '-'}) : {d.teamA} vs {d.teamB} ({d.date})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-400">La sélection charge automatiquement la catégorie, les équipes et le numéro de match.</p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Catégorie</Label>
                        <Select 
                          value={sheetForm.categoryId} 
                          onValueChange={(v) => setSheetForm({...sheetForm, categoryId: v})}
                          disabled={selectedMatchForSheet !== "" && selectedMatchForSheet !== "custom"}
                        >
                          <SelectTrigger className="rounded-xl text-xs">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">N° Match</Label>
                        <Input 
                          value={sheetForm.matchNumber} 
                          onChange={(e) => setSheetForm({...sheetForm, matchNumber: e.target.value})} 
                          placeholder="Ex: M1"
                          disabled={selectedMatchForSheet !== "" && selectedMatchForSheet !== "custom"}
                          className="rounded-xl h-9 text-xs"
                        />
                      </div>

                      {/* Score row preview / editable */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-600 block text-center uppercase tracking-wider">Scores de la rencontre</span>
                        <div className="grid grid-cols-2 gap-3 items-center">
                          <div className="space-y-1 text-center">
                            <Label className="text-[10px] font-semibold text-slate-500 truncate block">
                              {selectedMatchForSheet && selectedMatchForSheet !== "custom" 
                                ? (designations.find(d => d.id === selectedMatchForSheet)?.teamA || "Équipe A") 
                                : "Équipe A"}
                            </Label>
                            <Input 
                              type="number" 
                              min={0}
                              value={sheetForm.scoreA} 
                              onChange={(e) => setSheetForm({...sheetForm, scoreA: Number(e.target.value) || 0})}
                              className="text-center font-mono font-bold text-base h-9 rounded-lg"
                            />
                          </div>
                          <div className="space-y-1 text-center">
                            <Label className="text-[10px] font-semibold text-slate-500 truncate block">
                              {selectedMatchForSheet && selectedMatchForSheet !== "custom" 
                                ? (designations.find(d => d.id === selectedMatchForSheet)?.teamB || "Équipe B") 
                                : "Équipe B"}
                            </Label>
                            <Input 
                              type="number" 
                              min={0}
                              value={sheetForm.scoreB} 
                              onChange={(e) => setSheetForm({...sheetForm, scoreB: Number(e.target.value) || 0})}
                              className="text-center font-mono font-bold text-base h-9 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Buteurs (Buteurs et minutes)</Label>
                        <textarea 
                          rows={2}
                          value={sheetForm.scorers} 
                          onChange={(e) => setSheetForm({...sheetForm, scorers: e.target.value})} 
                          placeholder="Ex: Jean Dupont (12'), Marc Henry (44')" 
                          className="w-full text-xs p-2.5 border rounded-xl bg-white border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary whitespace-pre-wrap"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Avertissements / Cartons</Label>
                        <textarea 
                          rows={2}
                          value={sheetForm.cards} 
                          onChange={(e) => setSheetForm({...sheetForm, cards: e.target.value})} 
                          placeholder="Ex: 🟨 Carton jaune pour 9 d'Équipe A" 
                          className="w-full text-xs p-2.5 border rounded-xl bg-white border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary whitespace-pre-wrap"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Observations / Rapports de match</Label>
                        <textarea 
                          rows={2}
                          value={sheetForm.observations} 
                          onChange={(e) => setSheetForm({...sheetForm, observations: e.target.value})} 
                          placeholder="Remarques additionnelles sur le match, réclamations ou fairplay." 
                          className="w-full text-xs p-2.5 border rounded-xl bg-white border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary whitespace-pre-wrap"
                        />
                      </div>

                      {/* Scanned sheet file upload block */}
                      <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-bold text-slate-700">Téléverser la feuille de match scannée</Label>
                        <div 
                          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all relative"
                          onClick={() => document.getElementById('match-sheet-file-picker')?.click()}
                        >
                          <input 
                            type="file" 
                            id="match-sheet-file-picker" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 8 * 1024 * 1024) {
                                  toast.error("La taille du fichier ne doit pas dépasser 8 Mo.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setSheetForm({
                                    ...sheetForm,
                                    scannedSheet: reader.result as string
                                  });
                                  toast.success(`Fichier "${file.name}" chargé avec succès !`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {sheetForm.scannedSheet ? (
                            <div className="space-y-2 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                              {sheetForm.scannedSheet.startsWith('data:image/') ? (
                                <img src={sheetForm.scannedSheet} alt="Feuille scannée" className="max-h-24 max-w-full rounded border border-slate-200 shadow-sm object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="p-3 bg-indigo-50/50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-indigo-100">
                                  <FileText className="w-5 h-5 text-indigo-500" /> Document PDF Chargé
                                </div>
                              )}
                              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">✓ Fichier prêt à l'enregistrement</p>
                              <div className="flex gap-2 justify-center pt-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  type="button" 
                                  className="h-6 text-[10px] px-2 text-rose-500 border-rose-100 hover:bg-rose-50"
                                  onClick={() => setSheetForm({ ...sheetForm, scannedSheet: "" })}
                                >
                                  Supprimer
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  type="button" 
                                  className="h-6 text-[10px] px-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                                  onClick={() => {
                                    const win = window.open();
                                    if (win) {
                                      win.document.write(`<iframe src="${sheetForm.scannedSheet}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                    }
                                  }}
                                >
                                  Voir
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 flex flex-col items-center justify-center">
                              <Upload className="w-7 h-7 text-indigo-500 mb-1.5 opacity-80" />
                              <span className="text-xs font-semibold text-slate-700">Choisir ou glisser un scan</span>
                              <p className="text-[10px] text-slate-400 mt-0.5">Formats image ou PDF (Max. 8 Mo)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'manager') ? (
                      <Button type="submit" className="w-full h-10 text-xs rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-sans">
                        Enregistrer la Feuille de Match
                      </Button>
                    ) : (
                      <p className="text-[11px] text-rose-500 font-semibold text-center italic">Vos droits de lecture seule ne vous permettent pas de saisir de résultats.</p>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Saved Match sheets lists */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-md overflow-hidden bg-white">
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/20">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">Feuilles de Match Enregistrées</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Visualisez les détails des matchs terminés et validés par les officiels.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-700 font-semibold">
                      {matchSheets.length} Saisis
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {matchSheets.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                        <Trophy className="w-12 h-12 stroke-1.5 opacity-20 text-slate-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-slate-700 text-sm">Aucune feuille d'après-match enregistrée</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-sans">
                          Sélectionnez ou créez un match libre sur le formulaire de gauche pour valider sa feuille de match.
                        </p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {matchSheets.map((sheet) => {
                          const catObj = categories.find(c => c.id === sheet.categoryId);
                          const matchingMatch = designations.find(d => d.categoryId === sheet.categoryId && d.matchNumber === sheet.matchNumber);
                          const tA = matchingMatch?.teamA || "Équipe A";
                          const tB = matchingMatch?.teamB || "Équipe B";
                          
                          return (
                            <div key={sheet.id} className="border border-slate-100 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-1.5">
                                  <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border-none font-sans">
                                    {catObj?.name || "Catégorie"}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                                  N° {sheet.matchNumber}
                                </span>
                              </div>

                              <div className="bg-slate-50 border p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">{tA}</span>
                                <span className="text-base font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-lg">
                                  {sheet.scoreA} - {sheet.scoreB}
                                </span>
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[90px] text-right">{tB}</span>
                              </div>

                              <div className="text-xs space-y-2 text-slate-600 border-t pt-2">
                                {sheet.scorers && (
                                  <div>
                                    <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider font-sans">⚽ Buteurs :</span>
                                    <p className="text-slate-500 pl-1 text-[11px] whitespace-pre-wrap">{sheet.scorers}</p>
                                  </div>
                                )}
                                {sheet.cards && (
                                  <div>
                                    <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider font-sans">🟨🟥 Sanctions :</span>
                                    <p className="text-slate-500 pl-1 text-[11px] whitespace-pre-wrap">{sheet.cards}</p>
                                  </div>
                                )}
                                {sheet.observations && (
                                  <div>
                                    <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider font-sans">📝 Observations & Rapports :</span>
                                    <p className="text-slate-400 pl-1 italic text-[11px] whitespace-pre-wrap">{sheet.observations}</p>
                                  </div>
                                )}
                                {sheet.scannedSheet && (
                                  <div className="pt-1.5">
                                    <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider font-sans mb-1">📄 Feuille de match scannée :</span>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 text-xs font-semibold text-indigo-700 border-indigo-100 bg-indigo-50 hover:bg-indigo-100/80 flex items-center gap-1.5 w-full justify-center transition-colors font-sans"
                                      onClick={() => {
                                        const win = window.open();
                                        if (win) {
                                          win.document.write(`<iframe src="${sheet.scannedSheet}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; shadow:0;" allowfullscreen></iframe>`);
                                        }
                                      }}
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Voir la feuille de match
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <div className="flex items-center justify-end gap-1 border-t pt-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 text-[10px] font-bold text-indigo-600 hover:bg-slate-100 shrink-0 font-sans"
                                    onClick={() => {
                                      const fallbackId = matchingMatch?.id || "custom";
                                      setSelectedMatchForSheet(fallbackId);
                                      setSheetForm({
                                        categoryId: sheet.categoryId,
                                        matchNumber: sheet.matchNumber,
                                        scoreA: sheet.scoreA,
                                        scoreB: sheet.scoreB,
                                        scorers: sheet.scorers,
                                        cards: sheet.cards,
                                        observations: sheet.observations,
                                        scannedSheet: sheet.scannedSheet || ""
                                      });
                                    }}
                                  >
                                    Modifier
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Générer un Rapport</CardTitle>
                    <CardDescription>Générez le tableau récapitulatif des frais (Net à Payer).</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Filter className="w-4 h-4 ml-2 text-slate-500" />
                    <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
                      <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none focus:ring-0">
                        <SelectValue placeholder="Période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Cette Semaine</SelectItem>
                        <SelectItem value="month">Ce Mois</SelectItem>
                        <SelectItem value="quarter">Ce Trimestre</SelectItem>
                        <SelectItem value="year">Cette Année</SelectItem>
                        <SelectItem value="all">Tout l'historique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => generateRefereeExcelReport(filteredDesignations, referees, categories)} variant="outline" className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                    <FileText className="w-4 h-4 text-green-600" />
                    Rapport Audit Mensuel
                  </Button>
                  <Button onClick={() => generateNetAPayerExcelReport(filteredDesignations, referees, categories)} variant="outline" className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                    <FileText className="w-4 h-4 text-green-600" />
                    Rapport Net à Payer
                  </Button>
                  <Button onClick={() => exportDesignationsToExcel(filteredDesignations, referees, categories)} variant="outline" className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                    <Download className="w-4 h-4" />
                    Désignations de la semaine
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  <Card className="bg-primary/5 border-primary/20 border-none">
                    <CardHeader className="pb-2">
                      <CardDescription>Total Matchs ({timeFilter})</CardDescription>
                      <CardTitle className="text-2xl">{filteredDesignations.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20 border-none">
                    <CardHeader className="pb-2">
                      <CardDescription>Arbitres Actifs</CardDescription>
                      <CardTitle className="text-2xl">{referees.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20 border-none">
                    <CardHeader className="pb-2">
                      <CardDescription>Total Général (FDJ)</CardDescription>
                      <CardTitle className="text-2xl">
                        {filteredDesignations.reduce((acc, d) => {
                          const cat = categories.find(c => c.id === d.categoryId);
                          return acc + (cat?.centralFee || 0) + (cat?.assistantFee || 0) * 2 + (cat?.fourthFee || 0);
                        }, 0).toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Détail par Catégorie ({timeFilter})</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => {
                      const catMatches = filteredDesignations.filter(d => d.categoryId === cat.id);
                      const totalCat = catMatches.reduce((acc, d) => {
                        return acc + (cat.centralFee || 0) + (cat.assistantFee || 0) * 2 + (cat.fourthFee || 0);
                      }, 0);
                      return (
                        <Card key={cat.id} className="border-slate-200 shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              {cat.name}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-600"
                                onClick={() => generateSingleCategoryExcelAudit(filteredDesignations, referees, cat)}
                                title="Rapport audit du détail par catégorie"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </CardTitle>
                            <CardDescription>{catMatches.length} matchs</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xl font-bold text-primary">{totalCat.toLocaleString()} FDJ</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Application Desktop</h3>
                      <p className="text-slate-400 max-w-md">
                        Téléchargez la version de bureau (Electron) pour une utilisation hors-ligne et un accès rapide depuis votre ordinateur.
                      </p>
                    </div>
                    <Button size="lg" variant="secondary" className="gap-2 shrink-0" onClick={() => window.open('#', '_blank')}>
                      <Download className="w-5 h-5" />
                      Télécharger l'App
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="roles" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>Autorisez les accès et gérez les droits des membres.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle actuel</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'pending' ? 'destructive' : 'default'} className="capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Select 
                            value={u.role} 
                            onValueChange={(v) => updateUserRole(u.id, v)}
                            disabled={u.email === 'mahdiyacoubali318@gmail.com'}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="audit">Audit/Comptable</SelectItem>
                              <SelectItem value="admin">Administrateur</SelectItem>
                            </SelectContent>
                          </Select>
                          {u.email !== 'mahdiyacoubali318@gmail.com' && u.email !== user?.email && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteUser(u.id || u.ID, u.email)}
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!editingReferee} onOpenChange={(open) => !open && setEditingReferee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'Arbitre</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateReferee} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input 
                  value={editingReferee?.name || ''} 
                  onChange={(e) => editingReferee && setEditingReferee({...editingReferee, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input 
                  value={editingReferee?.phone || ''} 
                  onChange={(e) => editingReferee && setEditingReferee({...editingReferee, phone: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Grades</Label>
                <Input 
                  value={editingReferee?.grade || ''} 
                  onChange={(e) => editingReferee && setEditingReferee({...editingReferee, grade: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Catégories Autorisées (allowed)</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map((cat) => {
                    const isChecked = editingReferee?.allowedCategories?.includes(cat.id);
                    return (
                      <label key={cat.id} className="flex items-center gap-2 bg-slate-50 border hover:bg-slate-100 rounded-lg p-2 cursor-pointer select-none transition-all">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                          checked={isChecked || false}
                          onChange={(e) => {
                            if (!editingReferee) return;
                            const current = editingReferee.allowedCategories || [];
                            const updated = e.target.checked 
                              ? [...current, cat.id]
                              : current.filter(id => id !== cat.id);
                            setEditingReferee({...editingReferee, allowedCategories: updated});
                          }}
                        />
                        <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                      </label>
                    );
                  })}
                  {categories.length === 0 && (
                    <p className="text-xs text-slate-500 italic">Aucune catégorie créée</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingReferee(null)}>Annuler</Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la Catégorie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom de la catégorie</Label>
                <Input 
                  value={editingCategory?.name || ''} 
                  onChange={(e) => editingCategory && setEditingCategory({...editingCategory, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Central (FDJ)</Label>
                  <Input 
                    type="number" 
                    value={editingCategory?.centralFee || 0} 
                    onChange={(e) => editingCategory && setEditingCategory({...editingCategory, centralFee: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assistant (FDJ)</Label>
                  <Input 
                    type="number" 
                    value={editingCategory?.assistantFee || 0} 
                    onChange={(e) => editingCategory && setEditingCategory({...editingCategory, assistantFee: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>4ème Arbitre (FDJ)</Label>
                <Input 
                  type="number" 
                  value={editingCategory?.fourthFee || 0} 
                  onChange={(e) => editingCategory && setEditingCategory({...editingCategory, fourthFee: Number(e.target.value)})} 
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label className="text-sm font-semibold">Saisie des Équipes</Label>
                <div className="flex gap-2">
                  <Input 
                    value={editTeamsInput} 
                    onChange={(e) => setEditTeamsInput(e.target.value)} 
                    placeholder="Nom de l'équipe"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editTeamsInput.trim() && editingCategory) {
                          const currentTeams = editingCategory.teams || [];
                          if (!currentTeams.includes(editTeamsInput.trim())) {
                            setEditingCategory({
                              ...editingCategory,
                              teams: [...currentTeams, editTeamsInput.trim()]
                            });
                          }
                          setEditTeamsInput('');
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      if (editTeamsInput.trim() && editingCategory) {
                        const currentTeams = editingCategory.teams || [];
                        if (!currentTeams.includes(editTeamsInput.trim())) {
                          setEditingCategory({
                            ...editingCategory,
                            teams: [...currentTeams, editTeamsInput.trim()]
                          });
                        }
                        setEditTeamsInput('');
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                
                {editingCategory && editingCategory.teams && editingCategory.teams.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-lg max-h-32 overflow-y-auto">
                    {editingCategory.teams.map((team, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-[11px] font-medium bg-slate-200 text-slate-800 pr-1 hover:bg-slate-300">
                        {team}
                        <span 
                          onClick={() => {
                            setEditingCategory({
                              ...editingCategory,
                              teams: (editingCategory.teams || []).filter(t => t !== team)
                            });
                          }}
                          className="hover:bg-slate-400 p-0.5 rounded cursor-pointer leading-none text-[8px]"
                        >
                          ✕
                        </span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>Annuler</Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingDesignation} onOpenChange={(open) => !open && setEditingDesignation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la Désignation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateDesignation} className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={editingDesignation?.date || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>N° Match</Label>
                <Input value={editingDesignation?.matchNumber || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, matchNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Équipe A</Label>
                <Input value={editingDesignation?.teamA || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, teamA: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Équipe B</Label>
                <Input value={editingDesignation?.teamB || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, teamB: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select 
                  value={editingDesignation?.categoryId || ""} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, categoryId: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Arbitre Central (allowed only)</Label>
                <Select 
                  value={editingDesignation?.centralId || ""} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, centralId: v})}
                  disabled={!editingDesignation?.categoryId}
                >
                  <SelectTrigger><SelectValue placeholder={editingDesignation?.categoryId ? "Choisir..." : "Sélectionner la catégorie d'abord"} /></SelectTrigger>
                  <SelectContent>
                    {getEligibleReferees(editingDesignation?.categoryId).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assistant 1 (allowed only)</Label>
                <Select 
                  value={editingDesignation?.assistant1Id || "none"} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, assistant1Id: v})}
                  disabled={!editingDesignation?.categoryId}
                >
                  <SelectTrigger><SelectValue placeholder={editingDesignation?.categoryId ? "Choisir..." : "Sélectionner la catégorie d'abord"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {getEligibleReferees(editingDesignation?.categoryId).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assistant 2 (allowed only)</Label>
                <Select 
                  value={editingDesignation?.assistant2Id || "none"} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, assistant2Id: v})}
                  disabled={!editingDesignation?.categoryId}
                >
                  <SelectTrigger><SelectValue placeholder={editingDesignation?.categoryId ? "Choisir..." : "Sélectionner la catégorie d'abord"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {getEligibleReferees(editingDesignation?.categoryId).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>4ème Arbitre (allowed only)</Label>
                <Select 
                  value={editingDesignation?.fourthId || "none"} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, fourthId: v})}
                  disabled={!editingDesignation?.categoryId}
                >
                  <SelectTrigger><SelectValue placeholder={editingDesignation?.categoryId ? "Choisir..." : "Sélectionner la catégorie d'abord"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {getEligibleReferees(editingDesignation?.categoryId).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Heure Début</Label>
                <Input type="time" value={editingDesignation?.startTime || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Heure Fin</Label>
                <Input type="time" value={editingDesignation?.endTime || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, endTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Terrain</Label>
                <Input value={editingDesignation?.terrain || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, terrain: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Assesseur</Label>
                <Input value={editingDesignation?.assessor || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, assessor: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Commissaire du Maire</Label>
                <Input value={editingDesignation?.mayorCommissioner || ''} onChange={(e) => editingDesignation && setEditingDesignation({...editingDesignation, mayorCommissioner: e.target.value})} />
              </div>
              <div className="col-span-full flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingDesignation(null)}>Annuler</Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!categoryToDeleteCalendar} onOpenChange={(open) => !open && setCategoryToDeleteCalendar(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Supprimer tout le calendrier ?
              </DialogTitle>
            </DialogHeader>
            <div className="py-3 text-sm text-slate-600 space-y-2">
              <p>
                Vous êtes sur le point de supprimer <strong>toutes les désignations et matchs planifiés</strong> pour la catégorie <strong className="text-slate-800">"{categoryToDeleteCalendar?.name}"</strong>.
              </p>
              <p className="text-xs text-rose-500 font-semibold italic">
                ⚠️ Cette action est définitive et supprimera l'intégralité du calendrier de cette catégorie.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCategoryToDeleteCalendar(null)} className="rounded-xl">
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => categoryToDeleteCalendar && deleteCategoryCalendar(categoryToDeleteCalendar.id)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700"
              >
                Confirmer la suppression
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCalendarView} onOpenChange={setShowCalendarView}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden sm:rounded-2xl">
            <DialogHeader className="border-b pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Calendrier de Planification des Matches
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Visualisez toutes les rencontres triées par ordre chronologique et filtrez par catégorie ou championnat.
                </p>
              </div>
            </DialogHeader>

            <div className="flex flex-wrap items-center justify-between gap-4 py-3 bg-slate-50 px-4 rounded-xl border border-slate-100 my-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Filtrage rapide du Championnat :</span>
              </div>
              <Select value={historyCategoryFilter} onValueChange={(v: string) => setHistoryCategoryFilter(v)}>
                <SelectTrigger className="w-[200px] h-9 bg-white border-slate-200 text-xs font-semibold rounded-xl">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏆 Toutes les catégories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>⚔️ {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1 pr-2 max-h-[50vh]">
              {historyDesignations.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed text-slate-400">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 stroke-1.5 opacity-50 text-slate-400" />
                  <p className="text-sm font-semibold">Aucun match planifié ou trouvé pour les critères de filtrage actifs.</p>
                  <p className="text-xs text-slate-400 mt-1">Générez un planning automatique ou créez des désignations manuelles.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    historyDesignations.reduce((acc, curr) => {
                      const dateKey = curr.date || "Date non définie";
                      if (!acc[dateKey]) acc[dateKey] = [];
                      acc[dateKey].push(curr);
                      return acc;
                    }, {} as Record<string, typeof historyDesignations>)
                  )
                    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                    .map(([dateString, matches]) => {
                      let formattedDate = dateString;
                      try {
                        const d = new Date(dateString);
                        if (!isNaN(d.getTime())) {
                          formattedDate = d.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          });
                        }
                      } catch {}

                      return (
                        <div key={dateString} className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b pb-1.5 border-slate-100">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                            {formattedDate} ({matches.length} {matches.length > 1 ? 'matchs' : 'match'})
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {matches.map((m) => {
                              const category = categories.find(c => c.id === m.categoryId);
                              const central = referees.find(r => r.id === m.centralId);
                              const ass1 = referees.find(r => r.id === m.assistant1Id);
                              const ass2 = referees.find(r => r.id === m.assistant2Id);
                              const fourth = referees.find(r => r.id === m.fourthId);

                              return (
                                <div key={m.id} className="relative p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 hover:shadow transition-all flex flex-col justify-between gap-3">
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <span className="text-[10px] font-bold bg-slate-100 border text-slate-500 rounded px-1.5 py-0.5">
                                        N° {m.matchNumber || '-'}
                                      </span>
                                      <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] rounded px-2 font-bold select-none">
                                        {category?.name || 'Catégorie inconnue'}
                                      </Badge>
                                    </div>

                                    <div className="py-1 text-center">
                                      <p className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                                        <span className="truncate">{m.teamA}</span>
                                        <span className="text-xs font-normal text-slate-400">vs</span>
                                        <span className="truncate">{m.teamB}</span>
                                      </p>
                                    </div>

                                    <div className="mt-2 space-y-1 text-[10px] text-slate-500 font-medium">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Horaire: {m.startTime || '-'} - {m.endTime || '-'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate">Terrain: {m.terrain || 'Non défini'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="border-t pt-2.5 mt-1 space-y-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Corps Arbitral :</p>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600">
                                      <div className="truncate"><span className="text-slate-400 font-semibold font-mono">Central:</span> {central?.name || 'Non désigné'}</div>
                                      {m.assistant1Id && m.assistant1Id !== 'none' && (
                                        <div className="truncate"><span className="text-slate-400 font-semibold font-mono">Ass. 1:</span> {ass1?.name || 'Non désigné'}</div>
                                      )}
                                      {m.assistant2Id && m.assistant2Id !== 'none' && (
                                        <div className="truncate"><span className="text-slate-400 font-semibold font-mono">Ass. 2:</span> {ass2?.name || 'Non désigné'}</div>
                                      )}
                                      {m.fourthId && m.fourthId !== 'none' && (
                                        <div className="truncate"><span className="text-slate-400 font-semibold font-mono">4ème:</span> {fourth?.name || 'Non désigné'}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="border-t pt-4 mt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
              <Button 
                onClick={() => {
                  setShowCalendarView(false);
                  setShowClubShareModal(true);
                }} 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 px-4 shadow-md cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Exporter & Envoyer aux Clubs
              </Button>
              <Button onClick={() => setShowCalendarView(false)} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 rounded-xl px-5 cursor-pointer">
                Fermer le Calendrier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Global Club Calendar Transmission and Export System */}
        <ClubCalendarShareModal
          isOpen={showClubShareModal}
          onClose={() => setShowClubShareModal(false)}
          categories={categories}
          designations={designations}
          referees={referees}
        />
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
