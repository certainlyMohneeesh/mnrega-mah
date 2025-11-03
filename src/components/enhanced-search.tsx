"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  stateName: string;
  stateCode: string;
  type: "district" | "state";
  code: string;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showVoiceInput?: boolean;
  autoFocus?: boolean;
}

export function EnhancedSearch({
  placeholder = "Search districts or states...",
  onSearch,
  className,
  showVoiceInput = true,
  autoFocus = false,
}: EnhancedSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fuseRef = useRef<Fuse<SearchResult> | null>(null);
  const router = useRouter();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN"; // Indian English
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log('Voice recognition started');
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          console.log('Voice recognition result received');
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          
          // Show user-friendly error message based on error type
          switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
              // For Chrome/Edge on localhost, this might be a browser setting issue
              alert('⚠️ Microphone Access Blocked\n\nPlease ensure:\n1. You are using HTTPS or localhost\n2. Click the 🔒 or 🎤 icon in the address bar\n3. Set microphone permission to "Allow"\n4. Reload the page and try again\n\nIf using Chrome, check: chrome://settings/content/microphone');
              break;
            case 'no-speech':
              alert('No speech detected. Please try again and speak clearly.');
              break;
            case 'audio-capture':
              alert('No microphone found. Please check that your microphone is connected and try again.');
              break;
            case 'network':
              alert('Network error occurred. Please check your internet connection.');
              break;
            default:
              // Don't show alert for other errors (like 'aborted') as they're usually intentional
              if (event.error !== 'aborted') {
                console.warn('Speech recognition error:', event.error);
              }
          }
        };

        recognition.onend = () => {
          console.log('Voice recognition ended');
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API not supported in this browser');
      }
    }
  }, []);

  // Fetch search data and initialize Fuse.js
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const response = await fetch("/api/districts?includeStats=false&limit=1000");
        const data = await response.json();
        
        if (data.success) {
          const searchData: SearchResult[] = data.data.map((district: any) => ({
            id: district.id,
            name: district.name,
            stateName: district.stateName,
            stateCode: district.stateCode,
            type: "district" as const,
            code: district.code,
          }));

          // Initialize Fuse.js with fuzzy search options
          fuseRef.current = new Fuse(searchData, {
            keys: [
              { name: "name", weight: 2 },
              { name: "stateName", weight: 1 },
            ],
            threshold: 0.3, // More lenient matching for typos
            includeScore: true,
            minMatchCharLength: 2,
            shouldSort: true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch search data:", error);
      }
    };

    fetchSearchData();
  }, []);

  // Perform fuzzy search
  useEffect(() => {
    if (!query.trim() || !fuseRef.current) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      const searchResults = fuseRef.current!.search(query, { limit: 8 });
      setResults(searchResults.map(result => result.item));
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(-1);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle voice input
  const toggleVoiceInput = useCallback(async () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      setIsListening(false);
      return;
    }

    // First, explicitly request microphone permission via getUserMedia
    // This ensures the browser shows the permission prompt
    try {
      console.log('Requesting microphone permission...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback: try starting recognition directly
        console.log('getUserMedia not available, trying direct recognition start');
        recognitionRef.current.start();
        return;
      }

      // Request microphone access - this WILL show the browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('Microphone permission granted!');
      
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      // Now start speech recognition
      try {
        recognitionRef.current.start();
        console.log('Speech recognition started successfully');
      } catch (startError: any) {
        console.error('Error starting recognition after permission:', startError);
        if (startError.message && startError.message.includes('already started')) {
          setIsListening(true);
        } else {
          throw startError;
        }
      }
      
    } catch (error: any) {
      console.error("Error with voice input:", error);
      setIsListening(false);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('⚠️ Microphone Permission Denied\n\nTo use voice search:\n\n1. Look for the 🔒 or 🎤 icon in your browser\'s address bar\n2. Click it and set Microphone to "Allow"\n3. Refresh the page\n4. Try voice search again\n\nChrome users: Also check chrome://settings/content/microphone');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone detected. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        alert('Microphone is being used by another application. Please close other apps using the microphone and try again.');
      } else {
        alert(`Voice search error: ${error.message || 'Unknown error'}. Please check your browser settings.`);
      }
    }
  }, [isListening]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        } else if (onSearch) {
          onSearch(query);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex, query, onSearch]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Handle result selection
  const handleSelectResult = useCallback((result: SearchResult) => {
    if (result.type === "district") {
      router.push(`/district/${result.id}`);
    }
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [router]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full h-12 pl-12 pr-24 rounded-lg border-2 border-input bg-background",
            "text-base font-medium placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200",
            "touch-manipulation", // Better touch target
            isListening && "ring-2 ring-red-500 border-red-500"
          )}
          aria-label="Search districts and states"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
          role="combobox"
          aria-autocomplete="list"
        />

        {/* Right side buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Loading indicator */}
          {isLoading && (
            <div className="p-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />
            </div>
          )}

          {/* Clear button */}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="p-2 hover:bg-muted rounded-md transition-colors touch-manipulation"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </button>
          )}

          {/* Voice input button */}
          {showVoiceInput && voiceSupported && (
            <button
              onClick={toggleVoiceInput}
              className={cn(
                "p-2 rounded-md transition-colors touch-manipulation relative group",
                isListening 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "hover:bg-muted text-muted-foreground"
              )}
              aria-label={isListening ? "Stop voice input" : "Start voice input - requires microphone permission"}
              type="button"
              title={isListening ? "Click to stop voice input" : "Click to start voice search (microphone permission required)"}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Mic className="h-5 w-5" aria-hidden="true" />
              )}
              {/* Tooltip */}
              {!isListening && (
                <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  Voice Search
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          id="search-results"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-background border-2 border-input rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              id={`result-${index}`}
              role="option"
              aria-selected={selectedIndex === index}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full px-4 py-3 text-left transition-colors touch-manipulation",
                "border-b border-border last:border-b-0",
                "focus:outline-none focus:bg-muted",
                selectedIndex === index 
                  ? "bg-muted" 
                  : "hover:bg-muted"
              )}
            >
              <div className="font-medium text-foreground">{result.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {result.stateName}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border-2 border-input rounded-lg shadow-lg p-4 text-center text-muted-foreground">
          No results found for "{query}"
        </div>
      )}

      {/* Voice input hint */}
      {isListening && (
        <div className="absolute z-50 w-full mt-2 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
            <Mic className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Listening... Speak now</span>
          </div>
        </div>
      )}
    </div>
  );
}
