import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DrawingStroke {
  x: number;
  y: number;
  color: string;
  size: number;
  isEraser: boolean;
  type: 'start' | 'draw' | 'end';
}

interface UseRealtimeDrawingProps {
  gameId: string | null;
  playerId: string | null;
  isCurrentDrawer: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useRealtimeDrawing = ({ 
  gameId, 
  playerId, 
  isCurrentDrawer, 
  canvasRef 
}: UseRealtimeDrawingProps) => {
  const channelRef = useRef<any>(null);

  // Send drawing stroke to other players
  const broadcastStroke = useCallback(async (stroke: DrawingStroke) => {
    if (!gameId || !isCurrentDrawer || !channelRef.current) return;

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'drawing_stroke',
        payload: {
          ...stroke,
          playerId,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Error broadcasting stroke:', error);
    }
  }, [gameId, playerId, isCurrentDrawer]);

  // Clear canvas for all players
  const broadcastClear = useCallback(async () => {
    if (!gameId || !isCurrentDrawer || !channelRef.current) return;

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'canvas_clear',
        payload: {
          playerId,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Error broadcasting clear:', error);
    }
  }, [gameId, playerId, isCurrentDrawer]);

  // Apply stroke to canvas
  const applyStrokeToCanvas = useCallback((stroke: DrawingStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
    }

    if (stroke.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(stroke.x, stroke.y);
    } else if (stroke.type === 'draw') {
      ctx.lineTo(stroke.x, stroke.y);
      ctx.stroke();
    }
  }, [canvasRef]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  // Set up real-time drawing channel
  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up drawing channel for game:', gameId);

    const channel = supabase.channel(`drawing-${gameId}`, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'drawing_stroke' }, (payload) => {
        console.log('Received drawing stroke:', payload.payload);
        
        // Only apply strokes from other players
        if (payload.payload.playerId !== playerId) {
          applyStrokeToCanvas(payload.payload);
        }
      })
      .on('broadcast', { event: 'canvas_clear' }, (payload) => {
        console.log('Received canvas clear:', payload.payload);
        
        // Only clear for other players
        if (payload.payload.playerId !== playerId) {
          clearCanvas();
        }
      })
      .subscribe((status) => {
        console.log('Drawing channel status:', status);
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
        }
      });

    return () => {
      console.log('Cleaning up drawing channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [gameId, playerId, applyStrokeToCanvas, clearCanvas]);

  return {
    broadcastStroke,
    broadcastClear
  };
};