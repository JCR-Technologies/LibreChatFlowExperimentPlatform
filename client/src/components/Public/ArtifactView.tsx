import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Square, CheckCircle, RefreshCw } from 'lucide-react';
import { useGetArtifactByIdQuery, useUpdateArtifactStatsMutation, useGetStartupConfig } from '~/data-provider';
import type { TArtifact } from 'librechat-data-provider';
import type { SandpackPreviewRef } from '@codesandbox/sandpack-react/unstyled';
import {
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react/unstyled';
import InstructionModal from '~/components/Public/InstructionModal';
import PostExperimentQuestionnaire from '~/components/Public/PostExperimentQuestionnaire';
import { getKey, getProps, getTemplate, getArtifactFilename } from '~/utils/artifacts';
import { getMermaidFiles } from '~/utils/mermaid';
import { sharedFiles, sharedOptions } from '~/utils/artifacts';
import { removeNullishValues } from 'librechat-data-provider';

interface ExperimentState {
  phase: 'loading' | 'instructions' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export default function ArtifactView() {
  const { artifactId } = useParams<{ artifactId: string }>();
  const navigate = useNavigate();
  const [experimentState, setExperimentState] = useState<ExperimentState>({ phase: 'loading' });
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPostQuestionnaire, setShowPostQuestionnaire] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previewRef = useRef<SandpackPreviewRef>(null);

  // Fetch artifact data
  const { data: artifact, isLoading, error } = useGetArtifactByIdQuery(artifactId!);
  const { data: startupConfig } = useGetStartupConfig();

  // Mutation for updating stats
  const updateStatsMutation = useUpdateArtifactStatsMutation();

  useEffect(() => {
    if (artifact) {
      setExperimentState({ phase: 'instructions' });
    }
  }, [artifact]);

  // Process artifact for Sandpack
  const { files, fileKey, template, sharedProps, isMermaid } = useMemo(() => {
    if (!artifact?.artifactCode) {
      return { files: {}, fileKey: '', template: 'static', sharedProps: {}, isMermaid: false };
    }

    // Extract artifact type and language from artifactCode
    const artifactType = 'application/vnd.react'; // Default to React for now
    const language = 'tsx';
    
    const isMermaid = getKey(artifactType, language).includes('mermaid');
    
    if (isMermaid) {
      return {
        files: getMermaidFiles(artifact.artifactCode),
        fileKey: 'App.tsx',
        template: 'react-ts',
        sharedProps: getProps(artifactType),
        isMermaid: true,
      };
    }

    const fileKey = getArtifactFilename(artifactType, language);
    const files = removeNullishValues({
      [fileKey]: artifact.artifactCode,
    });
    
    return {
      files,
      fileKey,
      template: getTemplate(artifactType, language),
      sharedProps: getProps(artifactType),
      isMermaid: false,
    };
  }, [artifact?.artifactCode]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const client = previewRef.current?.getClient();
    if (client != null) {
      client.dispatch({ type: 'refresh' });
    }
    setTimeout(() => setIsRefreshing(false), 750);
  };

  const handleStartExperiment = () => {
    setShowInstructions(false);
    setExperimentState({
      phase: 'running',
      startTime: new Date(),
    });
    
    // Increment play count
    updateStatsMutation.mutate({
      artifactId: artifactId!,
      action: 'play',
    });
  };

  const handleFinishExperiment = () => {
    const endTime = new Date();
    const duration = experimentState.startTime 
      ? Math.round((endTime.getTime() - experimentState.startTime.getTime()) / 1000)
      : 0;

    setExperimentState({
      ...experimentState,
      phase: 'completed',
      endTime,
      duration,
    });

    setShowPostQuestionnaire(true);
  };

  const handleQuestionnaireComplete = () => {
    setShowPostQuestionnaire(false);
    // Navigate back to landing page
    navigate('/', { replace: true });
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Experiment Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The experiment you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{artifact.thumbnail}</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {artifact.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {artifact.author}
                </p>
              </div>
            </div>

            {experimentState.phase === 'running' && experimentState.startTime && (
              <ExperimentTimer startTime={experimentState.startTime} />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {experimentState.phase === 'instructions' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{artifact.thumbnail}</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {artifact.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {artifact.description}
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {artifact.duration || '10-15 min'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    {artifact.category}
                  </span>
                  {artifact.difficulty && (
                    <span className={`px-2 py-1 rounded-full ${
                      artifact.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      artifact.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {artifact.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleStartExperiment}
                  className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Start Experiment
                </button>
              </div>
            </div>
          </div>
        )}

        {experimentState.phase === 'running' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Experiment Header */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {artifact.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Experiment in progress
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Refresh button */}
                    <button
                      className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-transform duration-500 ease-in-out ${
                        isRefreshing ? 'rotate-180' : ''
                      }`}
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      aria-label="Refresh"
                    >
                      <RefreshCw
                        size={20}
                        className={`transform ${isRefreshing ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <button
                      onClick={handleFinishExperiment}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Finish Experiment
                    </button>
                  </div>
                </div>
              </div>

              {/* Sandpack Preview */}
              <div className="h-[600px]">
                {Object.keys(files).length > 0 ? (
                  <SandpackProvider
                    files={{
                      ...files,
                      ...sharedFiles,
                    }}
                    options={{
                      ...sharedOptions,
                      bundlerURL: template === 'static' ? startupConfig?.staticBundlerURL : startupConfig?.bundlerURL,
                    }}
                    {...sharedProps}
                    template={template as any}
                  >
                    <SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton={false}
                      tabIndex={0}
                      ref={previewRef}
                      style={{
                        height: '100%',
                        backgroundColor: isMermaid ? '#282C34' : 'white',
                      }}
                    />
                  </SandpackProvider>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚠️</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No executable code found in this artifact.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {experimentState.phase === 'completed' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Experiment Completed!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Thank you for participating in this experiment.
              </p>
              {experimentState.duration && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Duration: {Math.floor(experimentState.duration / 60)}m {experimentState.duration % 60}s
                </p>
              )}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleBackToHome}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <InstructionModal
        open={showInstructions}
        onOpenChange={setShowInstructions}
        artifact={artifact}
        onStart={handleStartExperiment}
      />

      <PostExperimentQuestionnaire
        open={showPostQuestionnaire}
        onOpenChange={setShowPostQuestionnaire}
        onComplete={handleQuestionnaireComplete}
        experimentDuration={experimentState.duration}
      />
    </div>
  );
}

// Timer component
function ExperimentTimer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
      <Clock className="w-4 h-4 mr-2" />
      <span className="font-mono">{formatTime(elapsed)}</span>
    </div>
  );
}
