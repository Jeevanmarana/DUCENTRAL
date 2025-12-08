import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';

type SearchProps = {
  onTabChange: (tab: string) => void;
};

export function Search({ onTabChange }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { mode } = useMode();

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-0 ${mode === 'social' ? 'bg-du-bg' : ''}`}>
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-6 ${mode === 'social' ? 'md:bg-white' : ''}`}>
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <SearchIcon className={`w-8 h-8 ${mode === 'social' ? 'text-du md:text-blue-600' : 'text-blue-600'}`} />
            <h1 className={`text-3xl font-bold ${mode === 'social' ? 'text-white md:text-gray-900' : 'text-gray-900'}`}>Search</h1>
          </div>
          <p className="text-gray-600">Find what you're looking for across the platform</p>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${mode === 'social' ? 'focus:ring-du' : 'focus:ring-blue-500'} focus:border-transparent`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500">Start typing to search</p>
        </div>
      </div>
    </div>
  );
}
