import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TranscriptViewer from '../components/transcript/TranscriptViewer';
import MistakesPanel from '../components/transcript/MistakesPanel';
import SuggestionsPanel from '../components/transcript/SuggestionsPanel';
import ScoreCardsRow from '../components/analytics/ScoreCardsRow';
import RiskIndicator from '../components/analytics/RiskIndicator';
import { useConversationStore } from '../store/useConversationStore';
import * as conversationsApi from '../services/conversationsApi';

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { 
    messages, scores, mistakes, suggestions, risk, 
    setConversation, isAnalyzing, setAnalyzing 
  } = useConversationStore();

  useEffect(() => {
    if (!conversationId) return;

    let pollInterval: number;

    const loadData = async () => {
      try {
        const conv = await conversationsApi.fetchConversation(conversationId);
        
        if (conv.status === 'analyzed') {
          const data = await conversationsApi.fetchConversationReport(conversationId);
          console.log('[ConversationPage] Report loaded:', data);
          console.log('[ConversationPage] Suggestions:', data.suggestions);
          console.log('[ConversationPage] Mistakes:', data.mistakes);
          setConversation(conversationId, data);
          setAnalyzing(false);
        } else if (conv.status === 'failed') {
          console.error('Analysis failed');
          setAnalyzing(false);
        } else {
          // Status is 'uploaded', 'processing', 'transcribed', etc. - keep polling
          setAnalyzing(true);
          pollInterval = window.setTimeout(loadData, 3000);
        }
      } catch (err) {
        console.error('Error fetching conversation', err);
        // Retry after delay
        pollInterval = window.setTimeout(loadData, 5000);
      }
    };

    loadData();

    return () => {
      if (pollInterval) clearTimeout(pollInterval);
    };
  }, [conversationId, setConversation, setAnalyzing]);

  if (isAnalyzing || !scores) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Analyzing Conversation...</h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
            Our AI is currently evaluating the call quality and extract insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Analysis
          </h1>
        </div>
        {scores && <RiskIndicator risk={risk} />}
      </div>

      {scores && <ScoreCardsRow scores={scores} />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <TranscriptViewer messages={messages} />
        <div className="space-y-4">
          <MistakesPanel mistakes={mistakes} />
          <SuggestionsPanel suggestions={suggestions} />
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;