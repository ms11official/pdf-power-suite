import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScanText, Copy, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OCRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  currentPage: number;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
  { value: 'hi', label: 'Hindi' },
];

export function OCRDialog({ open, onOpenChange, pdfUrl, currentPage }: OCRDialogProps) {
  const [language, setLanguage] = useState('en');
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const renderPageToImage = async (): Promise<string> => {
    if (!pdfUrl) throw new Error('No PDF loaded');

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const page = await pdf.getPage(currentPage);

    const scale = 2; // Higher resolution for better OCR
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create canvas context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    // Convert to base64 without the data URL prefix
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.split(',')[1];
  };

  const handleExtract = async () => {
    if (!pdfUrl) {
      toast.error('Please load a PDF first');
      return;
    }

    setIsExtracting(true);
    setExtractedText('');

    try {
      toast.loading('Rendering page for OCR...');
      const imageBase64 = await renderPageToImage();

      toast.dismiss();
      toast.loading('Extracting text with AI OCR...');

      const { data, error } = await supabase.functions.invoke('ocr-pdf', {
        body: { imageBase64, language }
      });

      toast.dismiss();

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setExtractedText(data.text);
      toast.success('Text extracted successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('OCR error:', error);
      toast.error(error instanceof Error ? error.message : 'OCR extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success('Text copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-page-${currentPage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Text file downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanText className="w-5 h-5 text-primary" />
            OCR - Extract Text from PDF
          </DialogTitle>
          <DialogDescription>
            Extract text from scanned PDF pages using AI-powered OCR (supports 200+ languages)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6">
              <Button onClick={handleExtract} disabled={isExtracting || !pdfUrl}>
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <ScanText className="w-4 h-4 mr-2" />
                    Extract Page {currentPage}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Extracted Text</label>
              {extractedText && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted text will appear here..."
              className="flex-1 min-h-[300px] resize-none font-mono text-sm"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
