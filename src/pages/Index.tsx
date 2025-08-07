
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { OGImageGenerator } from '@/components/OGImageGenerator';
import { QRScanner } from '@/components/QRScanner';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { GameCards } from '@/components/GameCards';
import { FeaturesSection } from '@/components/FeaturesSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOGGenerator, setShowOGGenerator] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check system preference for dark mode
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    // Check for join parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setRoomCode(joinCode.toUpperCase());
      toast({
        title: "QR kód naskenován!",
        description: `Kód místnosti: ${joinCode}`
      });
    }
  }, [toast]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const generateRandomName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPlayerName(result);
  };

  const createRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte své jméno",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Creating room with player name:', playerName);
      navigate('/lobby', {
        state: {
          playerName,
          isHost: true
        }
      });
    } catch (error) {
      console.error('Error navigating to lobby:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit místnost",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte jméno a kód místnosti",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Checking if room exists:', roomCode);
      // Check if room exists
      const game = await gameService.getGameByRoomCode(roomCode);
      if (!game) {
        toast({
          title: "Chyba",
          description: "Místnost s tímto kódem neexistuje",
          variant: "destructive"
        });
        return;
      }
      console.log('Room found, navigating to lobby');
      navigate('/lobby', {
        state: {
          playerName,
          roomCode,
          isHost: false
        }
      });
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se připojit k místnosti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinRandomGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte své jméno",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Creating random game for player:', playerName);
      toast({
        title: "Vytváření hry...",
        description: "Vytváříme pro vás novou hru"
      });

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/lobby', {
        state: {
          playerName,
          isHost: true,
          isRandomGame: true
        }
      });
    } catch (error) {
      console.error('Error creating random game:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit náhodnou hru",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSinglePlayerGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte své jméno",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Starting single player game for:', playerName);
      toast({
        title: "Spouštění hry...",
        description: "Vytváříme hru pro jednoho hráče"
      });

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/game', {
        state: {
          playerName,
          isSinglePlayer: true
        }
      });
    } catch (error) {
      console.error('Error starting single player game:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se spustit hru pro jednoho hráče",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScanned = (scannedCode: string) => {
    setRoomCode(scannedCode);
    toast({
      title: "QR kód naskenován!",
      description: `Kód místnosti: ${scannedCode}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 transition-all duration-500">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} onShowQRScanner={() => setShowQRScanner(true)} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <HeroSection />
        
        <GameCards
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          loading={loading}
          generateRandomName={generateRandomName}
          createRoom={createRoom}
          joinRandomGame={joinRandomGame}
          joinRoom={joinRoom}
          startSinglePlayerGame={startSinglePlayerGame}
          onShowQRScanner={() => setShowQRScanner(true)}
        />

        <FeaturesSection />
      </div>

      <Footer onShowOGGenerator={() => setShowOGGenerator(true)} />

      <OGImageGenerator isVisible={showOGGenerator} />
      <QRScanner 
        isVisible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onCodeScanned={handleQRCodeScanned}
      />
    </div>
  );
};

export default Index;
