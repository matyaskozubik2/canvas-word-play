
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Star, Home, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PlayerResult {
  id: string;
  name: string;
  score: number;
  correctGuesses: number;
  avatar: string;
  isCurrentPlayer?: boolean;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { players, gameSettings } = location.state || {};

  // Mock results data - in real app this would come from game state
  const results: PlayerResult[] = players?.map((player: any, index: number) => ({
    ...player,
    score: Math.floor(Math.random() * 1000) + 100,
    correctGuesses: Math.floor(Math.random() * 5) + 1,
    isCurrentPlayer: player.name === 'Váš hráč' // This would be determined by actual player comparison
  })).sort((a: PlayerResult, b: PlayerResult) => b.score - a.score) || [];

  const currentPlayer = results.find(p => p.isCurrentPlayer);
  const winner = results[0];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-gray-300" />;
    }
  };

  const playAgain = () => {
    navigate('/lobby', { 
      state: { 
        playerName: currentPlayer?.name,
        gameSettings,
        isHost: true 
      } 
    });
  };

  const shareResults = async () => {
    const shareText = `🎨 Právě jsem skončil hru DrawGuess! Skončil jsem na ${results.findIndex(p => p.isCurrentPlayer) + 1}. místě se skóre ${currentPlayer?.score} bodů! 🏆`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DrawGuess - Výsledky hry',
          text: shareText,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Výsledky zkopírovány do schránky!');
      } catch (err) {
        console.log('Copy failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="mb-6">
          {winner && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {winner.name} vyhrál!
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Se skóre {winner.score} bodů
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Results Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Konečné výsledky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                    player.isCurrentPlayer
                      ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700'
                      : index === 0
                      ? 'bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700">
                      {getRankIcon(index + 1)}
                    </div>
                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                      #{index + 1}
                    </span>
                  </div>

                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={`${player.avatar} text-white font-bold`}>
                      {player.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">{player.name}</span>
                      {player.isCurrentPlayer && (
                        <Badge variant="secondary">Vy</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {player.correctGuesses} správných odpovědí
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {player.score}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      bodů
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {gameSettings?.rounds || 3}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Odehraných kol
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {currentPlayer?.correctGuesses || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Vaše správné odpovědi
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {results.findIndex(p => p.isCurrentPlayer) + 1}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Vaše umístění
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={playAgain}
            className="h-12 px-8 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Hrát znovu
          </Button>

          <Button
            onClick={shareResults}
            variant="outline"
            className="h-12 px-8 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Sdílet výsledky
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="h-12 px-8 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Hlavní menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
