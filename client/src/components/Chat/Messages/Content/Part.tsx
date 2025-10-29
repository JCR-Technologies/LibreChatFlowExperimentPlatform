import {
  Tools,
  ContentTypes,
  ToolCallTypes,
  imageGenTools,
  isImageVisionTool,
} from 'librechat-data-provider';
import { memo } from 'react';
import type { TMessageContentParts, TAttachment } from 'librechat-data-provider';
import { OpenAIImageGen, EmptyText, Reasoning, ExecuteCode, AgentUpdate, Text } from './Parts';
import { ErrorMessage } from './MessageContent';
import RetrievalCall from './RetrievalCall';
import CodeAnalyze from './CodeAnalyze';
import Container from './Container';
import WebSearch from './WebSearch';
import ToolCall from './ToolCall';
import ImageGen from './ImageGen';
import Image from './Image';

// Helper function to check if content contains Flow options (simplified format)
const hasFlowOptions = (content: string): boolean => {
  // Look for the pattern: text followed by options array
  // Example: "Question text\n\n[\"Option 1\", \"Option 2\", \"Option 3\"]"
  const optionsMatch = content.match(/\[[\s\S]*"[\w\s\/]+"[\s\S]*\]/);
  return optionsMatch !== null;
};

// Helper function to check if content is starting to show options during streaming
const isStartingFlowOptions = (content: string): boolean => {
  // Check if the content contains the beginning of an options array
  return content.includes('{') && content.includes('"');
};

// Helper function to extract options from simplified Flow format
const extractFlowOptions = (content: string): string[] => {
  try {
    // Find the options array in the content
    const optionsMatch = content.match(/\[[\s\S]*"[\w\s\/]+"[\s\S]*\]/);
    if (optionsMatch) {
      const optionsString = optionsMatch[0];
      const parsed = JSON.parse(optionsString);
      if (Array.isArray(parsed)) {
        return parsed.filter(opt => typeof opt === 'string');
      }
    }
  } catch (error) {
    // If parsing fails, try to extract options manually
    const optionMatches = content.match(/"([^"]+)"/g);
    if (optionMatches) {
      return optionMatches.map(match => match.slice(1, -1)); // Remove quotes
    }
  }
  
  return [];
};

// Helper function to extract the full message text (without options array)
const extractFlowMessageText = (content: string): string => {
  // Cut off at ==== marker, but only if it's followed by options JSON
  const optionsMarker = '====';
  const markerIndex = content.indexOf(optionsMarker);
  if (markerIndex > 0) {
    // Check if the marker is followed by options JSON pattern
    const afterMarker = content.substring(markerIndex + optionsMarker.length).trim();
    if (afterMarker.startsWith('{') && afterMarker.includes('"options"')) {
      return content.substring(0, markerIndex).trim();
    }
  }
  
  return content;
};

// Helper function to cut off text at the start of options during streaming
const cutOffAtJsonStart = (content: string): string => {
  // First try to find the ==== marker
  const optionsMarker = '====';
  const markerIndex = content.indexOf(optionsMarker);
  if (markerIndex > 0) {
    // Check if the marker is followed by options JSON pattern
    const afterMarker = content.substring(markerIndex + optionsMarker.length).trim();
    if (afterMarker.startsWith('{') && afterMarker.includes('"options"')) {
      return content.substring(0, markerIndex).trim();
    }
  }
  
  // Fallback: find the position where the JSON starts (first "{")
  const jsonStartIndex = content.indexOf('{');
  if (jsonStartIndex > 0) {
    return content.substring(0, jsonStartIndex).trim();
  }
  
  return content;
};

type PartProps = {
  part?: TMessageContentParts;
  isLast?: boolean;
  isSubmitting: boolean;
  showCursor: boolean;
  isCreatedByUser: boolean;
  attachments?: TAttachment[];
};

