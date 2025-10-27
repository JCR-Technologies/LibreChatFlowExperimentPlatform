import { useState } from 'react';
import { OGDialogTemplate, OGDialog, Button } from '@librechat/client';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { TArtifact } from 'librechat-data-provider';

interface InstructionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: TArtifact;
  onStart: () => void;
}

export default function InstructionModal({ open, onOpenChange, artifact, onStart }: InstructionModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleNext = () => {
    if (currentPage === 1) {
      setCurrentPage(2);
    } else {
      onStart();
      // Close the modal immediately when starting the experiment
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
    }
  };

  const handleClose = () => {
    setCurrentPage(1);
    setConsentGiven(false);
    onOpenChange(false);
  };

  // Reset modal state when it closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentPage(1);
      setConsentGiven(false);
    }
    onOpenChange(open);
  };

  return (
    <OGDialog open={open} onOpenChange={handleOpenChange}>
      <OGDialogTemplate
        title={currentPage === 1 ? 'Welcome to the Flow Experiment Platform' : 'Experiment Instructions'}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        main={
          <div className="py-4">
            {currentPage === 1 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧪</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Citizen Science Platform
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You're about to participate in a digital flow experiment that contributes to scientific research on flow states and creativity.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Data Collection & Consent
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Your interaction data will be collected anonymously</li>
                        <li>• This data helps researchers understand flow experiences</li>
                        <li>• No personal information will be stored</li>
                        <li>• You can stop the experiment at any time</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Pre-Experiment Questionnaire
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Before starting, you'll be asked a few questions about your current state and expectations. This helps us understand your baseline experience.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700 dark:text-gray-300">
                    I understand and agree to participate in this flow experiment. I consent to the anonymous collection of my interaction data for research purposes.
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">{artifact.thumbnail}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {artifact.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {artifact.description}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Instructions
                  </h4>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {artifact.instructions}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                        Ready to Start?
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Click "Start" when you're ready to begin the experiment. A timer will start, and you can finish whenever you feel complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        buttons={
          <div className="flex items-center justify-between w-full">
            <div>
              {currentPage === 2 && (
                <Button 
                  onClick={handleBack} 
                  variant="outline"
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleClose} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleNext} 
                variant="submit"
                disabled={currentPage === 1 && !consentGiven}
              >
                {currentPage === 1 ? 'Next' : 'Start'}
              </Button>
            </div>
          </div>
        }
        showCloseButton={true}
        showCancelButton={false}
      />
    </OGDialog>
  );
}
