/**
 * Utility functions for parsing artifact content from messages and database
 */

export interface ParsedArtifact {
  content: string;
  type: string;
  identifier?: string;
  title?: string;
}

/**
 * Extracts artifact content and metadata from a message containing artifact wrapper
 * @param messageContent - The full message content
 * @returns ParsedArtifact object with clean content and metadata, or null if no artifact found
 */
export const parseArtifactFromMessage = (messageContent: string): ParsedArtifact | null => {
  const artifactRegex = /:::artifact(?:\{([^}]*)\})?(?:\s|\n)*(?:```[\s\S]*?```(?:\s|\n)*)?:::/m;
  const match = messageContent.match(artifactRegex);
  
  if (!match) {
    return null;
  }

  const metadata = match[1] || '';
  
  // Extract content from the full match by removing the wrapper
  const fullMatch = match[0];
  const contentStart = fullMatch.indexOf('```');
  const contentEnd = fullMatch.lastIndexOf('```');
  
  let content = '';
  if (contentStart !== -1 && contentEnd !== -1 && contentEnd > contentStart) {
    content = fullMatch.substring(contentStart + 3, contentEnd).trim();
  } else {
    // If no ``` blocks, extract content between wrapper
    const wrapperStart = fullMatch.indexOf(':::artifact');
    const wrapperEnd = fullMatch.lastIndexOf(':::');
    if (wrapperStart !== -1 && wrapperEnd !== -1 && wrapperEnd > wrapperStart) {
      const innerContent = fullMatch.substring(wrapperStart + 10, wrapperEnd).trim();
      // Remove metadata if present
      const metadataEnd = innerContent.indexOf('}');
      if (metadataEnd !== -1) {
        content = innerContent.substring(metadataEnd + 1).trim();
      } else {
        content = innerContent;
      }
    }
  }
  
  // Extract metadata attributes
  const typeMatch = metadata.match(/type="([^"]*)"/);
  const identifierMatch = metadata.match(/identifier="([^"]*)"/);
  const titleMatch = metadata.match(/title="([^"]*)"/);
  
  return {
    content: content.trim(),
    type: typeMatch ? typeMatch[1] : 'text/html',
    identifier: identifierMatch ? identifierMatch[1] : undefined,
    title: titleMatch ? titleMatch[1] : undefined,
  };
};

/**
 * Extracts clean artifact content from stored artifact code (removes wrapper)
 * @param artifactCode - The stored artifact code with wrapper
 * @returns Clean content without wrapper, or original if no wrapper found
 */
export const extractCleanContent = (artifactCode: string): string => {
  const parsed = parseArtifactFromMessage(artifactCode);
  return parsed ? parsed.content : artifactCode;
};

/**
 * Extracts artifact metadata from stored artifact code
 * @param artifactCode - The stored artifact code with wrapper
 * @returns ParsedArtifact object with metadata, or null if no artifact found
 */
export const parseStoredArtifact = (artifactCode: string): ParsedArtifact | null => {
  return parseArtifactFromMessage(artifactCode);
};
