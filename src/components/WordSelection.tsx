
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WordSelectionProps {
  wordOptions: string[];
  onSelectWord: (word: string) => void;
}

export const WordSelection: React.FC<WordSelectionProps> = ({ wordOptions, onSelectWord }) => {
  return (
    <div className="flex justify-center">
      <Select onValueChange={onSelectWord}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Vyberte slovo" />
        </SelectTrigger>
        <SelectContent>
          {wordOptions.map((word) => (
            <SelectItem key={word} value={word}>
              {word}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
