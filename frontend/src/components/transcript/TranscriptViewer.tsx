import React, { useEffect } from 'react';
import type { TranscriptMessage } from '../../utils/types';
import MessageBubble from './MessageBubble';
import { Card } from '../ui/Card';

interface TranscriptViewerProps {
  messages: TranscriptMessage[];
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ messages }) => {
  useEffect(() => {
    console.log(`[TranscriptViewer] Rendered with ${messages.length} messages`);
    if (messages.length > 0) {
      console.log('First message:', messages[0]);
      console.log('Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[420px]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Transcript</h2>
          <p className="text-[11px] text-muted-foreground">
            Customer on the left, agent on the right.
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
    </Card>
  );
};

export default TranscriptViewer;