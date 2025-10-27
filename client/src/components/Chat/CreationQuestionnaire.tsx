import { useState } from 'react';
import { Button, Label, Textarea, Input } from '@librechat/client';

interface CreationQuestionnaireProps {
  onComplete: () => void;
}

interface QuestionnaireData {
  flowExperience: string;
  creativityLevel: string;
  challenges: string;
  satisfaction: string;
  additionalNotes: string;
}

const FLOW_EXPERIENCE_OPTIONS = [
  { value: 'very-low', label: 'Very Low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very-high', label: 'Very High' },
];

const CREATIVITY_LEVEL_OPTIONS = [
  { value: 'very-low', label: 'Very Low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very-high', label: 'Very High' },
];

const SATISFACTION_OPTIONS = [
  { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
  { value: 'dissatisfied', label: 'Dissatisfied' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'very-satisfied', label: 'Very Satisfied' },
];

export default function CreationQuestionnaire({ onComplete }: CreationQuestionnaireProps) {
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    flowExperience: '',
    creativityLevel: '',
    challenges: '',
    satisfaction: '',
    additionalNotes: '',
  });

  const handleInputChange = (field: keyof QuestionnaireData, value: string) => {
    setQuestionnaireData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Here you would typically save the questionnaire data
    // For now, we'll just complete the questionnaire
    console.log('Questionnaire data:', questionnaireData);
    onComplete();
  };

  const isComplete = questionnaireData.flowExperience && 
                    questionnaireData.creativityLevel && 
                    questionnaireData.satisfaction;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Creation Questionnaire
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please tell us about your experience creating this experiment
          </p>
        </div>

        <div className="space-y-6">
          {/* Flow Experience */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="flowExperience" className="text-sm font-medium">
              How much in flow did you feel while creating this experiment?
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {FLOW_EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('flowExperience', option.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    questionnaireData.flowExperience === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creativity Level */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="creativityLevel" className="text-sm font-medium">
              How creative did you feel during the creation process?
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {CREATIVITY_LEVEL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('creativityLevel', option.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    questionnaireData.creativityLevel === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="challenges" className="text-sm font-medium">
              What challenges did you face while creating this experiment?
            </Label>
            <Textarea
              id="challenges"
              value={questionnaireData.challenges}
              onChange={(e) => handleInputChange('challenges', e.target.value)}
              placeholder="Describe any challenges you encountered..."
              className="min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Satisfaction */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="satisfaction" className="text-sm font-medium">
              How satisfied are you with the final experiment?
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {SATISFACTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('satisfaction', option.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    questionnaireData.satisfaction === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="additionalNotes" className="text-sm font-medium">
              Additional Notes
            </Label>
            <Textarea
              id="additionalNotes"
              value={questionnaireData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional thoughts or feedback..."
              className="min-h-[80px]"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="w-full">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Questionnaire Progress</span>
          <span>{isComplete ? '100%' : '60%'}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: isComplete ? '100%' : '60%' }}
          />
        </div>
      </div>
    </div>
  );
}
