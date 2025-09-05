import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Users, Calendar, Heart, Play, Filter } from 'lucide-react';

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

interface FlowExperiment {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: string;
  thumbnail: string;
  author: string;
  likes: number;
  plays: number;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
  const filteredExperiments = mockFlowExperiments.filter(experiment => {
    const matchesSearch = !debouncedSearch || 
      experiment.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      experiment.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      experiment.author.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || experiment.category === selectedCategory;
    
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
            Discover and create AI-powered flow experiments for research and personal growth
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
            Start Your Experiment
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
          {filteredExperiments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                {debouncedSearch || selectedCategory !== 'All' 
                  ? 'No experiments found matching your criteria.' 
                  : 'No experiments available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((experiment: FlowExperiment) => (
                <ExperimentCard key={experiment.id} experiment={experiment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: FlowExperiment }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl mb-2">{experiment.thumbnail}</div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(experiment.difficulty)}`}>
            {experiment.difficulty}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {experiment.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {experiment.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {experiment.duration}
          </div>
          
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
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Try Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
