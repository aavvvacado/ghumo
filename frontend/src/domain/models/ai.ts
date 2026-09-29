/**
 * AI Itinerary & Assistant Domain Models
 * Aligned with frontend-guide.md and /itinerary, /itinerary/stream & /itinerary/video API schemas
 */

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'link';
  uri?: string;
  size?: number;
}

export interface RecommendedPlace {
  name: string;
  type?: string;
  reason?: string;
  lat?: number;
  lng?: number;
  image?: {
    url?: string;
    source?: string;
    attribution?: string;
  } | null;
}

export interface AIPromptRequest {
  prompt: string;
  attachments?: AttachmentItem[];
  location?: string;
  budget?: string;
  interests?: string[];
  videoUrl?: string;
}

export interface BudgetBreakdown {
  stay?: string;
  food?: string;
  activities?: string;
  transport?: string;
}

export interface ParsedRequirements {
  destination?: string;
  duration?: string;
  mode?: string;
  budget?: string;
  interests?: string[];
  stay_preference?: string;
}

export interface ItineraryActivity {
  time_slot?: string;
  time?: string;
  place?: string;
  name?: string;
  duration?: string;
  purpose?: string;
  description?: string;
  cost_estimate?: string;
  location?: string;
  lat?: number;
  lng?: number;
  image?: {
    url?: string;
    source?: string;
  } | null;
}

export interface ItineraryDay {
  day?: number;
  dayNumber?: number;
  title: string;
  stay_recommendation?: string;
  estimated_day_cost?: string;
  activities?: ItineraryActivity[];
  places?: ItineraryActivity[];
}

export interface AIPromptResponse {
  itineraryId?: string;
  location?: string;
  title: string;
  summary: string;
  rawItineraryText?: string;
  markdown_table?: string;
  budget?: string;
  budget_breakdown?: BudgetBreakdown;
  parsed_requirements?: ParsedRequirements;
  segregation_mode?: 'day_wise' | 'time_wise';
  recommended_places?: RecommendedPlace[];
  recommended_attractions?: RecommendedPlace[];
  tips?: string[];
  days?: ItineraryDay[];
}

export interface VideoItineraryApiResponse {
  location: string;
  itinerary: string;
  recommended_places: RecommendedPlace[];
  recommended_attractions?: RecommendedPlace[];
}

export interface IAIService {
  generateItinerary(request: AIPromptRequest): Promise<AIPromptResponse>;
  generateFromVideoUrl(url: string): Promise<AIPromptResponse>;
  generateItineraryStream(
    request: AIPromptRequest,
    onProgress: (stepData: any) => void,
    onComplete: (itinerary: AIPromptResponse) => void,
    onError: (error: any) => void
  ): () => void;
}
