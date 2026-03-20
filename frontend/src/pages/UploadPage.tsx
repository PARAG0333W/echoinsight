import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';
import FileUploadCard from '../components/upload/FileUploadCard';
import * as conversationsApi from '../services/conversationsApi';
import { uploadConversation } from '../services/conversationsApi';
import { Card } from '../components/ui/Card';
import { useConversationStore } from '../store/useConversationStore';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    agentName, setAgentName, 
    isUploading, setUploading,
    isAnalyzing, setAnalyzing,
    uploadProgress, setUploadProgress,
    addToHistory,
    reset
  } = useConversationStore();

  const [error, setError] = useState<string | null>(null);

  const handleUploaded = (conversationId: string) => {
    // Analysis is already started by startAnalysis in handleUpload
    navigate(`/app/conversations/${conversationId}`);
  };

  const handleUpload = async (
    file: File,
    onProgress: (p: number) => void,
  ): Promise<string> => {
    if (!agentName.trim()) {
      setError('Please enter the agent name before uploading.');
      throw new Error('Agent name required');
    }
    
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    reset(); // Clear previous results but keep history

    try {
      console.log(`[Flow] Step 1: Uploading file...`);
      const id = await uploadConversation(file, agentName, (p) => {
        setUploadProgress(p);
        onProgress(p);
      });

      console.log(`[Flow] Step 2: Upload complete. Step 3: Triggering analysis...`);
      setUploading(false);
      setAnalyzing(true);
      
      await conversationsApi.startAnalysis(id);
      
      console.log(`[Flow] Step 4: Analysis triggered. Step 5: Updating UI (Navigating)...`);
      addToHistory(id);
      return id;
    } catch (err) {
      setUploading(false);
      setAnalyzing(false);
      setError('Upload or analysis failed. Please try again.');
      throw err;
    }
  };

  return (
    <div className="max-w-[800px] mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Conversation</h1>
        <p className="text-slate-500 font-medium">
          Upload a conversation file for AI-powered quality analysis
        </p>
      </div>

      {/* ── Agent Name Input ── */}
      <Card className="p-6 border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <User className="h-3.5 w-3.5" />
            Agent Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={agentName}
              onChange={(e) => {
                setAgentName(e.target.value);
                if (e.target.value.trim()) setError(null);
              }}
              placeholder="e.g. Sarah Johnson"
              disabled={isUploading || isAnalyzing}
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-5 pr-5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all ${
                error ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 focus:border-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
          {error && (
            <p className="text-[11px] font-bold text-rose-500 px-1 italic">{error}</p>
          )}
          <p className="text-[11px] text-slate-400 font-medium px-1">
            This will be associated with the analysis report and displayed in history.
          </p>
        </div>
      </Card>

      {/* ── Status Overlay ── */}
      {isUploading || isAnalyzing ? (
        <div className="rounded-[2rem] border-2 border-dashed border-indigo-200 bg-white py-24 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
          <div className="p-6 rounded-[2rem] bg-indigo-50 relative">
            <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                {Math.round(uploadProgress)}%
              </div>
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {isUploading ? 'Uploading file...' : 'Analyzing conversation...'}
            </p>
            <p className="text-[13px] font-medium text-slate-400">
              {isUploading 
                ? 'Sending your file to our secure storage.' 
                : 'Our AI is evaluating tone, empathy, and professionalism.'}
            </p>
            {isUploading && (
               <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 mx-auto">
                 <div 
                   className="h-full bg-indigo-500 transition-all duration-300" 
                   style={{ width: `${uploadProgress}%` }}
                 />
               </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Upload Dropzone ── */
        <div className={!agentName.trim() ? 'opacity-60 pointer-events-none' : ''}>
          <FileUploadCard
            onFileUploaded={handleUploaded}
            onUpload={handleUpload}
          />
        </div>
      )}

      {/* Hint when agent name is empty */}
      {!agentName.trim() && !isUploading && !isAnalyzing && (
        <p className="text-center text-[12px] font-bold text-slate-400 uppercase tracking-widest -mt-4">
          ↑ Enter agent name to enable upload
        </p>
      )}

      {/* Tips */}
      <Card className="p-8 border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Tips for best results</h3>
        <ul className="space-y-4 text-[13px] text-slate-600 font-medium leading-relaxed">
          <li className="flex items-start gap-4">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
            <p>
              <strong className="text-slate-900">Text files:</strong> Use format like{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 italic">Customer: message</code> and{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 italic">Agent: message</code>, one per line
            </p>
          </li>
          <li className="flex items-start gap-4">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
            <p>
              <strong className="text-slate-900">Audio files:</strong> Clear recordings with minimal background noise work best
            </p>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default UploadPage;