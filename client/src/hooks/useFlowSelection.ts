import { useState, useEffect, useCallback } from 'react';
import { useChatContext } from '~/Providers';
import { useGetMessagesByConvoId } from '~/data-provider';


interface FlowSelectionState {
  options: string[];
  selectedOptions: string[];
  isVisible: boolean;
  message: string;
}

export const useFlowSelection = (index: number) => {
  const [selectionState, setSelectionState] = useState<FlowSelectionState>({
    options: [],
    selectedOptions: [],
    isVisible: false,
    message: '',
  });

  const { conversation } = useChatContext();
  
  // Get the actual message data using the same approach as ChatView
  const { data: messagesTree = null } = useGetMessagesByConvoId(conversation?.conversationId ?? '', {
    enabled: !!conversation?.conversationId,
  });

  // Parse simplified Flow format from Flow Architect AI messages
  const parseFlowMessage = useCallback((message: string): { message: string; options: string[] } | null => {
    // Check if the message contains options array
    const optionsMatch = message.match(/\[[\s\S]*"[\w\s\/]+"[\s\S]*\]/);
    if (!optionsMatch) {
      return null;
    }

    try {
      // Extract options from the array
      const optionsString = optionsMatch[0];
      const parsed = JSON.parse(optionsString);
      if (Array.isArray(parsed)) {
        const options = parsed.filter((opt: any) => typeof opt === 'string');
        
        // Extract the message text (cut off at ==== marker, but only if followed by options JSON)
        let messageText = message;
        const optionsMarker = '====';
        const markerIndex = message.indexOf(optionsMarker);
        if (markerIndex > 0) {
          // Check if the marker is followed by options JSON pattern
          const afterMarker = message.substring(markerIndex + optionsMarker.length).trim();
          if (afterMarker.startsWith('{') && afterMarker.includes('"options"')) {
            messageText = message.substring(0, markerIndex).trim();
          }
        }
        
        return {
          message: messageText,
          options: options
        };
      }
    } catch (error) {

      return {
        message: message,
        options: []
      };
    }
    
    return null;
  }, []);

  // Check if the last message is from Flow Architect AI and contains options
  const checkForFlowOptions = useCallback(() => {
    console.log("MessagesTree:", messagesTree);
    console.log("MessagesTree length:", messagesTree?.length);
    
    if (!messagesTree || messagesTree.length === 0) {
      console.log("No messages found in messagesTree");
      setSelectionState(prev => ({ ...prev, isVisible: false, options: [], selectedOptions: [], message: '' }));
      return;
    }

    // Get the last message from the messagesTree
    const lastMessage = messagesTree[messagesTree.length - 1];
    console.log("Last message:", lastMessage);
    console.log("Last message sender:", lastMessage?.sender);
    console.log("Last message content:", lastMessage?.content);
    
    // Check if it's from the assistant (or a model name)
    const isAssistantMessage = lastMessage?.sender === 'assistant' || 
                              (lastMessage?.sender && typeof lastMessage.sender === 'string' && 
                               lastMessage.sender !== 'user' && lastMessage.sender !== 'User');
    
    if (isAssistantMessage && lastMessage?.content) {
      // Extract content from message - it can be string or array
      let content = '';
      if (typeof lastMessage.content === 'string') {
        content = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        content = lastMessage.content
          .map((part: any) => {
            if (typeof part === 'string') {
              return part;
            }
            if ('text' in part) {
              return part.text || '';
            }
            return '';
          })
          .join('');
      }
      
      console.log("Extracted content:", content);
      
      // Try to parse as simplified Flow format
      const flowData = parseFlowMessage(content);
      if (flowData && flowData.options.length > 0) {
        console.log("Parsed Flow Message:", flowData);
        setSelectionState(prev => ({
          ...prev,
          message: flowData.message,
          options: flowData.options,
          isVisible: true,
          selectedOptions: [], // Clear previous selections
        }));
        return;
      }
    }
    
    // If no options found, hide the selection buttons
    setSelectionState(prev => ({ ...prev, isVisible: false, options: [], selectedOptions: [], message: '' }));
  }, [messagesTree, parseFlowMessage]);

  // Update options when conversation changes
  useEffect(() => {
    checkForFlowOptions();
  }, [checkForFlowOptions]);

  const updateSelectedOptions = useCallback((selected: string[]) => {
    setSelectionState(prev => ({ ...prev, selectedOptions: selected }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(prev => ({ ...prev, selectedOptions: [] }));
  }, []);

  const hideSelection = useCallback(() => {
    setSelectionState(prev => ({ ...prev, isVisible: false, options: [], selectedOptions: [], message: '' }));
  }, []);

  return {
    ...selectionState,
    updateSelectedOptions,
    clearSelection,
    hideSelection,
  };
};
