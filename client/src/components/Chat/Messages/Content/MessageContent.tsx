import { memo, Suspense, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { DelayedRender } from '@librechat/client';
import type { TMessage } from 'librechat-data-provider';
import type { TMessageContentProps, TDisplayProps } from '~/common';
import Error from '~/components/Messages/Content/Error';
import Thinking from '~/components/Artifacts/Thinking';
import { useChatContext } from '~/Providers';
import MarkdownLite from './MarkdownLite';
import EditMessage from './EditMessage';
import { useLocalize } from '~/hooks';
import Container from './Container';
import Markdown from './Markdown';
import { cn } from '~/utils';
import store from '~/store';

// Helper function to check if content contains Flow options (simplified format)
const hasFlowOptions = (content: string): boolean => {
  // Look for the pattern: text followed by options array
  // Example: "Question text\n\n[\"Option 1\", \"Option 2\", \"Option 3\"]"
  const optionsMatch = content.match(/\[[\s\S]*"[\w\s\/]+"[\s\S]*\]/);
  return optionsMatch !== null;
};

// Helper function to extract the full message text (without options array)
const extractFlowMessageText = (content: string): string => {
  // Cut off at === marker
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

export const ErrorMessage = ({
  text,
  message,
  className = '',
}: Pick<TDisplayProps, 'text' | 'className'> & {
  message?: TMessage;
}) => {
  const localize = useLocalize();
  if (text === 'Error connecting to server, try refreshing the page.') {
    console.log('error message', message);
    return (
      <Suspense
        fallback={
          <div className="text-message mb-[0.625rem] flex min-h-[20px] flex-col items-start gap-3 overflow-visible">
            <div className="markdown prose dark:prose-invert light w-full break-words dark:text-gray-100">
              <div className="absolute">
                <p className="submitting relative">
                  <span className="result-thinking" />
                </p>
              </div>
            </div>
          </div>
        }
      >
        <DelayedRender delay={5500}>
          <Container message={message}>
            <div
              className={cn(
                'rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-gray-600 dark:text-gray-200',
                className,
              )}
            >
              {localize('com_ui_error_connection')}
            </div>
          </Container>
        </DelayedRender>
      </Suspense>
    );
  }
  return (
    <Container message={message}>
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          'rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-gray-600 dark:text-gray-200',
          className,
        )}
      >
        <Error text={text} />
      </div>
    </Container>
  );
};

const DisplayMessage = ({ text, isCreatedByUser, message, showCursor }: TDisplayProps) => {
  const { isSubmitting, latestMessage } = useChatContext();
  const enableUserMsgMarkdown = useRecoilValue(store.enableUserMsgMarkdown);
  const showCursorState = useMemo(
    () => showCursor === true && isSubmitting,
    [showCursor, isSubmitting],
  );
  const isLatestMessage = useMemo(
    () => message.messageId === latestMessage?.messageId,
    [message.messageId, latestMessage?.messageId],
  );

  // Process Flow messages to remove JSON structure
  let processedText = text;
  
  if (hasFlowOptions(text)) {
    processedText = extractFlowMessageText(text);
  } else if (text.includes('{')) {
    processedText = cutOffAtJsonStart(text);
  }

  let content: React.ReactElement;
  if (!isCreatedByUser) {
    content = <Markdown content={processedText} isLatestMessage={isLatestMessage} />;
  } else if (enableUserMsgMarkdown) {
    content = <MarkdownLite content={processedText} />;
  } else {
    content = <>{processedText}</>;
  }

  return (
    <Container message={message}>
      <div
        className={cn(
          isSubmitting ? 'submitting' : '',
          showCursorState && !!processedText.length ? 'result-streaming' : '',
          'markdown prose message-content dark:prose-invert light w-full break-words',
          isCreatedByUser && !enableUserMsgMarkdown && 'whitespace-pre-wrap',
          isCreatedByUser ? 'dark:text-gray-20' : 'dark:text-gray-100',
        )}
      >
        {content}
      </div>
    </Container>
  );
};

// Unfinished Message Component
export const UnfinishedMessage = ({ message }: { message: TMessage }) => (
  <ErrorMessage
    message={message}
    text="The response is incomplete; it's either still processing, was cancelled, or censored. Refresh or try a different prompt."
  />
);

const MessageContent = ({
  text,
  edit,
  error,
  unfinished,
  isSubmitting,
  isLast,
  ...props
}: TMessageContentProps) => {
  const { message } = props;
  const { messageId } = message;

  const { thinkingContent, regularContent } = useMemo(() => {
    const thinkingMatch = text.match(/:::thinking([\s\S]*?):::/);
    return {
      thinkingContent: thinkingMatch ? thinkingMatch[1].trim() : '',
      regularContent: thinkingMatch ? text.replace(/:::thinking[\s\S]*?:::/, '').trim() : text,
    };
  }, [text]);

  const showRegularCursor = useMemo(() => isLast && isSubmitting, [isLast, isSubmitting]);

  const unfinishedMessage = useMemo(
    () =>
      !isSubmitting && unfinished ? (
        <Suspense>
          <DelayedRender delay={250}>
            <UnfinishedMessage message={message} />
          </DelayedRender>
        </Suspense>
      ) : null,
    [isSubmitting, unfinished, message],
  );

  if (error) {
    return <ErrorMessage message={props.message} text={text} />;
  } else if (edit) {
    return <EditMessage text={text} isSubmitting={isSubmitting} {...props} />;
  }

  return (
    <>
      {thinkingContent.length > 0 && (
        <Thinking key={`thinking-${messageId}`}>{thinkingContent}</Thinking>
      )}
      <DisplayMessage
        key={`display-${messageId}`}
        showCursor={showRegularCursor}
        text={regularContent}
        {...props}
      />
      {unfinishedMessage}
    </>
  );
};

export default memo(MessageContent);
