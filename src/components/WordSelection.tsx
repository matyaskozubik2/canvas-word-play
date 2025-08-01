
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WordSelectionProps {
  wordOptions: string[];
  onSelectWord: (word: string) => void;
}

const HARD_WORDS = [
  'mobilní aplikace', 'internet', 'nákup', 'nemocnice', 'doktor', 'letiště', 'pilot', 'ředitel', 'kněz',
  'vysavač', 'mikrovlnka', 'dálkový ovladač', 'televize', 'kamera', 'hasič', 'policista', 'vědec',
  'programátor', 'skladatel', 'zpěvák', 'kuchař', 'kadeřník', 'baletka', 'architekt', 'sochař', 'malíř',
  'čarodějnice', 'rytíř', 'princezna', 'robot', 'duch', 'upír', 'zombie', 'superhrdina', 'batman',
  'spiderman', 'dinosaurus', 'planeta', 'galaxie', 'vesmír', 'meteor', 'asteroid', 'Mars', 'Saturn',
  'měsíc (planetární)', 'astronaut', 'skafandr', 'prstýnek', 'náramek', 'řetízek', 'zrcadlo', 'kufr',
  'kabelka', 'batoh', 'CD', 'gramofon', 'flétna', 'buben', 'housle', 'kytara',
  'piáno', 'trumpetka', 'saxofon', 'fotografie', 'noviny', 'časopis', 'pohádka',
  'komiks', 'tablet', 'powerbanka', 'čtečka', 'cloud', 'e-mail', 'síť', 'přihlášení', 'heslo', 'wi-fi',
  'volání', 'zpráva', 'video', 'stream', 'youtuber', 'influencer', 'streamer', 'moderátor', 'komentář',
  'lajk', 'sdílení', 'sledování', 'mapa', 'kompas', 'GPS', 'satelit', 'radar', 'počasí', 'bouřka',
  'baterka', 'svítilna', 'sirka', 'zapalovač', 'svíčka', 'stín', 'odraz', 'kouř', 'oheň', 'lavina',
  'záplava', 'tornádo', 'vítr', 'teplota', 'zima', 'vedro', 'jaro', 'léto', 'podzim', 'školní výlet',
  'prázdniny', 'dovolená', 'výstava', 'muzeum', 'galerie', 'stadion', 'koncert', 'divadlo', 'cirkus',
  'závod', 'maraton', 'olympiáda', 'skok do dálky', 'běh', 'plavání', 'šachy', 'karty', 'domino', 'puzzle'
];

export const WordSelection: React.FC<WordSelectionProps> = ({ wordOptions, onSelectWord }) => {
  const isHardWord = (word: string) => HARD_WORDS.includes(word);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
      <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          Vyberte si slovo ke kreslení:
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
          {wordOptions.map((word) => (
            <Card 
              key={word} 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/95 backdrop-blur-sm min-w-[200px]"
              onClick={() => onSelectWord(word)}
            >
              <CardContent className="p-6 text-center">
                <span className={`text-lg font-semibold ${
                  isHardWord(word) ? 'text-red-600' : 'text-green-600'
                }`}>
                  {word}
                </span>
                <div className="mt-2 text-xs text-gray-500">
                  {isHardWord(word) ? 'Těžké' : 'Lehké'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-white/80 text-sm text-center max-w-md">
          Klikněte na slovo, které chcete kreslit. Zelená slova jsou lehčí, červená těžší.
        </p>
      </div>
    </div>
  );
};
