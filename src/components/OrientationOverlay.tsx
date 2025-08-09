import React from "react";
import { Smartphone, RotateCw } from "lucide-react";

interface OrientationOverlayProps {
  isActive: boolean;
}

export const OrientationOverlay: React.FC<OrientationOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md"
      aria-live="polite"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-effect rounded-2xl p-8 sm:p-10 max-w-sm w-[90%] text-center shadow-xl border border-border">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15">
          <Smartphone className="h-12 w-12 text-foreground/80 -rotate-90" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Otočte zařízení</h2>
        <p className="text-sm text-muted-foreground mb-6">Pro nejlepší zážitek prosím otočte telefon na šířku.</p>
        <div className="inline-flex items-center gap-2 text-foreground/80">
          <RotateCw className="h-5 w-5 animate-spin-slow" />
          <span className="text-sm">Otočte na režim na šířku</span>
        </div>
      </div>

      {/* Local keyframes for a softer spin */}
      <style>{`
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
