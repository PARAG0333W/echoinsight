import { useCallback, useState, useRef } from 'react';
import { CloudUpload, FileText, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';

export interface FileUploadCardProps {
  onFileUploaded: (conversationId: string) => void;
  onUpload: (file: File, onProgress: (p: number) => void) => Promise<string>;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  onFileUploaded,
  onUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      setFileName(file.name);
      setUploading(true);
      try {
        const conversationId = await onUpload(file, setProgress);
        onFileUploaded(conversationId);
      } finally {
        setUploading(false);
      }
    },
    [onFileUploaded, onUpload],
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <Card className="p-0 overflow-hidden border-none shadow-none bg-transparent">
      <div
        onDragEnter={() => setDragActive(true)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={[
          'group relative flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-dashed py-24 px-8 text-center transition-all duration-300',
          dragActive 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
            : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/50',
          uploading ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        <div className="p-6 rounded-[2rem] bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-xl group-hover:shadow-indigo-500/10 transition-all duration-500">
          <CloudUpload className="h-16 w-16" />
        </div>
        
        <div className="space-y-3">
          <p className="text-xl font-bold text-slate-900 tracking-tight">
            Drag & drop your conversation file
          </p>
          <p className="text-[13px] font-medium text-slate-400">
            Supports MP3, WAV, TXT, DOCX, PDF • Text files work best
          </p>
        </div>

        <input
          type="file"
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,audio/*"
          onChange={onChange}
          disabled={uploading}
          ref={fileInputRef}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
        >
          Browse Files
        </button>

        {fileName && !uploading && (
          <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 border border-slate-200/50">
            <FileText className="h-3.5 w-3.5 text-indigo-500" />
            <span className="truncate max-w-[200px]">{fileName}</span>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
             <div className="flex items-center gap-2">
               <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
               <span>Processing file...</span>
             </div>
             <span className="text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default FileUploadCard;