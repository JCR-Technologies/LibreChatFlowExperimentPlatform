import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks/useAuthContextNoRedirect';
import { useGetStartupConfig } from '~/data-provider';
import { ThemeSelector } from '@librechat/client';
import { Banner } from '~/components/Banners';
import { BlinkAnimation } from '~/components/Auth/BlinkAnimation';
import { useLocalize } from '~/hooks';

// Mock data for flow experiments - in a real app, this would come from an API
const mockFlowExperiments = [
  {
    id: '1',
    title: 'Zen Garden Meditation',
    description: 'A peaceful digital garden where you arrange stones and rake patterns to find inner calm.',
    category: 'Meditation',
    duration: '5-15 min',
    difficulty: 'Beginner',
    thumbnail: '🌱',
    author: 'FlowMaster',
    likes: 1247,
    plays: 8932,
  },
  {
    id: '2',
    title: 'Rhythm Flow',
    description: 'Create mesmerizing beats and melodies through intuitive touch interactions.',
    category: 'Music',
    duration: '10-20 min',
    difficulty: 'Intermediate',
    thumbnail: '🎵',
    author: 'BeatCreator',
    likes: 2156,
    plays: 12450,
  },
  {
    id: '3',
    title: 'Color Harmony',
    description: 'Paint with flowing colors that respond to your emotions and create beautiful patterns.',
    category: 'Visual',
    duration: '8-12 min',
    difficulty: 'Beginner',
    thumbnail: '🎨',
    author: 'ColorArtist',
    likes: 1890,
    plays: 15678,
  },
  {
    id: '4',
    title: 'Word Flow',
    description: 'Write poetry and stories in a flowing, distraction-free environment with AI assistance.',
    category: 'Writing',
    duration: '15-30 min',
    difficulty: 'Intermediate',
    thumbnail: '✍️',
    author: 'WordSmith',
    likes: 987,
    plays: 5432,
  },
  {
    id: '5',
    title: 'Puzzle Flow',
    description: 'Solve elegant puzzles that adapt to your skill level and create satisfying patterns.',
    category: 'Games',
    duration: '12-25 min',
    difficulty: 'Advanced',
    thumbnail: '🧩',
    author: 'PuzzleMaster',
    likes: 3421,
    plays: 18765,
  },
  {
    id: '6',
    title: 'Breathing Space',
    description: 'Guided breathing exercises with beautiful visualizations to reduce stress and anxiety.',
    category: 'Wellness',
    duration: '5-10 min',
    difficulty: 'Beginner',
    thumbnail: '🫁',
    author: 'WellnessGuide',
    likes: 2765,
    plays: 22134,
  },
];

const categories = ['All', 'Meditation', 'Music', 'Visual', 'Writing', 'Games', 'Wellness'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const localize = useLocalize();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperiments = mockFlowExperiments.filter(experiment => {
    const matchesCategory = selectedCategory === 'All' || experiment.category === selectedCategory;
    const matchesSearch = experiment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         experiment.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateExperiment = () => {
    if (isAuthenticated) {
      navigate('/c/new');
    } else {
      navigate('/login');
    }
  };

  const handleExperimentClick = (experimentId: string) => {
    // In a real app, this would navigate to the experiment player
    console.log('Opening experiment:', experimentId);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
      <Banner />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <BlinkAnimation active={false}>
                <img
                  src="assets/logo.svg"
                  className="h-8 w-auto"
                  alt={startupConfig?.appTitle ?? 'Flow Research Platform'}
                />
              </BlinkAnimation>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {startupConfig?.appTitle ?? 'Flow Research Platform'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/c/new')}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Experiment
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Enter the{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Flow State
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Discover and create immersive experiences designed to help you achieve deep focus, 
              creativity, and mindfulness through interactive flow experiments.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={handleCreateExperiment}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>✨</span>
                  <span>Create Your Experiment</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
              <button
                onClick={() => document.getElementById('experiments')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-xl border-2 border-indigo-600 px-8 py-4 text-lg font-semibold text-indigo-600 transition-all duration-300 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Explore Experiments
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section id="experiments" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search experiments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Experiments Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExperiments.map((experiment) => (
              <div
                key={experiment.id}
                onClick={() => handleExperimentClick(experiment.id)}
                className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800"
              >
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 p-8 dark:from-indigo-900 dark:to-purple-900">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-6xl">{experiment.thumbnail}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {experiment.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {experiment.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {experiment.title}
                  </h3>
                  
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    {experiment.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{experiment.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1" />
                        </svg>
                        <span>{experiment.plays}</span>
                      </span>
                    </div>
                    <span>{experiment.duration}</span>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    by {experiment.author}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredExperiments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No experiments found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 Flow Research Platform. Designed to help you find your flow state.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
