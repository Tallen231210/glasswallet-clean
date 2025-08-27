'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';

export interface SearchField {
  key: string;
  label: string;
  weight: number; // Higher weight = more important in search
  searchable: boolean;
  type: 'text' | 'email' | 'phone' | 'number';
}

export interface SearchMatch {
  field: string;
  value: string;
  score: number;
  highlights: Array<{ start: number; end: number }>;
}

export interface SearchResult<T = any> {
  item: T;
  matches: SearchMatch[];
  totalScore: number;
}

interface SmartSearchProps<T = any> {
  data: T[];
  fields: SearchField[];
  onResults: (results: SearchResult<T>[], query: string) => void;
  placeholder?: string;
  maxResults?: number;
  minScore?: number;
  debounceMs?: number;
  showSuggestions?: boolean;
  className?: string;
}

export function SmartSearch<T = any>({
  data,
  fields,
  onResults,
  placeholder = "Search...",
  maxResults = 100,
  minScore = 0.1,
  debounceMs = 300,
  showSuggestions = true,
  className
}: SmartSearchProps<T>) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Advanced search algorithm with fuzzy matching
  const searchItems = (searchQuery: string): SearchResult<T>[] => {
    if (!searchQuery.trim()) return [];

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/);
    
    const results: SearchResult<T>[] = [];

    data.forEach(item => {
      const matches: SearchMatch[] = [];
      let totalScore = 0;

      fields.forEach(field => {
        if (!field.searchable) return;

        const fieldValue = getFieldValue(item, field.key);
        if (!fieldValue) return;

        const normalizedValue = fieldValue.toLowerCase();
        const fieldMatches = findMatches(normalizedValue, queryTerms, field);
        
        if (fieldMatches.length > 0) {
          const fieldScore = calculateFieldScore(fieldMatches, field, normalizedValue, normalizedQuery);
          matches.push({
            field: field.key,
            value: fieldValue,
            score: fieldScore,
            highlights: fieldMatches
          });
          totalScore += fieldScore * field.weight;
        }
      });

      if (matches.length > 0 && totalScore >= minScore) {
        results.push({
          item,
          matches,
          totalScore
        });
      }
    });

    return results
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, maxResults);
  };

  const getFieldValue = (item: any, fieldKey: string): string => {
    const keys = fieldKey.split('.');
    let value = item;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === null || value === undefined) return '';
    }
    
    return String(value);
  };

  const findMatches = (value: string, queryTerms: string[], field: SearchField): Array<{ start: number; end: number }> => {
    const matches: Array<{ start: number; end: number }> = [];
    
    queryTerms.forEach(term => {
      if (term.length < 2) return;
      
      // Exact matches
      let index = value.indexOf(term);
      while (index !== -1) {
        matches.push({ start: index, end: index + term.length });
        index = value.indexOf(term, index + 1);
      }
      
      // Fuzzy matches for text fields
      if (field.type === 'text' && term.length >= 3) {
        const fuzzyMatches = findFuzzyMatches(value, term);
        matches.push(...fuzzyMatches);
      }
    });

    return mergeOverlappingMatches(matches);
  };

  const findFuzzyMatches = (value: string, term: string): Array<{ start: number; end: number }> => {
    const matches: Array<{ start: number; end: number }> = [];
    const words = value.split(/\s+/);
    
    words.forEach((word, wordIndex) => {
      const similarity = calculateSimilarity(word, term);
      if (similarity > 0.7) {
        const wordStart = value.indexOf(word, wordIndex > 0 ? value.indexOf(words[wordIndex - 1] || '') + (words[wordIndex - 1]?.length || 0) : 0);
        matches.push({ start: wordStart, end: wordStart + word.length });
      }
    });
    
    return matches;
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      if (matrix[0]) {
        matrix[0][j] = j;
      }
    }
    
    for (let i = 1; i <= str2.length; i++) {
      if (!matrix[i]) matrix[i] = [];
      const currentRow = matrix[i]!; // Non-null assertion since we just ensured it exists
      
      for (let j = 1; j <= str1.length; j++) {
        const prevRow = matrix[i - 1];
        const prevCell = currentRow[j - 1];
        
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          currentRow[j] = prevRow?.[j - 1] ?? 0;
        } else {
          currentRow[j] = Math.min(
            (prevRow?.[j - 1] ?? 0) + 1,
            (prevCell ?? 0) + 1,
            (prevRow?.[j] ?? 0) + 1
          );
        }
      }
    }
    
    return matrix[str2.length]?.[str1.length] ?? 0;
  };

  const mergeOverlappingMatches = (matches: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> => {
    if (matches.length === 0) return matches;
    
    const sorted = matches.sort((a, b) => a.start - b.start);
    const merged = [sorted[0]!]; // Non-null assertion since we checked length > 0
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]!; // Non-null assertion since we're within bounds
      const last = merged[merged.length - 1]!; // Non-null assertion since merged is guaranteed to have at least one element
      
      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end);
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  };

  const calculateFieldScore = (matches: Array<{ start: number; end: number }>, field: SearchField, value: string, query: string): number => {
    let score = 0;
    
    // Base score for having matches
    score += matches.length * 0.2;
    
    // Coverage score (what percentage of the field is matched)
    const totalMatchLength = matches.reduce((sum, match) => sum + (match.end - match.start), 0);
    const coverage = totalMatchLength / value.length;
    score += coverage * 0.4;
    
    // Position bonus (earlier matches score higher)
    const firstMatchPosition = Math.min(...matches.map(m => m.start));
    const positionBonus = (value.length - firstMatchPosition) / value.length;
    score += positionBonus * 0.2;
    
    // Exact match bonus
    if (value.includes(query)) {
      score += 0.3;
    }
    
    // Field type bonuses
    switch (field.type) {
      case 'email':
        if (query.includes('@') && value.includes(query)) score += 0.2;
        break;
      case 'phone':
        if (/^\d+$/.test(query) && value.includes(query)) score += 0.2;
        break;
    }
    
    return Math.min(score, 1); // Cap at 1.0
  };

  const generateSuggestions = (currentQuery: string): string[] => {
    if (!currentQuery.trim() || currentQuery.length < 2) {
      return searchHistory.slice(0, 5);
    }

    const suggestions = new Set<string>();
    
    // Add similar search terms from history
    searchHistory.forEach(term => {
      if (term.toLowerCase().includes(currentQuery.toLowerCase())) {
        suggestions.add(term);
      }
    });
    
    // Add field-based suggestions
    fields.forEach(field => {
      if (!field.searchable) return;
      
      data.forEach(item => {
        const value = getFieldValue(item, field.key);
        if (value.toLowerCase().includes(currentQuery.toLowerCase())) {
          // Suggest the full field value if it's not too long
          if (value.length <= 50) {
            suggestions.add(value);
          }
          
          // For longer values, suggest word-based matches
          const words = value.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.includes(currentQuery.toLowerCase()) && word.length >= currentQuery.length) {
              suggestions.add(word);
            }
          });
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 8);
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const results = searchItems(query);
      onResults(results, query);
      
      if (showSuggestions && query.length >= 2) {
        setSuggestions(generateSuggestions(query));
      } else {
        setSuggestions([]);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestion(-1);
    
    if (value.length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          const selectedItem = suggestions[selectedSuggestion];
          if (selectedItem) {
            selectSuggestion(selectedItem);
          }
        } else if (query.trim()) {
          addToHistory(query);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowDropdown(false);
    setSelectedSuggestion(-1);
    addToHistory(suggestion);
    inputRef.current?.focus();
  };

  const addToHistory = (searchTerm: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      return [searchTerm, ...filtered].slice(0, 10);
    });
  };

  const clearSearch = () => {
    setQuery('');
    onResults([], '');
    setShowDropdown(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            // Delay to allow clicking on suggestions
            setTimeout(() => setShowDropdown(false), 200);
          }}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 pl-12 pr-12',
            'bg-white/10 backdrop-blur-md border border-white/20',
            'rounded-xl text-white placeholder-gray-400',
            'focus:border-neon-green/50 focus:ring-2 focus:ring-neon-green/20',
            'transition-all duration-200',
            'text-sm font-medium'
          )}
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </div>
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2"
        >
          <GlassCard className="py-2 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm',
                  'hover:bg-white/10 transition-colors',
                  selectedSuggestion === index && 'bg-neon-green/20 text-neon-green'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{suggestion}</span>
                  {searchHistory.includes(suggestion) && (
                    <Badge variant="default" size="sm" className="ml-2">
                      Recent
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  );
}

export const highlightText = (text: string, highlights: Array<{ start: number; end: number }>) => {
  if (!highlights.length) return text;

  const parts = [];
  let currentIndex = 0;

  highlights.forEach(({ start, end }) => {
    // Add text before highlight
    if (start > currentIndex) {
      parts.push(text.slice(currentIndex, start));
    }
    
    // Add highlighted text
    parts.push(
      <span key={start} className="bg-neon-green/30 text-neon-green font-medium">
        {text.slice(start, end)}
      </span>
    );
    
    currentIndex = end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts;
};