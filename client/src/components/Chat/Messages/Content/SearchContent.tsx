import { Suspense, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { DelayedRender } from '@librechat/client';
import { ContentTypes } from 'librechat-data-provider';
import type {
  Agents,
  TMessage,
  TAttachment,
  SearchResultData,
  TMessageContentParts,
} from 'librechat-data-provider';
import { UnfinishedMessage } from './MessageContent';
import Sources from '~/components/Web/Sources';
import { cn, mapAttachments } from '~/utils';
import { SearchContext } from '~/Providers';
import MarkdownLite from './MarkdownLite';
import store from '~/store';
import Part from './Part';

// Helper function to check if content contains Flow options (simplified format)
const hasFlowOptions = (content: string): boolean => {
  // Look for the pattern: text followed by options array
  // Example: "Question text\n\n[\"Option 1\", \"Option 2\", \"Option 3\"]"
  const optionsMatch = content.match(/\[[\s\S]*"[\w\s\/]+"[\s\S]*\]/);
  return optionsMatch !== null;
};

// Helper function to extract the full message text (without options array)
const extractFlowMessageText = (content: string): string => {
  // Cut off at ==== marker
  const optionsMarker = '====';
  const markerIndex = content.indexOf(optionsMarker);
  if (markerIndex > 0) {
    return content.substring(0, markerIndex).trim();
  }
  
  // Fallback: cut off at first "{" if marker not found
  // const jsonStartIndex = content.indexOf('{');
  // if (jsonStartIndex > 0) {
  //   return content.substring(0, jsonStartIndex).trim();
  // }
  
  return content;
};

// Helper function to cut off text at the options marker to prevent showing any JSON structure
const cutOffAtJsonStart = (text: string): string => {
  // First try to find the ==== marker
  const optionsMarker = '====';
  const markerIndex = text.indexOf(optionsMarker);
  if (markerIndex > 0) {
    return text.substring(0, markerIndex).trim();
  }
  
  // Fallback: find the position where the JSON starts (first "{")
  const jsonStartIndex = text.indexOf('{');
  if (jsonStartIndex > 0) {
    return text.substring(0, jsonStartIndex).trim();
  }
  
  return text;
};

const SearchContent = ({
  message,
  attachments,
  searchResults,
}: {
  message: TMessage;
  attachments?: TAttachment[];
  searchResults?: { [key: string]: SearchResultData };
}) => {
  const enableUserMsgMarkdown = useRecoilValue(store.enableUserMsgMarkdown);
  const { messageId } = message;

  const attachmentMap = useMemo(() => mapAttachments(attachments ?? []), [attachments]);

  if (Array.isArray(message.content) && message.content.length > 0) {
    return (
      <SearchContext.Provider value={{ searchResults }}>
        <Sources />
        {message.content
          .filter((part: TMessageContentParts | undefined) => part)
          .map((part: TMessageContentParts | undefined, idx: number) => {
            if (!part) {
              return null;
            }

            const toolCallId =
              (part?.[ContentTypes.TOOL_CALL] as Agents.ToolCall | undefined)?.id ?? '';
            const attachments = attachmentMap[toolCallId];
            return (
              <Part
                key={`display-${messageId}-${idx}`}
                showCursor={false}
                isSubmitting={false}
                isCreatedByUser={message.isCreatedByUser}
                attachments={attachments}
                part={part}
              />
            );
          })}
        {message.unfinished === true && (
          <Suspense>
            <DelayedRender delay={250}>
              <UnfinishedMessage message={message} key={`unfinished-${messageId}`} />
            </DelayedRender>
          </Suspense>
        )}
      </SearchContext.Provider>
    );
  }

  // Process Flow messages to remove JSON structure
  let processedText = message.text || '';
  if (hasFlowOptions(processedText)) {
    processedText = extractFlowMessageText(processedText);
  } else if (processedText.includes('{')) {
    processedText = cutOffAtJsonStart(processedText);
  }

  return (
    <div
      className={cn(
        'markdown prose dark:prose-invert light w-full break-words',
        message.isCreatedByUser && !enableUserMsgMarkdown && 'whitespace-pre-wrap',
        message.isCreatedByUser ? 'dark:text-gray-20' : 'dark:text-gray-70',
      )}
      dir="auto"
    >
      <MarkdownLite content={processedText} />
    </div>
  );
};

export default SearchContent;
