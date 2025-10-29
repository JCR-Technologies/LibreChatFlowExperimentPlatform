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
    // First check if the message contains the ==== marker followed by options JSON
    const optionsMarker = '====';
    const markerIndex = message.indexOf(optionsMarker);
    
    if (markerIndex < 0) {
      return null; // No marker found, not a Flow message
    }

    // Extract everything after the marker
    const afterMarker = message.substring(markerIndex + optionsMarker.length).trim();
    
    // Check if it starts with {"options": [...]}
    if (!afterMarker.startsWith('{') || !afterMarker.includes('"options"')) {
      return null; // Marker not followed by options JSON
    }

    try {
      // Try to parse the JSON after the marker
      const jsonMatch = afterMarker.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.options)) {
        const options = parsed.options.filter((opt: any) => typeof opt === 'string');
        
        if (options.length > 0) {
          // Extract the message text (everything before the marker)
          const messageText = message.substring(0, markerIndex).trim();
          
          return {
            message: messageText,
            options: options
          };
        }
      }
    } catch (error) {
      // If parsing fails, it's not a valid Flow message
      return null;
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
