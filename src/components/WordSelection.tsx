
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <div className="flex justify-center">
      <Select onValueChange={onSelectWord}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Vyberte slovo" />
        </SelectTrigger>
        <SelectContent>
          {wordOptions.map((word) => (
            <SelectItem key={word} value={word}>
              <span className={isHardWord(word) ? 'text-red-500 font-semibold' : ''}>
                {word}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
