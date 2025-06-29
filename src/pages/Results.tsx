
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores, players, roomCode } = location.state || {};

  if (!scores || !players) {
    navigate('/');
    return null;
  }

  // Sort players by score
  const sortedResults = Object.entries(scores)
    .map(([playerName, score]) => ({
      name: playerName,
      score: score as number,
      player: players.find((p: any) => p.name === playerName)
    }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedResults[0];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-500">{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600';
      case 1:
        return 'from-gray-300 to-gray-500';
      case 2:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-gray-200 to-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Confetti Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            {['🎉', '🎊', '⭐', '🏆', '🎨'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Konec hry!
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gratulujeme vítězi: <span className="font-bold text-purple-600">{winner.name}</span>
          </p>
        </div>

        {/* Results */}
        <Card className="max-w-2xl mx-auto mb-8 border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Výsledková tabulka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedResults.map((result, index) => (
                <div
                  key={result.name}
                  className={`flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r ${getRankColor(index)} transform transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-lg text-white">
                      {result.name}
                    </div>
                    {index === 0 && (
                      <div className="text-sm text-white/80">🏆 Vítěz!</div>
                    )}
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 text-white text-lg px-4 py-2 border-0"
                  >
                    {result.score} bodů
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => navigate('/lobby', { 
              state: { 
                playerName: winner.name, 
                roomCode, 
                isHost: true 
              } 
            })}
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Hrát znovu
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="px-8 py-3 rounded-xl font-semibold border-2 border-gray-400 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Domů
          </Button>
        </div>

        {/* Stats */}
        <Card className="max-w-lg mx-auto mt-8 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Statistiky hry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{players.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hráči</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">{Math.max(...Object.values(scores) as number[])}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nejvyšší skóre</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{roomCode}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Kód místnosti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(scores).reduce((a, b) => (a as number) + (b as number), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Celkem bodů</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
