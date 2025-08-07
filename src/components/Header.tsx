
import React from 'react';
import { Moon, Sun, Palette, User, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onShowQRScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, onShowQRScanner }) => {
  const navigate = useNavigate();
  return (
    <header className="p-6 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          DrawGuess
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/auth')}
              className="rounded-full hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary/40"
              aria-label="Přihlásit se"
            >
              <User className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="hidden md:block">
            Přihlásit se
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onShowQRScanner}
              className="rounded-full hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary/40"
              aria-label="Skenovat QR kód"
            >
              <QrCode className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="hidden md:block">
            Skenovat QR kód
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-full hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary/40"
              aria-label="Přepnout režim"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="hidden md:block">
            Přepnout režim
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};
