/**
 * Search & Discovery Domain Models
 * Aligned with frontend-guide.md and /search, /suggestions, /nearby, /hidden-gems, /tips API schemas
 */

export interface PlaceSearchQuery {
  query: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface PlaceImage {
  url?: string;
  source?: string;
  provider?: string;
  attribution?: string;
}

export interface PlaceFeedback {
  averageRating?: number;
  ratingCount?: number;
  weightedScore?: number;
}

export interface HiddenGemItem {
  name: string;
  category?: string;
  description?: string;
  confidence_score?: number;
  source?: string;
}

export interface TravelTipItem {
  id?: number;
  city?: string;
  place_id?: number;
  tip_text?: string;
  text?: string;
  category?: string;
  source?: string;
  confidence_score?: number;
}

export interface NearbyPoiItem {
  name: string;
  lat?: number;
  lng?: number;
  type?: string;
  distance_meters?: number;
}

export interface PlaceSearchResult {
  id: string;
  place_id?: number;
  name: string;
  city?: string;
  category?: string;
  type?: string;
  description?: string;
  reason?: string;
  vibe?: string;
  dietary?: string;
  must_try_cuisine?: string;
  history?: string;
  culture?: string;
  must_see?: string;
  ticket_price?: string;
  timings?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  source?: string;
  feedback?: PlaceFeedback;
  imageUrl?: string;
  image?: PlaceImage | null;
  hidden_gems?: HiddenGemItem[];
  tips?: TravelTipItem[];
  nearby_places?: NearbyPoiItem[];
}

export interface SearchCategorizedData {
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  places: PlaceSearchResult[];
  food: PlaceSearchResult[];
  markets: PlaceSearchResult[];
  attractions: PlaceSearchResult[];
  hidden_gems: PlaceSearchResult[];
  tips: TravelTipItem[];
}

export interface SearchApiResponse {
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  places?: PlaceSearchResult[];
  food?: any[];
  markets?: any[];
  attractions?: any[];
  hidden_gems?: any[];
  tips?: TravelTipItem[];
}

export interface SuggestionsResponse {
  total: number;
  suggestions: PlaceSearchResult[];
}

export interface TargetFeedbackPayload {
  user_id_or_anon: string;
  target_type: 'place' | 'itinerary';
  target_id: string;
  rating: number;
}

export interface TargetFeedbackResponse {
  status: string;
  target_type: string;
  target_id: string;
  average_rating: number;
  rating_count: number;
  weighted_score: number;
}

export interface ISearchService {
  searchPlaces(query: string): Promise<PlaceSearchResult[]>;
  searchPlacesCategorized(query: string): Promise<SearchCategorizedData>;
  getSuggestions(limit?: number, city?: string, category?: string): Promise<PlaceSearchResult[]>;
  getHiddenGems(location: string): Promise<HiddenGemItem[]>;
  getTips(city?: string, placeId?: number): Promise<TravelTipItem[]>;
  getNearby(lat: number, lng: number, radius?: number): Promise<{ places: NearbyPoiItem[]; food: NearbyPoiItem[] }>;
  submitTargetFeedback(payload: TargetFeedbackPayload): Promise<TargetFeedbackResponse>;
  searchPlacesStream(
    query: string,
    onProgress: (step: string) => void,
    onComplete: (results: PlaceSearchResult[], categorized?: SearchCategorizedData) => void,
    onError: (error: any) => void
  ): () => void;
}
