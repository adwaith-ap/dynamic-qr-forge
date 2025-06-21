
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Link, History, Trash2, Eye, ExternalLink, Zap, Shield, Clock, Palette } from 'lucide-react';
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

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Generation",
      description: "Generate QR codes in real-time as you type your URL"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Download Ready",
      description: "Download high-quality PNG files instantly"
    },
    {
      icon: <History className="h-6 w-6" />,
      title: "Smart History",
      description: "Keep track of your last 10 generated QR codes"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "URL Validation",
      description: "Real-time validation ensures your URLs are correct"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Live Preview",
      description: "See website favicons and domain previews"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Professional Design",
      description: "Beautiful, responsive interface with modern styling"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-magenta-500/20 via-purple-600/20 to-pink-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-magenta-400/30 to-purple-500/30 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-magenta-500/30 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-[spin_20s_linear_infinite]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-magenta-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              QR Code Generator Pro
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Transform any URL into a professional QR code instantly. Save, download, and manage your codes with ease.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-sm bg-gray-800/50 border border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Link className="h-5 w-5 text-magenta-400" />
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
                      className="text-lg h-12 pl-4 pr-12 border-2 border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-magenta-500 transition-colors"
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
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <img src={urlPreview.favicon} alt="" className="w-6 h-6" />
                      <span className="text-sm text-gray-300">{urlPreview.title}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  )}

                  <Button
                    onClick={() => generateQRCode(url)}
                    disabled={!url.trim() || isGenerating}
                    className="w-full h-12 text-lg bg-gradient-to-r from-magenta-600 to-purple-600 hover:from-magenta-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                </CardContent>
              </Card>

              {/* QR Code Display */}
              {qrDataUrl && (
                <Card className="mt-6 backdrop-blur-sm bg-gray-800/50 border border-gray-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Your QR Code</CardTitle>
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
                      <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
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
              <Card className="backdrop-blur-sm bg-gray-800/50 border border-gray-700 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <History className="h-5 w-5 text-magenta-400" />
                      Recent QR Codes
                    </CardTitle>
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No QR codes generated yet</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="group p-3 rounded-lg border border-gray-600 hover:border-magenta-500 hover:bg-gray-700/50 transition-all cursor-pointer"
                          onClick={() => {
                            setUrl(item.url);
                            setQrDataUrl(item.qrDataUrl);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.qrDataUrl} alt="QR" className="w-10 h-10 rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-white">{item.url}</p>
                              <p className="text-xs text-gray-400">
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-white"
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

          {/* Features Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-magenta-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Powerful Features
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Everything you need to create, manage, and download professional QR codes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="backdrop-blur-sm bg-gray-800/30 border border-gray-700 hover:border-magenta-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-magenta-500 to-purple-500 rounded-lg mb-4 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
