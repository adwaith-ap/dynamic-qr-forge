
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Link, History, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface QRHistory {
  id: string;
  url: string;
  timestamp: Date;
  qrDataUrl: string;
}

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QRHistory[]>([]);
  const [urlPreview, setUrlPreview] = useState<{ title: string; favicon: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qr-history', JSON.stringify(history));
  }, [history]);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const generateQRCode = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;
    
    setIsGenerating(true);
    try {
      const qrOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M' as const
      };

      const dataUrl = await QRCode.toDataURL(inputUrl, qrOptions);
      setQrDataUrl(dataUrl);

      // Add to history
      const newHistoryItem: QRHistory = {
        id: Date.now().toString(),
        url: inputUrl,
        timestamp: new Date(),
        qrDataUrl: dataUrl
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep only last 10 items

      toast({
        title: "QR Code Generated!",
        description: "Your QR code is ready to download.",
      });

      // Attempt to get URL preview (will fail for CORS but shows the intent)
      if (isValidUrl(inputUrl)) {
        fetchUrlPreview(inputUrl);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchUrlPreview = async (inputUrl: string) => {
    try {
      // This is a simplified preview - in a real app you'd use a proxy service
      const domain = new URL(inputUrl).hostname;
      setUrlPreview({
        title: domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      });
    } catch (error) {
      console.log('Preview fetch failed:', error);
    }
  };

  const downloadQRCode = (dataUrl: string, filename: string = 'qrcode') => {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded!",
      description: "QR code has been saved to your device.",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All saved QR codes have been removed.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    // Auto-generate QR code with debounce
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        generateQRCode(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            QR Code Generator Pro
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform any URL into a professional QR code instantly. Save, download, and manage your codes with ease.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Enter URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={handleInputChange}
                    className="text-lg h-12 pl-4 pr-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />
                  {url && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidUrl(url) ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </div>

                {urlPreview && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={urlPreview.favicon} alt="" className="w-6 h-6" />
                    <span className="text-sm text-gray-600">{urlPreview.title}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>
                )}

                <Button
                  onClick={() => generateQRCode(url)}
                  disabled={!url.trim() || isGenerating}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            {qrDataUrl && (
              <Card className="mt-6 backdrop-blur-sm bg-white/70 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Your QR Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="inline-block p-6 bg-white rounded-2xl shadow-lg">
                    <img src={qrDataUrl} alt="QR Code" className="mx-auto" />
                  </div>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button
                      onClick={() => downloadQRCode(qrDataUrl)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent QR Codes
                  </CardTitle>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No QR codes generated yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="group p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                        onClick={() => {
                          setUrl(item.url);
                          setQrDataUrl(item.qrDataUrl);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img src={item.qrDataUrl} alt="QR" className="w-10 h-10 rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.url}</p>
                            <p className="text-xs text-gray-500">
                              {item.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadQRCode(item.qrDataUrl, `qr-${item.id}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
