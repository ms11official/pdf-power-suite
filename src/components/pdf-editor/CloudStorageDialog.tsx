import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, HardDrive, Upload, Download, Folder, File, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CloudFile {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified?: string;
}

interface CloudStorageDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "save" | "load";
  onFileLoad?: (url: string, name: string) => void;
  currentFileName?: string | null;
}

const mockGoogleDriveFiles: CloudFile[] = [
  { id: "1", name: "Documents", type: "folder" },
  { id: "2", name: "Work Files", type: "folder" },
  { id: "3", name: "report-2024.pdf", type: "file", size: "2.4 MB", modified: "Dec 10, 2024" },
  { id: "4", name: "invoice.pdf", type: "file", size: "156 KB", modified: "Dec 8, 2024" },
  { id: "5", name: "presentation.pdf", type: "file", size: "5.1 MB", modified: "Dec 5, 2024" },
];

const mockDropboxFiles: CloudFile[] = [
  { id: "1", name: "Personal", type: "folder" },
  { id: "2", name: "Shared", type: "folder" },
  { id: "3", name: "contract.pdf", type: "file", size: "890 KB", modified: "Dec 9, 2024" },
  { id: "4", name: "resume.pdf", type: "file", size: "245 KB", modified: "Dec 7, 2024" },
];

const mockOneDriveFiles: CloudFile[] = [
  { id: "1", name: "OneDrive Documents", type: "folder" },
  { id: "2", name: "meeting-notes.pdf", type: "file", size: "1.2 MB", modified: "Dec 11, 2024" },
  { id: "3", name: "budget.pdf", type: "file", size: "420 KB", modified: "Dec 6, 2024" },
];

type CloudProvider = "google-drive" | "dropbox" | "onedrive" | null;

export function CloudStorageDialog({ 
  open, 
  onClose, 
  mode, 
  onFileLoad,
  currentFileName 
}: CloudStorageDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(null);
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [saveName, setSaveName] = useState(currentFileName || "document.pdf");
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const getFilesForProvider = (provider: CloudProvider): CloudFile[] => {
    switch (provider) {
      case "google-drive": return mockGoogleDriveFiles;
      case "dropbox": return mockDropboxFiles;
      case "onedrive": return mockOneDriveFiles;
      default: return [];
    }
  };

  const handleConnect = (provider: CloudProvider) => {
    if (!provider) return;
    
    toast.loading(`Connecting to ${getProviderName(provider)}...`);
    
    setTimeout(() => {
      toast.dismiss();
      setIsConnected(prev => ({ ...prev, [provider]: true }));
      toast.success(`Connected to ${getProviderName(provider)}`);
    }, 1500);
  };

  const handleSelectProvider = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    setSelectedFile(null);
    setCurrentPath([]);
    
    if (provider && !isConnected[provider]) {
      handleConnect(provider);
    }
  };

  const getProviderName = (provider: CloudProvider): string => {
    switch (provider) {
      case "google-drive": return "Google Drive";
      case "dropbox": return "Dropbox";
      case "onedrive": return "OneDrive";
      default: return "";
    }
  };

  const handleFileClick = (file: CloudFile) => {
    if (file.type === "folder") {
      setCurrentPath(prev => [...prev, file.name]);
    } else {
      setSelectedFile(file.id);
    }
  };

  const handleGoBack = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (!selectedProvider) return;
    
    toast.loading(`Saving to ${getProviderName(selectedProvider)}...`);
    
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Saved "${saveName}" to ${getProviderName(selectedProvider)}`);
      onClose();
    }, 2000);
  };

  const handleLoad = () => {
    if (!selectedProvider || !selectedFile) return;
    
    const files = getFilesForProvider(selectedProvider);
    const file = files.find(f => f.id === selectedFile);
    
    if (file) {
      toast.loading(`Loading "${file.name}" from ${getProviderName(selectedProvider)}...`);
      
      setTimeout(() => {
        toast.dismiss();
        toast.success(`Loaded "${file.name}"`);
        onFileLoad?.("", file.name);
        onClose();
      }, 2000);
    }
  };

  const files = getFilesForProvider(selectedProvider);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            {mode === "save" ? "Save to Cloud" : "Load from Cloud"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSelectProvider("google-drive")}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedProvider === "google-drive" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">Google Drive</span>
              {isConnected["google-drive"] && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </button>

            <button
              onClick={() => handleSelectProvider("dropbox")}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedProvider === "dropbox" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">Dropbox</span>
              {isConnected["dropbox"] && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </button>

            <button
              onClick={() => handleSelectProvider("onedrive")}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedProvider === "onedrive" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">OneDrive</span>
              {isConnected["onedrive"] && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </button>
          </div>

          {/* File Browser */}
          {selectedProvider && isConnected[selectedProvider] && (
            <div className="border rounded-lg overflow-hidden">
              {/* Breadcrumb */}
              <div className="bg-accent/50 px-3 py-2 flex items-center gap-2 text-sm">
                <button 
                  onClick={() => setCurrentPath([])}
                  className="text-primary hover:underline"
                >
                  {getProviderName(selectedProvider)}
                </button>
                {currentPath.map((path, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="text-muted-foreground">/</span>
                    <button 
                      onClick={() => setCurrentPath(prev => prev.slice(0, idx + 1))}
                      className="text-primary hover:underline"
                    >
                      {path}
                    </button>
                  </span>
                ))}
              </div>

              {/* File List */}
              <div className="max-h-[250px] overflow-y-auto">
                {currentPath.length > 0 && (
                  <button
                    onClick={handleGoBack}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 text-left border-b"
                  >
                    <Folder className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">..</span>
                  </button>
                )}
                
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-accent/50 text-left border-b last:border-b-0 ${
                      selectedFile === file.id ? "bg-primary/10" : ""
                    }`}
                  >
                    {file.type === "folder" ? (
                      <Folder className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <File className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      {file.size && (
                        <p className="text-xs text-muted-foreground">
                          {file.size} • {file.modified}
                        </p>
                      )}
                    </div>
                    {selectedFile === file.id && file.type === "file" && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Name Input */}
          {mode === "save" && selectedProvider && isConnected[selectedProvider] && (
            <div className="space-y-2">
              <label className="text-sm font-medium">File Name</label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {mode === "save" ? (
              <Button 
                onClick={handleSave}
                disabled={!selectedProvider || !isConnected[selectedProvider]}
              >
                <Upload className="w-4 h-4 mr-2" />
                Save
              </Button>
            ) : (
              <Button 
                onClick={handleLoad}
                disabled={!selectedFile}
              >
                <Download className="w-4 h-4 mr-2" />
                Load
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
