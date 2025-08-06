
import React, { useState } from 'react';
import { Moon, Sun, Palette, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);

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
        {/* Login Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/auth')}
            onMouseEnter={() => setShowLoginTooltip(true)}
            onMouseLeave={() => setShowLoginTooltip(false)}
            className="rounded-full hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary/40"
          >
            <User className="w-5 h-5" />
          </Button>
          {showLoginTooltip && (
            <div className="absolute right-0 top-full mt-2 px-3 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border whitespace-nowrap opacity-0 animate-in fade-in-0 zoom-in-95 hidden md:block">
              Přihlásit se
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode}
            onMouseEnter={() => setShowThemeTooltip(true)}
            onMouseLeave={() => setShowThemeTooltip(false)}
            className="rounded-full hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary/40"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          {showThemeTooltip && (
            <div className="absolute right-0 top-full mt-2 px-3 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border whitespace-nowrap opacity-0 animate-in fade-in-0 zoom-in-95 hidden md:block">
              Přepnout režim
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
