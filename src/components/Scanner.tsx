import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  paused?: boolean;
}

export const Scanner = ({ onScan, paused }: ScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 for QR, though html5-qrcode detects both by default
        },
        /* verbose= */ false
      );
    }

    if (!paused) {
      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // Silence errors during scanning
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => console.error('Failed to clear scanner', error));
      }
    };
  }, [onScan, paused]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border-2 border-indigo-100 bg-white shadow-lg">
      <div id="reader" className="w-full"></div>
      <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
        Align QR code or Barcode within the frame
      </div>
    </div>
  );
};
