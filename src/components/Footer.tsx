
import React from 'react';
import { Palette } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-32 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DrawGuess
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Moderní multiplayerová kreslící hra pro přátele a rodinu. Bavte se kreativně a bez reklam.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">Kontakt</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>DrawGuess Team</p>
              <p>hello@drawguess.app</p>
              <p>Česká republika</p>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">Právní informace</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>© 2024 DrawGuess</p>
              <p>Vytvořeno s ❤️ v Česku</p>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Vlastník této stránky není zodpovědný za jakýkoli obsah vytvořený uživateli (kresby, zprávy, uživatelská jména).
          </p>
        </div>
      </div>
    </footer>
  );
};
