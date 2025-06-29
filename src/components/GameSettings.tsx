
import React from 'react';
import { Settings, Clock, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface GameSettingsProps {
  settings: {
    rounds: number;
    drawTime: number;
    language: string;
    customWords: string[];
    maxPlayers: number;
  };
  onSettingsChange: (settings: any) => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({ settings, onSettingsChange }) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Nastavení hry</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rounds */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Počet kol: {settings.rounds}</span>
          </Label>
          <Slider
            value={[settings.rounds]}
            onValueChange={(value) => updateSetting('rounds', value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Draw Time */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Čas na kreslení: {settings.drawTime}s</span>
          </Label>
          <Slider
            value={[settings.drawTime]}
            onValueChange={(value) => updateSetting('drawTime', value[0])}
            min={30}
            max={180}
            step={10}
            className="w-full"
          />
        </div>

        {/* Max Players */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Max. hráčů: {settings.maxPlayers}</span>
          </Label>
          <Slider
            value={[settings.maxPlayers]}
            onValueChange={(value) => updateSetting('maxPlayers', value[0])}
            min={2}
            max={12}
            step={1}
            className="w-full"
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Jazyk</span>
          </Label>
          <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs">🇨🇿 Čeština</SelectItem>
              <SelectItem value="en">🇺🇸 Angličtina</SelectItem>
              <SelectItem value="de">🇩🇪 Němčina</SelectItem>
              <SelectItem value="fr">🇫🇷 Francouzština</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
