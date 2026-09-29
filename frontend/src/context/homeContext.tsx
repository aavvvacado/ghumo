import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BackHandler } from 'react-native';
import * as Location from 'expo-location';
import { PlaceSearchResult, ISearchService, SearchCategorizedData, HiddenGemItem, TravelTipItem, NearbyPoiItem } from '@/domain/models/search';
import { AttachmentItem, AIPromptResponse, IAIService } from '@/domain/models/ai';
import { defaultSearchService } from '@/data/services/searchService';
import { defaultAIService } from '@/data/services/aiService';
import { cacheService } from '@/data/services/cacheService';
import { contributionService } from '@/data/services/contributionService';
import { logger } from '@/utils/logger';

export type HomeInteractionMode = 'search' | 'ai';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface NavigationHistoryEntry {
  id: string;
  type: 'search' | 'ai';
  queryOrPrompt: string;
  searchResults: PlaceSearchResult[];
  categorizedResults: SearchCategorizedData | null;
  aiResponse: AIPromptResponse | null;
  activeMapCategory: string;
  selectedPlaceId: string | null;
  isUsingCachedResult: boolean;
}

interface HomeContextType {
  activeMode: HomeInteractionMode;
  isExpanded: boolean;
  searchQuery: string;
  aiPrompt: string;
  attachments: AttachmentItem[];
  isSearching: boolean;
  isLoadingSuggestions: boolean;
  isProcessingAI: boolean;
  suggestions: PlaceSearchResult[];
  searchResults: PlaceSearchResult[];
  categorizedResults: SearchCategorizedData | null;
  activeMapCategory: string;
  searchHistory: string[];
  promptHistory: string[];
  navigationStack: NavigationHistoryEntry[];
  showExitModal: boolean;
  setShowExitModal: (show: boolean) => void;
  handleHardwareBackPress: () => boolean;
  hiddenGems: HiddenGemItem[];
  tips: TravelTipItem[];
  nearbyPlaces: NearbyPoiItem[];
  aiResponse: AIPromptResponse | null;
  statusMessage: string | null;
  userLocation: UserLocation | null;
  selectedPlaceId: string | null;
  isMapVisible: boolean;
  setIsMapVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  toggleMapVisible: () => void;
  setActiveMode: (mode: HomeInteractionMode) => void;
  setIsExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setSearchQuery: (q: string) => void;
  setAiPrompt: (p: string) => void;
  clearSearchQuery: () => void;
  clearAiPrompt: () => void;
  setActiveMapCategory: (category: string) => void;
  addAttachment: (item: AttachmentItem) => void;
  removeAttachment: (id: string) => void;
  loadSuggestions: () => Promise<void>;
  performSearch: (query?: string, forceRefresh?: boolean) => Promise<void>;
  submitAIPrompt: (prompt?: string, forceRefresh?: boolean) => Promise<void>;
  submitPlaceRating: (targetId: string, rating: number, targetType?: 'place' | 'itinerary') => Promise<void>;
  userRatings: Record<string, number>;
  isUsingCachedResult: boolean;
  refetchCurrentResults: () => Promise<void>;
  clearResults: () => void;
  requestUserLocation: () => Promise<void>;
  setSelectedPlaceId: (id: string | null) => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

interface HomeProviderProps {
  children: React.ReactNode;
  searchService?: ISearchService;
  aiService?: IAIService;
}

const DEFAULT_SEARCH_HISTORY = [
  'Hauz Khas',
  'Chandni Chowk',
  'Connaught Place',
  'Lodi Gardens',
  'Qutub Minar',
];

const DEFAULT_PROMPT_HISTORY = [
  '3-Day Royal Heritage in Jaipur covering forts and food',
  'Scenic lakeside cafes and sunsets in Udaipur',
  'Old Delhi culinary street food walk and spice bazaars',
  'Spiritual weekend trail in Varanasi and ghats',
  'Heritage architecture and art cafes in South Delhi',
];

export const HomeProvider: React.FC<HomeProviderProps> = ({
  children,
  searchService = defaultSearchService,
  aiService = defaultAIService,
}) => {
  const [activeMode, setActiveMode] = useState<HomeInteractionMode>('search');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<SearchCategorizedData | null>(null);
  const [activeMapCategory, setActiveMapCategoryState] = useState<string>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(DEFAULT_SEARCH_HISTORY);
  const [promptHistory, setPromptHistory] = useState<string[]>(DEFAULT_PROMPT_HISTORY);
  const [hiddenGems, setHiddenGems] = useState<HiddenGemItem[]>([]);
  const [tips, setTips] = useState<TravelTipItem[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPoiItem[]>([]);
  const [aiResponse, setAiResponse] = useState<AIPromptResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  const [navigationStack, setNavigationStack] = useState<NavigationHistoryEntry[]>([]);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Load persistent user contributions / ratings from local storage
  useEffect(() => {
    contributionService.getUserRatingsMap().then((ratings) => {
      if (ratings && Object.keys(ratings).length > 0) {
        setUserRatings(ratings);
      }
    });
  }, []);

  const [isUsingCachedResult, setIsUsingCachedResult] = useState<boolean>(false);
  const lastExecutedQuery = useRef<string>('');
  const lastExecutedPrompt = useRef<string>('');

  const currentSearchRequestId = useRef(0);
  const currentAIRequestId = useRef(0);

  const toggleMapVisible = () => setIsMapVisible((prev) => !prev);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);
  const clearSearchQuery = () => setSearchQuery('');
  const clearAiPrompt = () => setAiPrompt('');

  const pushToNavigationStack = (entry: NavigationHistoryEntry) => {
    setNavigationStack((prev) => {
      const filtered = prev.filter(
        (item) => !(item.type === entry.type && item.queryOrPrompt.toLowerCase().trim() === entry.queryOrPrompt.toLowerCase().trim())
      );
      const next = [...filtered, entry];
      const searches = next.filter((i) => i.type === 'search').slice(-5);
      const prompts = next.filter((i) => i.type === 'ai').slice(-5);
      return next.filter((i) => (i.type === 'search' ? searches.includes(i) : prompts.includes(i)));
    });
  };

  const restoreStackEntry = useCallback((targetState: NavigationHistoryEntry) => {
    if (targetState.type === 'search') {
      setActiveMode('search');
      setSearchQuery(targetState.queryOrPrompt);
      setSearchResults(targetState.searchResults);
      setCategorizedResults(targetState.categorizedResults);
      setAiResponse(null);
      setActiveMapCategoryState(targetState.activeMapCategory || 'all');
      const firstId = targetState.selectedPlaceId || targetState.searchResults[0]?.id || null;
      setSelectedPlaceId(firstId);
      setIsUsingCachedResult(targetState.isUsingCachedResult);
      lastExecutedQuery.current = targetState.queryOrPrompt;
    } else {
      setActiveMode('ai');
      setAiPrompt(targetState.queryOrPrompt);
      setAiResponse(targetState.aiResponse);
      setSearchResults([]);
      setCategorizedResults(null);
      setActiveMapCategoryState(targetState.activeMapCategory || 'day_0');
      setSelectedPlaceId(targetState.selectedPlaceId || 'ai_d0_p0');
      setIsUsingCachedResult(targetState.isUsingCachedResult);
      lastExecutedPrompt.current = targetState.queryOrPrompt;
    }
    setIsMapVisible(true);
  }, []);

  const handleHardwareBackPress = useCallback((): boolean => {
    // 1. If Exit Modal is already open, close it
    if (showExitModal) {
      setShowExitModal(false);
      return true;
    }

    // 2. If an expanded overlay sheet is open, close it
    if (isExpanded) {
      setIsExpanded(false);
      return true;
    }

    const hasActiveResults = searchResults.length > 0 || aiResponse !== null;

    // 3. If carousel was closed (via '✕') but we have items in navigationStack,
    // restore the top/last entry so back takes the user back to this entry
    if (!hasActiveResults && navigationStack.length > 0) {
      const lastEntry = navigationStack[navigationStack.length - 1];
      restoreStackEntry(lastEntry);
      return true;
    }

    // 4. If there is navigation history to step back into
    if (navigationStack.length > 1) {
      const updatedStack = [...navigationStack];
      updatedStack.pop(); // Remove current active state
      const targetState = updatedStack[updatedStack.length - 1];
      setNavigationStack(updatedStack);
      restoreStackEntry(targetState);
      return true;
    }

    // 5. If on the first/only result in stack, popping clears results back to clean home state
    if (navigationStack.length === 1) {
      setNavigationStack([]);
      clearResults();
      return true;
    }

    // 6. If no active results / stack is empty, show exit confirmation dialog
    setShowExitModal(true);
    return true;
  }, [isExpanded, navigationStack, showExitModal, searchResults.length, aiResponse, restoreStackEntry]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);
    return () => {
      sub.remove();
    };
  }, [handleHardwareBackPress]);

  const setActiveMapCategory = (category: string) => {
    setActiveMapCategoryState(category);
    // Auto-select the first place of this category if present
    if (categorizedResults) {
      let list: PlaceSearchResult[] = [];
      if (category === 'food') list = categorizedResults.food;
      else if (category === 'markets') list = categorizedResults.markets;
      else if (category === 'attractions') list = categorizedResults.attractions;
      else if (category === 'hidden_gems') list = categorizedResults.hidden_gems;
      else list = categorizedResults.places;

      if (list.length > 0) {
        setSelectedPlaceId(list[0].id);
      }
    }
  };

  const addAttachment = (item: AttachmentItem) => {
    setAttachments((prev) => [...prev, item]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const clearResults = () => {
    // Invalidate and cancel any in-flight async search or AI requests
    currentSearchRequestId.current += 1;
    currentAIRequestId.current += 1;
    setIsSearching(false);
    setIsProcessingAI(false);
    setIsUsingCachedResult(false);
    setSearchResults([]);
    setCategorizedResults(null);
    setActiveMapCategoryState('all');
    setAiResponse(null);
    setHiddenGems([]);
    setTips([]);
    setNearbyPlaces([]);
    setStatusMessage(null);
    setSelectedPlaceId(null);
  };

  // Ask for user geolocation and load cached history on mount
  useEffect(() => {
    requestUserLocation();
    (async () => {
      const savedSearches = await cacheService.getRecentSearches();
      if (savedSearches.length > 0) {
        setSearchHistory(savedSearches);
      }
      const savedPrompts = await cacheService.getRecentPrompts();
      if (savedPrompts.length > 0) {
        setPromptHistory(savedPrompts);
      }
    })();
  }, []);

  const requestUserLocation = async () => {
    try {
      logger.app('Requesting user geolocation permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('HomeContext', 'Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      logger.app(`User location retrieved: lat ${loc.coords.latitude}, lng ${loc.coords.longitude}`);
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err: any) {
      logger.warn('HomeContext', 'Failed to fetch user location', err?.message);
    }
  };

  const loadSuggestions = async () => {
    if (isLoadingSuggestions) return;
    setIsLoadingSuggestions(true);
    try {
      const data = await searchService.getSuggestions();
      setSuggestions(data);
    } catch (err: any) {
      logger.warn('HomeContext', 'Error fetching suggestions', err?.message);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const performSearch = async (queryToSearch?: string, forceRefresh: boolean = false) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) return;

    lastExecutedQuery.current = q;

    // Save to last 5 search history items (deduped)
    setSearchHistory((prev) => [q, ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5));

    const reqId = ++currentSearchRequestId.current;

    // Check 60-min local cache first if not forced refresh
    if (!forceRefresh) {
      const cached = await cacheService.getCachedSearch(q);
      if (cached && !cached.isExpired && reqId === currentSearchRequestId.current) {
        logger.app(`[CACHE HIT] Loaded search results for "${q}" from local cache`);
        setCategorizedResults(cached.data);
        setSearchResults(cached.data.places);
        setAiResponse(null);
        setActiveMapCategoryState('all');
        if (cached.data.tips && cached.data.tips.length > 0) setTips(cached.data.tips);
        if (cached.data.hidden_gems && cached.data.hidden_gems.length > 0) {
          setHiddenGems(cached.data.hidden_gems.map((h) => ({ name: h.name, description: h.reason || h.description })));
        }
        setStatusMessage(cached.data.places.length > 0 ? `Found ${cached.data.places.length} places for "${q}" (cached)` : 'No places found');
        setIsUsingCachedResult(true);
        setIsExpanded(false);
        setIsMapVisible(true);
        const firstPlaceId = cached.data.places.length > 0 ? cached.data.places[0].id : null;
        if (firstPlaceId) setSelectedPlaceId(firstPlaceId);

        pushToNavigationStack({
          id: `nav_s_${Date.now()}`,
          type: 'search',
          queryOrPrompt: q,
          searchResults: cached.data.places,
          categorizedResults: cached.data,
          aiResponse: null,
          activeMapCategory: 'all',
          selectedPlaceId: firstPlaceId,
          isUsingCachedResult: true,
        });
        return;
      }
    }

    setIsSearching(true);
    setIsUsingCachedResult(false);
    setStatusMessage(`Searching "${q}" across map layers...`);
    try {
      const categorized = await searchService.searchPlacesCategorized(q);
      if (reqId !== currentSearchRequestId.current) return; // Request was aborted/cancelled

      // Save fresh result to local cache
      await cacheService.saveCachedSearch(q, categorized);

      setCategorizedResults(categorized);
      setSearchResults(categorized.places);
      setAiResponse(null);
      setActiveMapCategoryState('all');

      if (categorized.tips && categorized.tips.length > 0) {
        setTips(categorized.tips);
      }
      if (categorized.hidden_gems && categorized.hidden_gems.length > 0) {
        setHiddenGems(categorized.hidden_gems.map((h) => ({ name: h.name, description: h.reason || h.description })));
      }

      setStatusMessage(categorized.places.length > 0 ? `Found ${categorized.places.length} places for "${q}"` : 'No places found');
      setIsUsingCachedResult(false);

      // Auto-close sheet when search is hit and complete
      setIsExpanded(false);
      setIsMapVisible(true);

      const firstPlaceId = categorized.places.length > 0 ? categorized.places[0].id : null;
      if (firstPlaceId) {
        setSelectedPlaceId(firstPlaceId);
      }

      pushToNavigationStack({
        id: `nav_s_${Date.now()}`,
        type: 'search',
        queryOrPrompt: q,
        searchResults: categorized.places,
        categorizedResults: categorized,
        aiResponse: null,
        activeMapCategory: 'all',
        selectedPlaceId: firstPlaceId,
        isUsingCachedResult: false,
      });
    } catch (err: any) {
      if (reqId === currentSearchRequestId.current) {
        setStatusMessage('Search error: Could not fetch places');
      }
    } finally {
      if (reqId === currentSearchRequestId.current) {
        setIsSearching(false);
      }
    }
  };

  const submitAIPrompt = async (promptToSubmit?: string, forceRefresh: boolean = false) => {
    const p = (promptToSubmit !== undefined ? promptToSubmit : aiPrompt).trim();
    if (!p) return;

    lastExecutedPrompt.current = p;

    // Save to last 5 prompt history items (deduped)
    setPromptHistory((prev) => [p, ...prev.filter((item) => item !== p)].slice(0, 5));

    const reqId = ++currentAIRequestId.current;

    // Check 60-min local cache first if not forced refresh
    if (!forceRefresh) {
      const cached = await cacheService.getCachedPrompt(p);
      if (cached && !cached.isExpired && reqId === currentAIRequestId.current) {
        logger.app(`[CACHE HIT] Loaded AI prompt result for "${p}" from local cache`);
        setCategorizedResults(null);
        setSearchResults([]);
        setActiveMapCategoryState('day_0');
        setAiResponse(cached.response);
        setStatusMessage(`Itinerary ready: ${cached.response.title} (cached)`);
        setAiPrompt('');
        setAttachments([]);
        setIsUsingCachedResult(true);
        setIsExpanded(false);
        setIsMapVisible(true);
        if (
          (cached.response.recommended_places && cached.response.recommended_places.length > 0) ||
          (cached.response.days && cached.response.days.length > 0)
        ) {
          setSelectedPlaceId('ai_d0_p0');
        }

        pushToNavigationStack({
          id: `nav_ai_${Date.now()}`,
          type: 'ai',
          queryOrPrompt: p,
          searchResults: [],
          categorizedResults: null,
          aiResponse: cached.response,
          activeMapCategory: 'day_0',
          selectedPlaceId: 'ai_d0_p0',
          isUsingCachedResult: true,
        });
        return;
      }
    }

    setIsProcessingAI(true);
    setIsUsingCachedResult(false);
    setStatusMessage('Ghumo AI is crafting your travel itinerary...');
    try {
      const response = await aiService.generateItinerary({
        prompt: p,
        attachments,
      });
      if (reqId !== currentAIRequestId.current) return; // Request was aborted/cancelled

      // Save fresh result to local cache
      await cacheService.saveCachedPrompt(p, response);

      setCategorizedResults(null);
      setSearchResults([]);
      setActiveMapCategoryState('day_0');
      setAiResponse(response);
      setStatusMessage(`Itinerary ready: ${response.title}`);
      setAiPrompt('');
      setAttachments([]);
      setIsUsingCachedResult(false);

      // Auto-close sheet when prompt is completed
      setIsExpanded(false);
      setIsMapVisible(true);

      // Auto-select first entry on carousel and map
      if (
        (response.recommended_places && response.recommended_places.length > 0) ||
        (response.days && response.days.length > 0)
      ) {
        setSelectedPlaceId('ai_d0_p0');
      }

      pushToNavigationStack({
        id: `nav_ai_${Date.now()}`,
        type: 'ai',
        queryOrPrompt: p,
        searchResults: [],
        categorizedResults: null,
        aiResponse: response,
        activeMapCategory: 'day_0',
        selectedPlaceId: 'ai_d0_p0',
        isUsingCachedResult: false,
      });
    } catch (err: any) {
      if (reqId === currentAIRequestId.current) {
        setStatusMessage('AI Generation error: Please try again');
      }
    } finally {
      if (reqId === currentAIRequestId.current) {
        setIsProcessingAI(false);
      }
    }
  };

  const refetchCurrentResults = async () => {
    if (aiResponse && lastExecutedPrompt.current) {
      await submitAIPrompt(lastExecutedPrompt.current, true);
    } else if (searchResults.length > 0 && lastExecutedQuery.current) {
      await performSearch(lastExecutedQuery.current, true);
    }
  };

  const submitPlaceRating = async (targetId: string, rating: number, targetType: 'place' | 'itinerary' = 'place') => {
    try {
      logger.app(`Submitting ${rating}-star rating for ${targetType}: ${targetId}`);
      
      // 1. Immediately update local active ratings state
      setUserRatings((prev) => ({ ...prev, [targetId]: rating }));

      // 2. Persist locally via single active rating per user (TargetFeedback) and sync with server
      const res = await contributionService.submitRating(targetId, rating, targetType, 'anon_traveler');

      const averageRating = res?.average_rating || rating;
      const ratingCount = res?.rating_count || 1;
      const weightedScore = res?.weighted_score || rating;

      // 3. Update search results and suggestions rating structures gracefully
      setSearchResults((prev) =>
        prev.map((item) =>
          item.id === targetId || item.name === targetId
            ? {
                ...item,
                rating: averageRating,
                feedback: {
                  averageRating,
                  ratingCount,
                  weightedScore,
                },
              }
            : item
        )
      );

      setSuggestions((prev) =>
        prev.map((item) =>
          item.id === targetId || item.name === targetId
            ? {
                ...item,
                rating: averageRating,
                feedback: {
                  averageRating,
                  ratingCount,
                  weightedScore,
                },
              }
            : item
        )
      );
    } catch (err: any) {
      logger.warn('HomeContext', 'Error submitting rating feedback', err?.message);
    }
  };

  const value = useMemo(
    () => ({
      activeMode,
      isExpanded,
      searchQuery,
      aiPrompt,
      attachments,
      isSearching,
      isLoadingSuggestions,
      isProcessingAI,
      suggestions,
      searchResults,
      hiddenGems,
      tips,
      nearbyPlaces,
      aiResponse,
      statusMessage,
      userLocation,
      selectedPlaceId,
      isMapVisible,
      setIsMapVisible,
      toggleMapVisible,
      setActiveMode,
      setIsExpanded,
      toggleExpanded,
      setSearchQuery,
      setAiPrompt,
      clearSearchQuery,
      clearAiPrompt,
      categorizedResults,
      activeMapCategory,
      searchHistory,
      promptHistory,
      navigationStack,
      showExitModal,
      setShowExitModal,
      handleHardwareBackPress,
      loadSuggestions,
      performSearch,
      submitAIPrompt,
      submitPlaceRating,
      userRatings,
      isUsingCachedResult,
      refetchCurrentResults,
      clearResults,
      requestUserLocation,
      setSelectedPlaceId,
      addAttachment,
      removeAttachment,
      setActiveMapCategory,
    }),
    [
      activeMode,
      isExpanded,
      searchQuery,
      aiPrompt,
      attachments,
      isSearching,
      isLoadingSuggestions,
      isProcessingAI,
      suggestions,
      searchResults,
      hiddenGems,
      tips,
      nearbyPlaces,
      aiResponse,
      statusMessage,
      userLocation,
      selectedPlaceId,
      isMapVisible,
      categorizedResults,
      activeMapCategory,
      searchHistory,
      promptHistory,
      navigationStack,
      showExitModal,
      isUsingCachedResult,
      userRatings,
      handleHardwareBackPress,
      loadSuggestions,
      performSearch,
      submitAIPrompt,
      submitPlaceRating,
      refetchCurrentResults,
      clearResults,
      requestUserLocation,
      setSelectedPlaceId,
      addAttachment,
      removeAttachment,
      setActiveMapCategory,
    ]
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

export const useHome = (): HomeContextType => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};
