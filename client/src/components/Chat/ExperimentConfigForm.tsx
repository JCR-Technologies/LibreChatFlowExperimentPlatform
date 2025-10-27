import { Input, Label, Textarea, Dropdown } from '@librechat/client';
import { useLocalize } from '~/hooks';

interface FormData {
  title: string;
  description: string;
  instructions: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnail: string;
}

interface ExperimentConfigFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isTitleFromArtifact?: boolean;
}

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Meditation', label: 'Meditation' },
  { value: 'Music', label: 'Music' },
  { value: 'Visual', label: 'Visual' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Games', label: 'Games' },
  { value: 'Wellness', label: 'Wellness' },
  { value: 'Education', label: 'Education' },
  { value: 'Creative', label: 'Creative' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const DURATION_OPTIONS = [
  { value: '5-10 min', label: '5-10 min' },
  { value: '10-15 min', label: '10-15 min' },
  { value: '15-20 min', label: '15-20 min' },
  { value: '20-30 min', label: '20-30 min' },
  { value: '30+ min', label: '30+ min' },
];

const THUMBNAIL_OPTIONS = [
  { value: '🎯', label: '🎯 Target' },
  { value: '🌱', label: '🌱 Growth' },
  { value: '🎵', label: '🎵 Music' },
  { value: '🎨', label: '🎨 Art' },
  { value: '✍️', label: '✍️ Writing' },
  { value: '🧩', label: '🧩 Puzzle' },
  { value: '🫁', label: '🫁 Wellness' },
  { value: '🧘', label: '🧘 Meditation' },
  { value: '🎮', label: '🎮 Game' },
  { value: '💡', label: '💡 Idea' },
];

export default function ExperimentConfigForm({ formData, setFormData, isTitleFromArtifact = false }: ExperimentConfigFormProps) {
  const localize = useLocalize();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="grid w-full gap-6 sm:grid-cols-2">
        {/* Title */}
        <div className="col-span-2 flex flex-col items-start justify-start gap-2">
          <Label htmlFor="title" className="text-left text-sm font-medium">
            Experiment Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter experiment title"
            className="w-full"
          />
          {isTitleFromArtifact && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ✨ Title automatically extracted from artifact
            </p>
          )}
        </div>

        {/* Description */}
        <div className="col-span-2 flex flex-col items-start justify-start gap-2">
          <Label htmlFor="description" className="text-left text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your experiment"
            className="w-full min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Instructions */}
        <div className="col-span-2 flex flex-col items-start justify-start gap-2">
          <Label htmlFor="instructions" className="text-left text-sm font-medium">
            Instructions
          </Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Provide instructions for users"
            className="w-full min-h-[120px]"
            rows={5}
          />
        </div>

        {/* Category */}
        <div className="col-span-1 flex w-full flex-col items-start justify-start gap-2">
          <Label htmlFor="category" className="text-left text-sm font-medium">
            Category
          </Label>
          <Dropdown
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            options={CATEGORIES}
            className="z-[60]"
            portal={true}
          />
        </div>

        {/* Difficulty */}
        <div className="col-span-1 flex w-full flex-col items-start justify-start gap-2">
          <Label htmlFor="difficulty" className="text-left text-sm font-medium">
            Difficulty
          </Label>
          <Dropdown
            value={formData.difficulty}
            onChange={(value) => handleInputChange('difficulty', value as FormData['difficulty'])}
            options={DIFFICULTY_OPTIONS}
            className="z-[70]"
            portal={true}
          />
        </div>

        {/* Duration */}
        <div className="col-span-1 flex w-full flex-col items-start justify-start gap-2">
          <Label htmlFor="duration" className="text-left text-sm font-medium">
            Duration
          </Label>
          <Dropdown
            value={formData.duration}
            onChange={(value) => handleInputChange('duration', value)}
            options={DURATION_OPTIONS}
            className="z-[80]"
            portal={true}
          />
        </div>

        {/* Thumbnail */}
        <div className="col-span-1 flex w-full flex-col items-start justify-start gap-2">
          <Label htmlFor="thumbnail" className="text-left text-sm font-medium">
            Thumbnail
          </Label>
          <Dropdown
            value={formData.thumbnail}
            onChange={(value) => handleInputChange('thumbnail', value)}
            options={THUMBNAIL_OPTIONS}
            className="z-[90]"
            portal={true}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Preview
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{formData.thumbnail}</div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {formData.title || 'Enter experiment title'}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formData.description || 'Describe your experiment'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                  {formData.category}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                  {formData.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs">
                  {formData.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
