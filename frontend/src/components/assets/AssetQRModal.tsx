import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useGenerateQR } from '@/hooks/useAssets';
import { useToast } from '@/components/ui/useToast';
import { Download, Printer } from 'lucide-react';

interface AssetQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  assetName: string;
  assetTag: string;
}

export const AssetQRModal = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  assetTag,
}: AssetQRModalProps) => {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const generateQR = useGenerateQR();

  const handleGenerate = async () => {
    try {
      const response = await generateQR.mutateAsync(assetId);
      setQrToken(response.qr_token);
      showToast('success', 'QR code generated successfully');
    } catch (error) {
      showToast('error', 'Failed to generate QR code');
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${assetTag}-qr.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgString = new XMLSerializer().serializeToString(svg);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${assetTag}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 2rem;
            }
            h2 { margin: 0 0 0.5rem 0; font-size: 1.25rem; }
            p { margin: 0.25rem 0; color: #666; font-size: 0.875rem; }
            svg { margin: 1rem 0; }
            @media print {
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${assetName}</h2>
            <p>Asset Tag: ${assetTag}</p>
            ${svgString}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleClose = () => {
    setQrToken(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate QR Code" size="sm">
      <div className="space-y-4">
        <div className="text-sm text-text-muted">
          Generate a QR code for this asset. The QR code can be scanned to quickly access asset
          details. This token can only be generated once.
        </div>

        {!qrToken ? (
          <Button onClick={handleGenerate} disabled={generateQR.isPending} className="w-full">
            {generateQR.isPending ? 'Generating...' : 'Generate QR Code'}
          </Button>
        ) : (
          <>
            <div ref={qrRef} className="flex flex-col items-center gap-4 p-6 bg-surface rounded">
              <div className="text-center">
                <div className="text-sm font-medium text-text">{assetName}</div>
                <div className="text-xs text-text-muted">{assetTag}</div>
              </div>
              <QRCodeSVG value={qrToken} size={256} level="H" includeMargin />
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleDownload} className="flex-1">
                <Download size={16} strokeWidth={1.5} />
                Download
              </Button>
              <Button variant="secondary" onClick={handlePrint} className="flex-1">
                <Printer size={16} strokeWidth={1.5} />
                Print
              </Button>
            </div>

            <div className="text-xs text-text-muted text-center">
              Save or print this QR code now. It cannot be regenerated.
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
