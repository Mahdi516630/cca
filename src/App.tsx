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
  UserPlus
} from 'lucide-react';
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
import { generateRefereeReport } from './lib/pdf-utils';
import { generateRefereeExcelReport } from './lib/excel-utils';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  
  // Auth form states
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Form states
  const [newReferee, setNewReferee] = useState({ name: '', phone: '' });
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', centralFee: 0, assistantFee: 0, fourthFee: 0 });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newDesignation, setNewDesignation] = useState<Partial<Designation>>({
    date: '', teamA: '', teamB: '', matchNumber: '', startTime: '', endTime: '',
    categoryId: '', centralId: '', assistant1Id: '', assistant2Id: '', fourthId: ''
  });
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('month');
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
      fetchData();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
    } catch (error) {
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
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setNewReferee({ name: '', phone: '' });
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
        body: JSON.stringify({ name: editingReferee.name, phone: editingReferee.phone || '' }),
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

  const getFilteredDesignations = () => {
    const now = new Date();
    let startDate: Date | null = null;
    switch (timeFilter) {
      case 'week': startDate = startOfWeek(now); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'quarter': startDate = startOfQuarter(now); break;
      case 'year': startDate = startOfYear(now); break;
      default: return designations;
    }
    return designations.filter(d => {
      if (!d.date) return false;
      const dDate = parseISO(d.date);
      return isAfter(dDate, startDate!) || dDate.getTime() === startDate!.getTime();
    });
  };

  const filteredDesignations = getFilteredDesignations();

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <Toaster position="top-center" />
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Referee Manager</CardTitle>
            <CardDescription>{isRegister ? 'Créez votre compte' : 'Connectez-vous à votre espace'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  required
                  value={authForm.email} 
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})} 
                  placeholder="nom@exemple.com"
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
                />
              </div>
              <Button type="submit" className="w-full h-11 text-lg gap-2">
                {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isRegister ? "S'inscrire" : "Se connecter"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-primary hover:underline font-medium"
              >
                {isRegister ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-primary" />
            <span className="hidden sm:inline">Referee Manager</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="referees" className="space-y-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-white p-1">
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger value="referees" className="gap-2"><Users className="w-4 h-4" /> Arbitres</TabsTrigger>
              <TabsTrigger value="categories" className="gap-2"><Layers className="w-4 h-4" /> Catégories</TabsTrigger>
              <TabsTrigger value="designations" className="gap-2"><Calendar className="w-4 h-4" /> Désignations</TabsTrigger>
              <TabsTrigger value="reports" className="gap-2"><FileText className="w-4 h-4" /> Rapports</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="referees" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
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
                    <Button type="submit" className="w-full gap-2">
                      <PlusCircle className="w-4 h-4" /> Ajouter
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-md">
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
                            <TableCell>{ref.phone || '-'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => setEditingReferee(ref)}>
                                <Pencil className="w-4 h-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('referees', ref.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
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

              <Card className="lg:col-span-2 border-none shadow-md">
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
                              <Button variant="ghost" size="icon" onClick={() => setEditingCategory(cat)}>
                                <Pencil className="w-4 h-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('categories', cat.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
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
                  <div className="flex items-end">
                    <Button type="submit" className="w-full gap-2">
                      <PlusCircle className="w-4 h-4" /> Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Historique des Désignations</CardTitle>
                <Badge variant="secondary" className="text-sm">
                  {designations.length} Désignations au total
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Match</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {designations.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.matchNumber}</TableCell>
                          <TableCell>{d.date}</TableCell>
                          <TableCell>{d.teamA} vs {d.teamB}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {categories.find(c => c.id === d.categoryId)?.name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingDesignation(d)}>
                              <Pencil className="w-4 h-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem('designations', d.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  <Button onClick={() => generateRefereeReport(filteredDesignations, referees, categories)} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Générer le Rapport PDF
                  </Button>
                  <Button onClick={() => generateRefereeExcelReport(filteredDesignations, referees, categories)} variant="outline" className="gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    Exporter en Excel
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
                            <CardTitle className="text-base">{cat.name}</CardTitle>
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
              <div className="col-span-full flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingDesignation(null)}>Annuler</Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
