import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BarChart3, Settings, Home, Crown, Search, Trash2, UserX, Eye, Clock, User, Plus, Key, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPanel } from '@/hooks/useAdminPanel';

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const {
    games,
    selectedGame,
    setSelectedGame,
    searchTerm,
    setSearchTerm,
    loading,
    kickPlayer,
    deleteGame,
    getPhaseText,
    refreshGames
  } = useAdminPanel();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session?.user) {
          navigate('/auth');
        }
        setAuthLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session?.user) {
        navigate('/auth');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchInviteCodes();
      fetchActivity();
    }
  }, [session]);

  const fetchInviteCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInviteCodes(data || []);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
    }
  };

  const fetchActivity = async () => {
    setActivityLoading(true);
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('player_activity')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivity(data || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase.from('player_activity').delete().eq('id', id);
      if (error) throw error;
      setActivity((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Smazáno', description: 'Záznam byl smazán' });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({ title: 'Chyba', description: 'Nepodařilo se smazat záznam', variant: 'destructive' });
    }
  };

  const generateInviteCode = async () => {
    if (!session) return;
    
    setGeneratingCode(true);
    try {
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_invite_code');

      if (codeError) throw codeError;

      const { error } = await supabase
        .from('admin_invite_codes')
        .insert({
          code: codeData,
          created_by_admin: session.user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (error) throw error;

      toast({
        title: "Kód vygenerován",
        description: `Nový registrační kód: ${codeData}`
      });

      fetchInviteCodes();
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se vygenerovat kód",
        variant: "destructive"
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Zkopírováno",
        description: "Kód byl zkopírován do schránky"
      });
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se zkopírovat kód",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Odhlášení úspěšné",
        description: "Byli jste úspěšně odhlášeni"
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Chyba odhlášení",
        description: "Nepodařilo se odhlásit. Zkuste to znovu.",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Načítání...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const isMainAdmin = session.user.email === 'matyaskozubik2@icloud.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DrawGuess Admin
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {session.user.email}
                  </p>
                  {isMainAdmin && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Hlavní admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Hlavní stránka</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
                <span>Odhlásit se</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Aktivní herní místnosti
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sledování a správa probíhajících her DrawGuess
              </p>
            </div>
            <Button onClick={refreshGames} variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Obnovit
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Aktivní hry</p>
                  <p className="text-3xl font-bold">{games.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Online hráči</p>
                  <p className="text-3xl font-bold">{games.reduce((total, game) => total + game.player_count, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">V kreslení</p>
                  <p className="text-3xl font-bold">{games.filter(g => g.phase === 'drawing').length}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Vyhledat místnosti podle kódu nebo ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Games List */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            {/* Invite Codes Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Registrační kódy</span>
                  </CardTitle>
                  <Button 
                    onClick={generateInviteCode}
                    disabled={generatingCode}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {generatingCode ? "Generuji..." : "Nový kód"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {inviteCodes.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">Žádné kódy k dispozici</p>
                  ) : (
                    inviteCodes.map((code) => (
                      <div key={code.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <code className="font-mono font-bold text-lg">{code.code}</code>
                          <div className="flex gap-2">
                            <Badge variant={code.used ? "destructive" : "default"}>
                              {code.used ? "Použitý" : "Aktivní"}
                            </Badge>
                            {code.expires_at && new Date(code.expires_at) < new Date() && (
                              <Badge variant="outline">Vypršel</Badge>
                            )}
                          </div>
                          {code.used && code.used_by_email && (
                            <span className="text-xs text-gray-500">({code.used_by_email})</span>
                          )}
                        </div>
                        <Button
                          onClick={() => copyToClipboard(code.code)}
                          variant="ghost"
                          size="sm"
                          disabled={code.used}
                        >
                          {copiedCode === code.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Historie aktivit hráčů (7 dní) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Historie aktivit (7 dní)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Žádná aktivita</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{a.player_name}</span>
                            <span className="text-gray-500">({a.room_code})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(a.created_at).toLocaleString()} • {a.device}{a.country ? ` • ${a.country}` : ''}
                          </div>
                        </div>
                        <Button onClick={() => deleteActivity(a.id)} variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Games Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Aktivní místnosti ({games.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : games.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Nenalezeny žádné místnosti' : 'Žádné aktivní hry'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedGame?.id === game.id 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedGame(game)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="font-mono font-bold text-lg">{game.room_code}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {getPhaseText(game.phase)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{game.player_count}/{game.max_players}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Kolo {game.current_round}/{game.total_rounds}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          ID: {game.id.substring(0, 8)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Details */}
          <div className="lg:col-span-2 xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Detail místnosti</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedGame ? (
                  <div className="space-y-6">
                    {/* Game Info */}
                    <div>
                      <h3 className="font-semibold mb-3">Informace o hře</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Kód místnosti:</span>
                          <span className="font-mono font-bold">{selectedGame.room_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Fáze:</span>
                          <Badge variant="secondary">{getPhaseText(selectedGame.phase)}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Kolo:</span>
                          <span>{selectedGame.current_round}/{selectedGame.total_rounds}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Čas na kreslení:</span>
                          <span>{selectedGame.draw_time}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Hráči:</span>
                          <span>{selectedGame.player_count}/{selectedGame.max_players}</span>
                        </div>
                        {selectedGame.current_word && selectedGame.phase === 'drawing' && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Aktuální slovo:</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {selectedGame.current_word}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Players List */}
                    <div>
                      <h3 className="font-semibold mb-3">Seznam hráčů</h3>
                      <div className="space-y-2">
                        {selectedGame.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${player.avatar_color}`}
                              >
                                {player.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                  <span>Skóre: {player.score}</span>
                                  {player.is_host && <Badge variant="outline" className="text-xs">Host</Badge>}
                                  {selectedGame.current_drawer_id === player.id && (
                                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                      Kreslí
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Odstranit hráče</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Opravdu chcete odstranit hráče "{player.name}" ze hry? Tato akce je nevratná.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Zrušit</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => kickPlayer(player.id, player.name, selectedGame.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Odstranit
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Game Actions */}
                    <div>
                      <h3 className="font-semibold mb-3">Akce</h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Smazat místnost
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Smazat místnost</AlertDialogTitle>
                            <AlertDialogDescription>
                              Opravdu chcete smazat místnost "{selectedGame.room_code}"? 
                              Tato akce odstraní všechny hráče, zprávy a data hry. Akce je nevratná.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Zrušit</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteGame(selectedGame.id, selectedGame.room_code)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Smazat
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Vyberte místnost pro zobrazení detailů</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;