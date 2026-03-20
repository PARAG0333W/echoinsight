import React from 'react';
import type { TranscriptMessage } from '../../utils/types';

interface MessageBubbleProps {
  message: TranscriptMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAgent = message.speaker === 'agent';

  return (
    <div
      className={[
        'flex gap-3 text-sm',
        isAgent ? 'justify-end' : 'justify-start',
      ].join(' ')}
    >
      {!isAgent && (
        <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-700">
          C
        </div>
      )}
      <div
        className={[
          'max-w-[70%] rounded-2xl px-3 py-2',
          'text-[13px] leading-relaxed',
          isAgent
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-white border border-border rounded-bl-none',
        ].join(' ')}
      >
        <p>{message.text}</p>
        {message.timestamp && (
          <p className="mt-1 text-[10px] opacity-70">
            {message.timestamp}
          </p>
        )}
      </div>
      {isAgent && (
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
          A
        </div>
      )}
    </div>
  );
};

export default MessageBubble;