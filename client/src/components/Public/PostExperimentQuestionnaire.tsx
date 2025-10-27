import { useState } from 'react';
import { OGDialogTemplate, OGDialog, Button, Label, Textarea } from '@librechat/client';
import { CheckCircle, Clock, Heart, Star } from 'lucide-react';

interface PostExperimentQuestionnaireProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  experimentDuration?: number;
}

interface QuestionnaireData {
  flowExperience: string;
  creativityLevel: string;
  satisfaction: string;
  challenges: string;
  insights: string;
  wouldRecommend: string;
}

const FLOW_EXPERIENCE_OPTIONS = [
  { value: 'not-at-all', label: 'Not at all', emoji: '😴' },
  { value: 'a-little', label: 'A little', emoji: '😐' },
  { value: 'moderately', label: 'Moderately', emoji: '😊' },
  { value: 'very-much', label: 'Very much', emoji: '🤩' },
  { value: 'completely', label: 'Completely', emoji: '🚀' },
];

const CREATIVITY_LEVEL_OPTIONS = [
  { value: 'not-creative', label: 'Not creative', emoji: '😔' },
  { value: 'slightly-creative', label: 'Slightly creative', emoji: '😐' },
  { value: 'moderately-creative', label: 'Moderately creative', emoji: '😊' },
  { value: 'very-creative', label: 'Very creative', emoji: '🎨' },
  { value: 'highly-creative', label: 'Highly creative', emoji: '✨' },
];

const SATISFACTION_OPTIONS = [
  { value: 'very-dissatisfied', label: 'Very Dissatisfied', emoji: '😞' },
  { value: 'dissatisfied', label: 'Dissatisfied', emoji: '😕' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'satisfied', label: 'Satisfied', emoji: '😊' },
  { value: 'very-satisfied', label: 'Very Satisfied', emoji: '🤩' },
];

const RECOMMENDATION_OPTIONS = [
  { value: 'definitely-not', label: 'Definitely Not', emoji: '👎' },
  { value: 'probably-not', label: 'Probably Not', emoji: '😕' },
  { value: 'maybe', label: 'Maybe', emoji: '🤔' },
  { value: 'probably-yes', label: 'Probably Yes', emoji: '👍' },
  { value: 'definitely-yes', label: 'Definitely Yes', emoji: '🌟' },
];

export default function PostExperimentQuestionnaire({ 
  open, 
  onOpenChange, 
  onComplete, 
  experimentDuration 
}: PostExperimentQuestionnaireProps) {
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    flowExperience: '',
    creativityLevel: '',
    satisfaction: '',
    challenges: '',
    insights: '',
    wouldRecommend: '',
  });

  const handleInputChange = (field: keyof QuestionnaireData, value: string) => {
    setQuestionnaireData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    // Here you could save the questionnaire data to the backend
    console.log('Questionnaire completed:', questionnaireData);
    onComplete();
  };

  const isComplete = Object.values(questionnaireData).every(val => val !== '');

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <OGDialogTemplate
        title="Post-Experiment Questionnaire"
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        main={
          <div className="py-4">
            <div className="mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Thank you for completing the experiment!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please take a moment to share your experience. This helps us improve future experiments.
                </p>
                {experimentDuration && (
                  <div className="flex items-center justify-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    Duration: {Math.floor(experimentDuration / 60)}m {experimentDuration % 60}s
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Flow Experience */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  How much in flow did you feel during this experiment?
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {FLOW_EXPERIENCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('flowExperience', option.value)}
                      className={`flex flex-col items-center p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                        questionnaireData.flowExperience === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg mb-1">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Creativity Level */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  How creative did you feel during the experiment?
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {CREATIVITY_LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('creativityLevel', option.value)}
                      className={`flex flex-col items-center p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                        questionnaireData.creativityLevel === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg mb-1">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Satisfaction */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  How satisfied are you with your overall experience?
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {SATISFACTION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('satisfaction', option.value)}
                      className={`flex flex-col items-center p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                        questionnaireData.satisfaction === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg mb-1">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="challenges" className="text-sm font-medium">
                  What challenges did you face during the experiment?
                </Label>
                <Textarea
                  id="challenges"
                  value={questionnaireData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder="Describe any difficulties or obstacles you encountered..."
                  className="min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Insights */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="insights" className="text-sm font-medium">
                  What insights or discoveries did you make?
                </Label>
                <Textarea
                  id="insights"
                  value={questionnaireData.insights}
                  onChange={(e) => handleInputChange('insights', e.target.value)}
                  placeholder="Share any interesting observations or realizations..."
                  className="min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Recommendation */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2 text-purple-500" />
                  Would you recommend this experiment to others?
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {RECOMMENDATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('wouldRecommend', option.value)}
                      className={`flex flex-col items-center p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                        questionnaireData.wouldRecommend === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg mb-1">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Questionnaire Progress</span>
                <span>{isComplete ? '100%' : '80%'}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: isComplete ? '100%' : '80%' }}
                />
              </div>
            </div>
          </div>
        }
        buttons={
          <div className="flex items-center justify-end space-x-3">
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
            >
              Skip
            </Button>
            <Button 
              onClick={handleComplete} 
              variant="submit"
              disabled={!isComplete}
            >
              Complete & Return Home
            </Button>
          </div>
        }
        showCloseButton={true}
        showCancelButton={false}
      />
    </OGDialog>
  );
}
