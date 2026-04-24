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
import { 
  PlusCircle, 
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
  Info,
  BookOpen,
  Shield
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
  const [newReferee, setNewReferee] = useState({ name: '', phone: '', grade: '' });
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', centralFee: 0, assistantFee: 0, fourthFee: 0 });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newDesignation, setNewDesignation] = useState<Partial<Designation>>({
    date: '', teamA: '', teamB: '', matchNumber: '', startTime: '', endTime: '',
    categoryId: '', centralId: '', assistant1Id: '', assistant2Id: '', fourthId: ''
  });
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'>('all');
  const [refereeSearch, setRefereeSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

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
      const [refs, cats, desigs] = await Promise.all([
        api('/api/referees'),
        api('/api/categories'),
        api('/api/designations')
      ]);
      setReferees(refs);
      setCategories(cats);
      setDesignations(desigs);
      
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
      setNewReferee({ name: '', phone: '', grade: '' });
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
          grade: editingReferee.grade || ''
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

  const handleUpdateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesignation || !editingDesignation.categoryId || !editingDesignation.centralId) return;
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
      setNewCategory({ name: '', centralFee: 0, assistantFee: 0, fourthFee: 0 });
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
    try {
      await api('/api/designations', {
        method: 'POST',
        body: JSON.stringify({ ...newDesignation, id }),
      });
      setNewDesignation({ 
        date: '', teamA: '', teamB: '', matchNumber: '', startTime: '', endTime: '',
        categoryId: '', centralId: '', assistant1Id: '', assistant2Id: '', fourthId: ''
      });
      fetchData();
      toast.success('Désignation enregistrée');
    } catch (error: any) {
      toast.error(error.message);
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
  const historyDesignations = getFilteredDesignations(designations, historyFilter);

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
          </TabsContent>

          <TabsContent value="designations" className="space-y-6">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Nouvelle Désignation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addDesignation} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select 
                        value={newDesignation.categoryId || ""} 
                        onValueChange={(v) => setNewDesignation({...newDesignation, categoryId: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Arbitre Central</Label>
                      <Select 
                        value={newDesignation.centralId || ""} 
                        onValueChange={(v) => setNewDesignation({...newDesignation, centralId: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assistant 1</Label>
                      <Select 
                        value={newDesignation.assistant1Id || ""} 
                        onValueChange={(v) => setNewDesignation({...newDesignation, assistant1Id: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assistant 2</Label>
                      <Select 
                        value={newDesignation.assistant2Id || ""} 
                        onValueChange={(v) => setNewDesignation({...newDesignation, assistant2Id: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>4ème Arbitre</Label>
                      <Select 
                        value={newDesignation.fourthId || ""} 
                        onValueChange={(v) => setNewDesignation({...newDesignation, fourthId: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={newDesignation.date} onChange={(e) => setNewDesignation({...newDesignation, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Équipe A</Label>
                      <Input value={newDesignation.teamA} onChange={(e) => setNewDesignation({...newDesignation, teamA: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Équipe B</Label>
                      <Input value={newDesignation.teamB} onChange={(e) => setNewDesignation({...newDesignation, teamB: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>N° Match</Label>
                      <Input value={newDesignation.matchNumber} onChange={(e) => setNewDesignation({...newDesignation, matchNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure Début</Label>
                      <Input type="time" value={newDesignation.startTime} onChange={(e) => setNewDesignation({...newDesignation, startTime: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure Fin</Label>
                      <Input type="time" value={newDesignation.endTime} onChange={(e) => setNewDesignation({...newDesignation, endTime: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Terrain</Label>
                      <Input value={newDesignation.terrain || ""} onChange={(e) => setNewDesignation({...newDesignation, terrain: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Assesseur</Label>
                      <Input value={newDesignation.assessor || ""} onChange={(e) => setNewDesignation({...newDesignation, assessor: e.target.value})} />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full gap-2">
                        <PlusCircle className="w-4 h-4" /> Enregistrer
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
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Filter className="w-3 h-3 ml-2 text-slate-500" />
                    <Select value={historyFilter} onValueChange={(v: any) => setHistoryFilter(v)}>
                      <SelectTrigger className="w-[140px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-xs">
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
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300"
                            checked={selectedDesignationIds.length === historyDesignations.length && historyDesignations.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm">Matc N°</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Affiche</TableHead>
                        <TableHead className="text-xs sm:text-sm">Catégorie</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyDesignations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((d) => (
                        <TableRow key={d.id} className={selectedDesignationIds.includes(d.id) ? "bg-primary/5" : ""}>
                          <TableCell>
                             <input 
                              type="checkbox" 
                              className="rounded border-slate-300"
                              checked={selectedDesignationIds.includes(d.id)}
                              onChange={() => toggleSelect(d.id)}
                            />
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm font-medium">{d.matchNumber}</TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap">{d.date}</TableCell>
                          <TableCell className="text-xs sm:text-sm max-w-[150px] truncate">
                            {d.teamA} <span className="text-muted-foreground mx-1">vs</span> {d.teamB}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap">
                              {categories.find(c => c.id === d.categoryId)?.name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {(user?.role === 'admin' || user?.role === 'manager') && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDesignation(d)}>
                                  <Pencil className="w-3 h-3 text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteItem('designations', d.id)}>
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {historyDesignations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            Aucun match trouvé pour cette période
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
                <Label>Arbitre Central</Label>
                <Select 
                  value={editingDesignation?.centralId || ""} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, centralId: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assistant 1</Label>
                <Select 
                  value={editingDesignation?.assistant1Id || "none"} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, assistant1Id: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assistant 2</Label>
                <Select 
                  value={editingDesignation?.assistant2Id || "none"} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, assistant2Id: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>4ème Arbitre</Label>
                <Select 
                  value={editingDesignation?.fourthId || "none"} 
                  onValueChange={(v) => editingDesignation && setEditingDesignation({...editingDesignation, fourthId: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {referees.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
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
              <div className="col-span-full flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingDesignation(null)}>Annuler</Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
