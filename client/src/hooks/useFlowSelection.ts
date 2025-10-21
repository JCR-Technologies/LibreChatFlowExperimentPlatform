import { useState, useEffect, useCallback } from 'react';
import { useChatContext } from '~/Providers';
import { useGetMessagesByConvoId } from '~/data-provider';


interface FlowSelectionState {
  options: string[];
  selectedOptions: string[];
  isVisible: boolean;
}

export const useFlowSelection = (index: number) => {
  const [selectionState, setSelectionState] = useState<FlowSelectionState>({
    options: [],
    selectedOptions: [],
    isVisible: false,
  });

  const { conversation } = useChatContext();
  
  // Get the actual message data using the same approach as ChatView
  const { data: messagesTree = null } = useGetMessagesByConvoId(conversation?.conversationId ?? '', {
    enabled: !!conversation?.conversationId,
  });

  // Parse the last AI message to extract multiple choice options
  const parseFlowOptions = useCallback((message: string): string[] => {
    const options: string[] = [];
    
    // Look for bullet points or numbered lists that might be options
    const lines = message.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match patterns like:
      // * Option text
      // - Option text
      // 1. Option text
      // • Option text
      // Also match lines that start with common option patterns
      if (trimmed.match(/^[\*\-\•]\s+(.+)$/) || 
          trimmed.match(/^\d+\.\s+(.+)$/) ||
          trimmed.match(/^[A-Za-z]\s*\)\s+(.+)$/) ||
          trimmed.match(/^[A-Za-z]\.\s+(.+)$/)) {
        const option = trimmed.replace(/^[\*\-\•\d\.A-Za-z\)]\s*/, '').trim();
        if (option && option.length > 0 && option.length < 100) { // Reasonable length check
          options.push(option);
        }
      }
    }
    
    // Also look for options in a more general way - lines that look like choices
    if (options.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        // Look for lines that are short and might be options
        if (trimmed.length > 3 && trimmed.length < 80 && 
            !trimmed.includes('?') && 
            !trimmed.includes(':') &&
            !trimmed.startsWith('**') &&
            !trimmed.startsWith('###') &&
            !trimmed.startsWith('Your goals:') &&
            !trimmed.startsWith('Expect user') &&
            !trimmed.startsWith('---') &&
            !trimmed.startsWith('###') &&
            !trimmed.startsWith('**Step') &&
            !trimmed.startsWith('Ask:') &&
            !trimmed.startsWith('Options:') &&
            !trimmed.startsWith('Generate a prototype') &&
            !trimmed.startsWith('Summarize the designed') &&
            !trimmed.startsWith('Always remind') &&
            !trimmed.startsWith('If the user') &&
            !trimmed.startsWith('Keep the experience') &&
            !trimmed.startsWith('Aim to leave')) {
          // Check if it's not a question or instruction
          if (!trimmed.endsWith('?') && !trimmed.includes('Ask:') && !trimmed.includes('Options:')) {
            options.push(trimmed);
          }
        }
      }
    }
    
    console.log("Parsed options:", options);
    return options.slice(0, 8); // Limit to 8 options max
  }, []);

  // Check if the last message is from Flow Architect AI and contains options
  const checkForFlowOptions = useCallback(() => {
    console.log("MessagesTree:", messagesTree);
    console.log("MessagesTree length:", messagesTree?.length);
    
    if (!messagesTree || messagesTree.length === 0) {
      console.log("No messages found in messagesTree");
      setSelectionState(prev => ({ ...prev, isVisible: false, options: [], selectedOptions: [] }));
      return;
    }

    // Get the last message from the messagesTree
    const lastMessage = messagesTree[messagesTree.length - 1];
    console.log("Last message:", lastMessage);
    console.log("Last message sender:", lastMessage?.sender);
    console.log("Last message content:", lastMessage?.content);
    
    // Check if it's from the assistant (or a model name) and contains the Flow Architect AI prompt
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
      
      // Check if this looks like a Flow Architect AI response with options
      const hasFlowKeywords = content.includes('What\'s the purpose') || 
                            content.includes('Which senses') || 
                            content.includes('What form should') ||
                            content.includes('Which creative') ||
                            content.includes('Which type') ||
                            content.includes('Which') ||
                            content.includes('which') ||
                            content.includes('pick') ||
                            content.includes('choose') ||
                            content.includes('select') ||

                            content.includes('What\'s your current level') ||
                            content.includes('How should the difficulty') ||
                            content.includes('flow experiment') ||
                            content.includes('multiple-choice') ||
                            content.includes('choose from') ||
                            content.includes('select from') ||
                            content.includes('Brain Game') ||
                            content.includes('Create something') ||
                            content.includes('Make music') ||
                            content.includes('Increase awareness') ||
                            content.includes('Get into a trance') ||
                            content.includes('Explore creativity') ||
                            content.includes('Practice a skill') ||
                            content.includes('Learn new knowledge') ||
                            content.includes('Relaxation') ||
                            content.includes('Social / multiplayer');
      
      if (hasFlowKeywords) {
        const options = parseFlowOptions(content);
        if (options.length > 0) {
          setSelectionState(prev => ({
            ...prev,
            options,
            isVisible: true,
            selectedOptions: [], // Clear previous selections
          }));
          return;
        }
      }
    }
    
    // If no options found, hide the selection buttons
    setSelectionState(prev => ({ ...prev, isVisible: false, options: [], selectedOptions: [] }));
  }, [messagesTree, parseFlowOptions]);

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
    setSelectionState(prev => ({ ...prev, isVisible: false, options: [], selectedOptions: [] }));
  }, []);

  return {
    ...selectionState,
    updateSelectedOptions,
    clearSelection,
    hideSelection,
  };
};
