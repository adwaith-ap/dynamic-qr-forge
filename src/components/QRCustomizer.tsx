
import React from 'react';
import { Palette, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface QRCustomizerProps {
  onStyleChange: (style: QRStyle) => void;
  onDownload: (format: 'png' | 'svg' | 'pdf') => void;
  currentStyle: QRStyle;
}

interface QRStyle {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logoUrl?: string;
}

const QRCustomizer: React.FC<QRCustomizerProps> = ({ 
  onStyleChange, 
  onDownload, 
  currentStyle 
}) => {
  const handleStyleChange = (key: keyof QRStyle, value: any) => {
    onStyleChange({
      ...currentStyle,
      [key]: value
    });
  };

  const presetColors = [
    { name: 'Classic', fg: '#000000', bg: '#ffffff' },
    { name: 'Red', fg: '#dc2626', bg: '#ffffff' },
    { name: 'Dark Red', fg: '#991b1b', bg: '#ffffff' },
    { name: 'Crimson', fg: '#dc143c', bg: '#ffffff' },
    { name: 'Dark', fg: '#ffffff', bg: '#1f2937' },
  ];

  return (
    <Card className="backdrop-blur-sm bg-gray-900/50 border border-red-900/30 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-red-400" />
          Customize QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Presets */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Color Presets</label>
          <div className="flex gap-2 flex-wrap">
            {presetColors.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant="outline"
                onClick={() => {
                  handleStyleChange('foregroundColor', preset.fg);
                  handleStyleChange('backgroundColor', preset.bg);
                }}
                className="border-red-800/50 text-gray-300 hover:bg-gray-800"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2 border border-gray-400"
                  style={{ backgroundColor: preset.fg }}
                />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Foreground</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentStyle.foregroundColor}
                onChange={(e) => handleStyleChange('foregroundColor', e.target.value)}
                className="w-12 h-10 p-1 border-red-800/50 bg-gray-800"
              />
              <Input
                type="text"
                value={currentStyle.foregroundColor}
                onChange={(e) => handleStyleChange('foregroundColor', e.target.value)}
                className="flex-1 border-red-800/50 bg-gray-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">Background</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentStyle.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-12 h-10 p-1 border-red-800/50 bg-gray-800"
              />
              <Input
                type="text"
                value={currentStyle.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="flex-1 border-red-800/50 bg-gray-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* Size and Margin */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Size</label>
            <Input
              type="range"
              min="200"
              max="800"
              value={currentStyle.size}
              onChange={(e) => handleStyleChange('size', parseInt(e.target.value))}
              className="border-red-800/50 bg-gray-800"
            />
            <span className="text-xs text-gray-400">{currentStyle.size}px</span>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">Margin</label>
            <Input
              type="range"
              min="0"
              max="8"
              value={currentStyle.margin}
              onChange={(e) => handleStyleChange('margin', parseInt(e.target.value))}
              className="border-red-800/50 bg-gray-800"
            />
            <span className="text-xs text-gray-400">{currentStyle.margin}</span>
          </div>
        </div>

        {/* Error Correction Level */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Error Correction</label>
          <div className="flex gap-2">
            {(['L', 'M', 'Q', 'H'] as const).map((level) => (
              <Button
                key={level}
                size="sm"
                variant={currentStyle.errorCorrectionLevel === level ? "default" : "outline"}
                onClick={() => handleStyleChange('errorCorrectionLevel', level)}
                className={
                  currentStyle.errorCorrectionLevel === level
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-red-800/50 text-gray-300 hover:bg-gray-800"
                }
              >
                {level}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            L: ~7% | M: ~15% | Q: ~25% | H: ~30%
          </p>
        </div>

        {/* Download Options */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Download Format</label>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onDownload('png')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-1" />
              PNG
            </Button>
            <Button
              size="sm"
              onClick={() => onDownload('svg')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              SVG
            </Button>
            <Button
              size="sm"
              onClick={() => onDownload('pdf')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCustomizer;
