import { useState, useRef, useEffect } from 'react';
import { OGDialogTemplate, OGDialog, Button } from '@librechat/client';
import { usePublishArtifactMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { useGetMessagesByConvoId } from '~/data-provider';
import type { TConversation } from 'librechat-data-provider';
import ExperimentConfigForm from '~/components/Chat/ExperimentConfigForm';
import CreationQuestionnaire from '~/components/Chat/CreationQuestionnaire';

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: TConversation | null;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

interface FormData {
  title: string;
  description: string;
  instructions: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnail: string;
}

// Helper function to extract artifact code from message content
const extractArtifactCode = (messageContent: string): string | null => {
  const artifactRegex = /:::artifact(?:\{[^}]*\})?(?:\s|\n)*(?:```[\s\S]*?```(?:\s|\n)*)?:::/m;
  const match = messageContent.match(artifactRegex);
  return match ? match[0] : null;
};

// Helper function to extract message content from TMessage
const extractMessageContent = (message: any): string => {
  if (typeof message.content === 'string') {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if ('text' in part) {
          return part.text || '';
        }
        if ('think' in part) {
          const think = part.think;
          if (typeof think === 'string') {
            return think;
          }
          return think && 'text' in think ? think.text || '' : '';
        }
        return '';
      })
      .join('');
  }

  return message.text || '';
};

export default function PublishModal({ open, onOpenChange, conversation, triggerRef }: PublishModalProps) {
  const localize = useLocalize();
  const [step, setStep] = useState(1);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    instructions: '',
    category: 'General',
    difficulty: 'Beginner',
    duration: '10-15 min',
    thumbnail: '🎯',
  });

  const publishMutation = usePublishArtifactMutation();
  
  // Get messages for the conversation to extract artifact code
  const { data: messagesTree = null } = useGetMessagesByConvoId(conversation?.conversationId ?? '', {
    enabled: !!conversation?.conversationId && open,
  });

  // Extract artifact code by iterating through messages from latest to oldest
  const artifactCode = (() => {
    if (!messagesTree || messagesTree.length === 0) {
      return null;
    }

    // Iterate through messages from latest to oldest to find the first valid artifact
    for (let i = messagesTree.length - 1; i >= 0; i--) {
      const message = messagesTree[i];
      const messageContent = extractMessageContent(message);
      const extractedCode = extractArtifactCode(messageContent);
      
      if (extractedCode) {
        return extractedCode;
      }
    }
    
    return null;
  })();

  useEffect(() => {
    if (open && conversation?.title) {
      setFormData(prev => ({ ...prev, title: conversation.title || '' }));
    }
  }, [open, conversation?.title]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setPublishStatus('idle');
      setPublishError(null);
      setFormData({
        title: '',
        description: '',
        instructions: '',
        category: 'General',
        difficulty: 'Beginner',
        duration: '10-15 min',
        thumbnail: '🎯',
      });
    }
  }, [open]);

  const handlePublish = async () => {
    if (!conversation?.conversationId) {
      console.error('No conversation ID available');
      setPublishStatus('error');
      setPublishError('No conversation ID available');
      return;
    }

    if (!artifactCode) {
      console.error('No artifact code found in any message of this conversation');
      setPublishStatus('error');
      setPublishError('No artifact code found in any message of this conversation');
      return;
    }

    try {
      await publishMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        artifactCode: artifactCode,
        conversationId: conversation.conversationId,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: formData.duration,
        thumbnail: formData.thumbnail,
      });
      setPublishStatus('success');
      setPublishError(null);
    } catch (error) {
      console.error('Error publishing artifact:', error);
      setPublishStatus('error');
      setPublishError(error instanceof Error ? error.message : 'Failed to publish artifact');
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleContinueWorking = () => {
    onOpenChange(false);
  };

  const handleGoToHome = () => {
    // Navigate to home page - you might want to use React Router's navigate here
    window.location.href = '/';
  };

  const handleRetry = () => {
    setPublishStatus('idle');
    setPublishError(null);
  };

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.instructions.trim() && artifactCode;

  // Show success/error status if publish is complete
  if (publishStatus === 'success') {
    return (
      <OGDialog open={open} onOpenChange={onOpenChange} triggerRef={triggerRef}>
        <OGDialogTemplate
          title="Publish Successful!"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          main={
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-6xl">🎉</div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                  Experiment Published Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your experiment "{formData.title}" has been published and is now available on the platform.
                </p>
              </div>
            </div>
          }
          buttons={
            <>
              <Button 
                onClick={handleContinueWorking} 
                variant="outline"
              >
                Continue Working
              </Button>
              <Button 
                onClick={handleGoToHome} 
                variant="submit"
              >
                Go to Home Page
              </Button>
            </>
          }
          showCloseButton={true}
        />
      </OGDialog>
    );
  }

  if (publishStatus === 'error') {
    return (
      <OGDialog open={open} onOpenChange={onOpenChange} triggerRef={triggerRef}>
        <OGDialogTemplate
          title="Publish Failed"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          main={
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-6xl">❌</div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Failed to Publish Experiment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {publishError || 'An unexpected error occurred while publishing your experiment.'}
                </p>
              </div>
            </div>
          }
          buttons={
            <>
              <Button 
                onClick={handleRetry} 
                variant="outline"
              >
                Try Again
              </Button>
              <Button 
                onClick={handleContinueWorking} 
                variant="submit"
              >
                Continue Working
              </Button>
            </>
          }
          showCloseButton={true}
        />
      </OGDialog>
    );
  }

  return (
    <OGDialog open={open} onOpenChange={onOpenChange} triggerRef={triggerRef}>
      <OGDialogTemplate
        title={step === 1 ? 'Publish Experiment' : 'Creation Questionnaire'}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        main={
          step === 1 ? (
            <div>
                      {!artifactCode && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ No artifact found in any message. Make sure at least one message in this conversation contains an artifact (starts with :::artifact and ends with :::).
                          </p>
                        </div>
                      )}
              <ExperimentConfigForm 
                formData={formData} 
                setFormData={setFormData}
              />
            </div>
          ) : (
            <CreationQuestionnaire 
              onComplete={handleBack}
            />
          )
        }
        buttons={
          step === 1 ? (
            <>
              <Button 
                onClick={handleNext} 
                variant="submit"
                disabled={!isFormValid}
              >
                Next: Questionnaire
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleBack} 
                variant="outline"
              >
                Back
              </Button>
              <Button 
                onClick={handlePublish} 
                variant="submit"
                disabled={publishMutation.isLoading}
              >
                {publishMutation.isLoading ? 'Publishing...' : 'Publish Experiment'}
              </Button>
            </>
          )
        }
        showCloseButton={true}
        showCancelButton={false}
      />
    </OGDialog>
  );
}