const Part = memo(
  ({ part, isSubmitting, attachments, isLast, showCursor, isCreatedByUser }: PartProps) => {
    if (!part) {
      return null;
    }

    if (part.type === ContentTypes.ERROR) {
      return (
        <ErrorMessage
          text={
            part[ContentTypes.ERROR] ??
            (typeof part[ContentTypes.TEXT] === 'string'
              ? part[ContentTypes.TEXT]
              : part.text?.value) ??
            ''
          }
          className="my-2"
        />
      );
    } else if (part.type === ContentTypes.AGENT_UPDATE) {
      return (
        <>
          <AgentUpdate currentAgentId={part[ContentTypes.AGENT_UPDATE]?.agentId} />
          {isLast && showCursor && (
            <Container>
              <EmptyText />
            </Container>
          )}
        </>
      );
    } else if (part.type === ContentTypes.TEXT) {
      const text = typeof part.text === 'string' ? part.text : part.text.value;

      if (typeof text !== 'string') {
        return null;
      }
      if (part.tool_call_ids != null && !text) {
        return null;
      }
      
      // Handle Flow messages and regular messages with the same logic
      let displayText = text;
      
      // If this is a complete Flow message with options, extract the message text
      if (hasFlowOptions(text)) {
        displayText = extractFlowMessageText(text);
      }
      // If JSON is starting to appear during streaming, cut off the text
      else if (isStartingFlowOptions(text)) {
        displayText = cutOffAtJsonStart(text);
      }
      
      return (
        <Container>
          <Text text={displayText} isCreatedByUser={isCreatedByUser} showCursor={showCursor} />
        </Container>
      );
    } else if (part.type === ContentTypes.THINK) {
      const reasoning = typeof part.think === 'string' ? part.think : part.think.value;
      if (typeof reasoning !== 'string') {
        return null;
      }
      return <Reasoning reasoning={reasoning} />;
    } else if (part.type === ContentTypes.TOOL_CALL) {
      const toolCall = part[ContentTypes.TOOL_CALL];

      if (!toolCall) {
        return null;
      }

      const isToolCall =
        'args' in toolCall && (!toolCall.type || toolCall.type === ToolCallTypes.TOOL_CALL);
      if (isToolCall && toolCall.name === Tools.execute_code && toolCall.args) {
        return (
          <ExecuteCode
            args={typeof toolCall.args === 'string' ? toolCall.args : ''}
            output={toolCall.output ?? ''}
            initialProgress={toolCall.progress ?? 0.1}
            attachments={attachments}
          />
        );
      } else if (
        isToolCall &&
        (toolCall.name === 'image_gen_oai' || toolCall.name === 'image_edit_oai')
      ) {
        return (
          <OpenAIImageGen
            initialProgress={toolCall.progress ?? 0.1}
            isSubmitting={isSubmitting}
            toolName={toolCall.name}
            args={typeof toolCall.args === 'string' ? toolCall.args : ''}
            output={toolCall.output ?? ''}
            attachments={attachments}
          />
        );
      } else if (isToolCall && toolCall.name === Tools.web_search) {
        return (
          <WebSearch
            output={toolCall.output ?? ''}
            initialProgress={toolCall.progress ?? 0.1}
            isSubmitting={isSubmitting}
            attachments={attachments}
            isLast={isLast}
          />
        );
      } else if (isToolCall) {
        return (
          <ToolCall
            args={toolCall.args ?? ''}
            name={toolCall.name || ''}
            output={toolCall.output ?? ''}
            initialProgress={toolCall.progress ?? 0.1}
            isSubmitting={isSubmitting}
            attachments={attachments}
            auth={toolCall.auth}
            expires_at={toolCall.expires_at}
          />
        );
      } else if (toolCall.type === ToolCallTypes.CODE_INTERPRETER) {
        const code_interpreter = toolCall[ToolCallTypes.CODE_INTERPRETER];
        return (
          <CodeAnalyze
            initialProgress={toolCall.progress ?? 0.1}
            code={code_interpreter.input}
            outputs={code_interpreter.outputs ?? []}
          />
        );
      } else if (
        toolCall.type === ToolCallTypes.RETRIEVAL ||
        toolCall.type === ToolCallTypes.FILE_SEARCH
      ) {
        return (
          <RetrievalCall initialProgress={toolCall.progress ?? 0.1} isSubmitting={isSubmitting} />
        );
      } else if (
        toolCall.type === ToolCallTypes.FUNCTION &&
        ToolCallTypes.FUNCTION in toolCall &&
        imageGenTools.has(toolCall.function.name)
      ) {
        return (
          <ImageGen
            initialProgress={toolCall.progress ?? 0.1}
            args={toolCall.function.arguments as string}
          />
        );
      } else if (toolCall.type === ToolCallTypes.FUNCTION && ToolCallTypes.FUNCTION in toolCall) {
        if (isImageVisionTool(toolCall)) {
          if (isSubmitting && showCursor) {
            return (
              <Container>
                <Text text={''} isCreatedByUser={isCreatedByUser} showCursor={showCursor} />
              </Container>
            );
          }
          return null;
        }

        return (
          <ToolCall
            initialProgress={toolCall.progress ?? 0.1}
            isSubmitting={isSubmitting}
            args={toolCall.function.arguments as string}
            name={toolCall.function.name}
            output={toolCall.function.output}
          />
        );
      }
    } else if (part.type === ContentTypes.IMAGE_FILE) {
      const imageFile = part[ContentTypes.IMAGE_FILE];
      const height = imageFile.height ?? 1920;
      const width = imageFile.width ?? 1080;
      return (
        <Image
          imagePath={imageFile.filepath}
          height={height}
          width={width}
          altText={imageFile.filename ?? 'Uploaded Image'}
          placeholderDimensions={{
            height: height + 'px',
            width: width + 'px',
          }}
        />
      );
    }

    return null;
  },
);

export default Part;
