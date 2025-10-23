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

  // Parse JSON format from Flow Architect AI messages
  const parseFlowJSON = useCallback((message: string): { message: string; options: string[] } | null => {
    try {
      // Try to parse the entire message as JSON
      const parsed = JSON.parse(message);
      if (parsed && typeof parsed.message === 'string' && Array.isArray(parsed.options)) {
        return {
          message: parsed.message,
          options: parsed.options.filter((opt: any) => typeof opt === 'string')
        };
      }
    } catch (error) {
      // If direct JSON parsing fails, try to find JSON within the message
      const jsonMatch = message.match(/\{[\s\S]*"message"[\s\S]*"options"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed.message === 'string' && Array.isArray(parsed.options)) {
            return {
              message: parsed.message,
              options: parsed.options.filter((opt: any) => typeof opt === 'string')
            };
          }
        } catch (jsonError) {
          console.log("Failed to parse JSON within message:", jsonError);
        }
      }
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
      
      // Try to parse as JSON format
      const flowData = parseFlowJSON(content);
      if (flowData && flowData.options.length > 0) {
        console.log("Parsed Flow JSON:", flowData);
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
  }, [messagesTree, parseFlowJSON]);

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
