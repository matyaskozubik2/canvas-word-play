
import React, { useState, useRef, useEffect } from 'react';
import { QrCode, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isVisible, onClose, onCodeScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Nepodařilo se získat přístup ke kameře');
      toast({
        title: "Chyba kamery",
        description: "Nepodařilo se získat přístup ke kameře",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const code = prompt('Zadejte kód místnosti:');
    if (code && code.trim()) {
      onCodeScanned(code.trim().toUpperCase());
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible && !isScanning) {
      startCamera();
    }
    
    return () => {
      if (isScanning) {
        stopCamera();
      }
    };
  }, [isVisible]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Skenovat QR kód</span>
          </CardTitle>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={handleManualInput} variant="outline" className="w-full">
                Zadat kód ručně
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-black rounded-lg object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-white/50 rounded-lg">
                  <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Namiřte kameru na QR kód místnosti
              </div>

              <Button onClick={handleManualInput} variant="outline" className="w-full">
                Zadat kód ručně
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
