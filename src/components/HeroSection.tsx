
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          Kreslete. Hádejte. Bavte se.
        </span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Moderní multiplayerová kreslící hra pro přátele. Vytvořte místnost nebo se připojte ke hře!
      </p>
    </div>
  );
};
