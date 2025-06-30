
import React, { useState, useCallback } from 'react';
import { Upload, Camera, Link2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

const QRDecoder = () => {
  const [decodedUrl, setDecodedUrl] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setDecodedUrl(code.data);
            toast({
              title: "QR Code Decoded!",
              description: "Successfully extracted the URL from your QR code.",
            });
          } else {
            toast({
              title: "No QR Code Found",
              description: "Could not detect a QR code in the uploaded image.",
              variant: "destructive",
            });
          }
        }
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      toast({
        title: "Decoding Failed",
        description: "Failed to decode the QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  }, [toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(decodedUrl);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const openUrl = () => {
    window.open(decodedUrl, '_blank');
  };

  return (
    <Card className="backdrop-blur-sm bg-gray-900/50 border border-red-900/30 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5 text-red-400" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="qr-upload"
            disabled={isDecoding}
          />
          <label
            htmlFor="qr-upload"
            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-red-800/50 rounded-lg cursor-pointer hover:border-red-500 transition-colors bg-gray-800/30"
          >
            {isDecoding ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-2"></div>
                <p className="text-gray-300">Decoding...</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-gray-300">Upload QR Code Image</p>
                <p className="text-sm text-gray-400">PNG, JPG, or other image formats</p>
              </div>
            )}
          </label>
        </div>

        {decodedUrl && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-red-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white">Decoded URL:</span>
              </div>
              <p className="text-gray-300 break-all">{decodedUrl}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1 border-red-800/50 text-gray-300 hover:bg-gray-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
              <Button
                onClick={openUrl}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRDecoder;
