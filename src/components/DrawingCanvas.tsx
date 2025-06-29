
import React, { useRef, useEffect, useState } from 'react';
import { Palette, Eraser, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface DrawingCanvasProps {
  canDraw: boolean;
  className?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ canDraw, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set initial canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Drawing Tools */}
      {canDraw && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-t-xl border-b">
          {/* Color Palette */}
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  currentColor === color && !isEraser ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  setIsEraser(false);
                }}
              />
            ))}
          </div>

          {/* Tools */}
          <div className="flex space-x-2">
            <Button
              variant={isEraser ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEraser(!isEraser)}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={downloadCanvas}>
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2 min-w-[120px]">
            <span className="text-sm whitespace-nowrap">Velikost: {brushSize}</span>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1 bg-white rounded-b-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {!canDraw && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Pozorujete kreslení...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
