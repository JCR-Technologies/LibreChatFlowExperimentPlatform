import { useCallback } from 'react';
import { useChatContext } from '~/Providers';
import { useLocalize } from '~/hooks';

export default function FlowArchitectLanding() {
  const { ask } = useChatContext();
  const localize = useLocalize();

  const handleStartExperiment = useCallback(() => {
    // Send a message to start the Flow Architect AI process
    ask({ text: 'Start creating my flow experiment' });
  }, [ask]);

  return (
    <div className="flex h-full flex-col items-center justify-center pb-16">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        {/* Flow Architect AI Icon/Logo */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg
            className="h-10 w-10 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">
            Flow Architect AI
          </h1>
          <p className="text-lg text-text-secondary">
            Design personalized flow experiments, games, and creative tasks
          </p>
        </div>

        {/* Description */}
        <div className="max-w-md space-y-4 text-sm text-text-secondary">
          <p>
            I'll guide you through creating a structured, engaging flow experiment 
            tailored to your goals and preferences.
          </p>
          <p>
            We'll work together to design something that challenges the users of the experiment just right, 
            provides clear feedback, and keeps the users in the flow state.
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartExperiment}
          className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Start creating your experiment
        </button>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-sm text-text-secondary sm:grid-cols-3">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Guided Process</span>
            <span>Step-by-step design</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Multiple Choice</span>
            <span>Easy selections</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Flow State</span>
            <span>Optimal challenge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
