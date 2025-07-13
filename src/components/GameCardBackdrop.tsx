
import React from 'react';

interface GameCardBackdropProps {
  isVisible: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const GameCardBackdrop: React.FC<GameCardBackdropProps> = ({ isVisible, onClick }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ease-out animate-in fade-in-0" 
      onClick={onClick}
    />
  );
};
