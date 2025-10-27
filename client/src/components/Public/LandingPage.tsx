import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Users, Calendar, Heart, Play, Filter } from 'lucide-react';
import { useGetArtifactsQuery } from 'librechat-data-provider/react-query';
import type { TArtifact } from 'librechat-data-provider';

// Categories for filtering - dynamically generated from artifacts
const defaultCategories = ['All'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch published artifacts
  const { data: artifactsResponse, isLoading, error } = useGetArtifactsQuery({
    limit: 50,
    sort: 'createdAt',
  });

  // Ensure artifacts is always an array
  const artifacts = Array.isArray(artifactsResponse) ? artifactsResponse : [];

  // Generate categories from artifacts
  const categories = [
    'All',
    ...Array.from(new Set(artifacts.map(artifact => artifact.category))).sort()
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStartExperiment = () => {
    // Always go to login first - let the auth system handle the redirect
    navigate('/login', { replace: true });
  };

  // Filter experiments based on search and category
  const filteredExperiments = artifacts.filter(artifact => {
    const matchesSearch = !debouncedSearch || 
      artifact.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      artifact.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      artifact.author.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || artifact.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Flow Experiment Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create, share, and explore digital flow experiments and contribute to citizen science around flow.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Start Experiment Button */}
          <button
            onClick={handleStartExperiment}
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Create Your Experiment
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Experiments Grid */}
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-4">Loading experiments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">
                Failed to load experiments. Please try again later.
              </p>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                {debouncedSearch || selectedCategory !== 'All' 
                  ? 'No experiments found matching your criteria.' 
                  : 'No experiments available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((artifact: TArtifact) => (
                <ExperimentCard key={artifact.artifactId} experiment={artifact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: TArtifact }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTryExperiment = () => {
    // Navigate to the artifact view page
    window.open(`/artifacts/${experiment.artifactId}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl mb-2">{experiment.thumbnail || '🎯'}</div>
          {experiment.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(experiment.difficulty)}`}>
              {experiment.difficulty}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {experiment.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {experiment.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          {experiment.duration && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {experiment.duration}
            </div>
          )}
          
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            {experiment.author}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {experiment.likes.toLocaleString()}
          </div>
          <div className="flex items-center">
            <Play className="w-4 h-4 mr-1" />
            {experiment.plays.toLocaleString()}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleTryExperiment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Try Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
