import React from 'react';
import { Palette } from 'lucide-react';

export const OGImageGenerator: React.FC = () => {
  const downloadOGImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#8b5cf6'); // purple-500
    gradient.addColorStop(0.5, '#ec4899'); // pink-500
    gradient.addColorStop(1, '#3b82f6'); // blue-500

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * 60, j * 63, 30, 30);
        }
      }
    }

    // Logo background circle
    const centerX = 300;
    const centerY = 315;
    const logoRadius = 80;

    const logoGradient = ctx.createLinearGradient(
      centerX - logoRadius,
      centerY - logoRadius,
      centerX + logoRadius,
      centerY + logoRadius
    );
    logoGradient.addColorStop(0, '#8b5cf6');
    logoGradient.addColorStop(1, '#ec4899');

    ctx.fillStyle = logoGradient;
    ctx.beginPath();
    ctx.roundRect(centerX - logoRadius, centerY - logoRadius, logoRadius * 2, logoRadius * 2, 24);
    ctx.fill();

    // Palette icon (simplified)
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.beginPath();
    
    // Draw palette shape
    ctx.ellipse(centerX, centerY - 10, 40, 30, 0, 0, Math.PI * 1.3);
    ctx.ellipse(centerX + 20, centerY + 15, 15, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Color dots on palette
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX - 25 + index * 12, centerY - 20, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Main title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DrawGuess', 420, 280);

    // Subtitle
    ctx.font = '40px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Kreslíte. Hádáte. Bavíte se.', 420, 340);

    // Description
    ctx.font = '28px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Moderní multiplayerová kreslící hra pro přátele', 420, 390);
    ctx.fillText('Vytvořte místnost nebo se připojte ke hře!', 420, 430);

    // Free indicator
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillRect(420, 460, 120, 40);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('ZDARMA', 480, 485);

    // Download the image
    const link = document.createElement('a');
    link.download = 'og-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={downloadOGImage}
        className="group bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg shadow-lg flex items-center transition-all duration-300 hover:px-4"
        title="Stáhnout OG obrázek"
      >
        <Palette className="w-4 h-4" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300">
          Stáhnout OG obrázek
        </span>
      </button>
    </div>
  );
};
