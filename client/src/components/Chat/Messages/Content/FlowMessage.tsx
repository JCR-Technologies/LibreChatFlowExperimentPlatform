import React from 'react';
import { cn } from '~/utils';

interface FlowMessageProps {
  content: string;
  isCreatedByUser: boolean;
}

const FlowMessage: React.FC<FlowMessageProps> = ({ content, isCreatedByUser }) => {
  // Parse the content as JSON (we know it's valid from the check in Part.tsx)
  let flowData: { message: string; options: string[] };
  
  try {
    const parsed = JSON.parse(content);
    flowData = {
      message: parsed.message,
      options: parsed.options.filter((opt: any) => typeof opt === 'string')
    };
  } catch (error) {
    // If direct JSON parsing fails, try to find JSON within the content
    const jsonMatch = content.match(/\{[\s\S]*"message"[\s\S]*"options"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      flowData = {
        message: parsed.message,
        options: parsed.options.filter((opt: any) => typeof opt === 'string')
      };
    } else {
      // This shouldn't happen since we check validity beforehand, but fallback
      return null;
    }
  }

  return (
    <div className="flow-message-container">
      <div className={cn(
        'flow-message-text p-4 rounded-lg border',
        isCreatedByUser 
          ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-100'
          : 'bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'
      )}>
        <div className="font-medium text-sm mb-2">Flow Architect AI</div>
        <div className="text-base">{flowData.message}</div>
      </div>
    </div>
  );
};

export default FlowMessage;
