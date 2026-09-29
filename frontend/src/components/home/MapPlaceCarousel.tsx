/**
 * Map Place Carousel Component
 * Gravity downwards: Floats directly above the Dynamic Bottom Bar on the Map View.
 * Displays centered peek-paginated place cards for active search or AI prompt results.
 * Features:
 * - Centered carousel cards with slight peek affordance for previous and next items
 * - Top-right day/itinerary budget indicator
 * - Synchronized circular time slot badges for AI itinerary days
 * - Days managed directly via the bottom bar category pills
 * - Bi-directional synchronization with OpenStreetMap camera & pins
 */

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image as RNImage,
  LayoutAnimation,
  Platform,
  UIManager,
  Share,
  Linking,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { PlaceSearchResult, TravelTipItem } from '@/domain/models/search';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DayTimeItem {
  id: string;
  dayIndex: number;
  dayLabel: string;
  time: string;
  timeNumber: string;
  timePeriod: string;
  place: PlaceSearchResult;
}

export const MapPlaceCarousel: React.FC = () => {
  const { theme, isDark } = useTheme();
  const {
    searchQuery,
    searchResults,
    categorizedResults,
    activeMapCategory,
    setActiveMapCategory,
    aiResponse,
    statusMessage,
    isSearching,
    isProcessingAI,
    isMapVisible,
    isExpanded,
    selectedPlaceId,
    setSelectedPlaceId,
    submitPlaceRating,
    userRatings,
    clearResults,
  } = useHome();

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [actionCardId, setActionCardId] = useState<string | null>(null);

  const placesScrollViewRef = useRef<ScrollView>(null);
  const timeScrollViewRef = useRef<ScrollView>(null);
  const isScrollingProgrammatically = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const lastScrolledIdRef = useRef<string | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = Math.min(screenWidth - 28, 440);
  const CARD_WIDTH = Math.round(containerWidth * 0.76);
  const CARD_GAP = 10;
  const SIDE_INSET = Math.max(12, Math.round((containerWidth - CARD_WIDTH) / 2));

  // Derive selectedDayIndex from activeMapCategory (synced with bottom pills)
  const selectedDayIndex = useMemo(() => {
    if (activeMapCategory && activeMapCategory.startsWith('day_')) {
      const parsed = parseInt(activeMapCategory.replace('day_', ''), 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 0;
  }, [activeMapCategory]);

  // Helper to parse time strings: clock times (e.g. 1:30 PM) or stop numbers (1, 2, 3...)
  const parseTime = (timeStr?: string, defaultIdx: number = 0): { num: string; period: string } => {
    if (!timeStr) {
      return { num: `${defaultIdx + 1}`, period: '' };
    }

    const trimmed = timeStr.trim();

    // Check for clock format e.g. "09:00 AM", "1:30 PM", "14:00"
    const clockMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*(AM|PM)?/i);
    if (clockMatch) {
      return { num: clockMatch[1], period: (clockMatch[2] || '').toUpperCase() };
    }

    if (trimmed.toLowerCase().includes('morning')) return { num: '9:00', period: 'AM' };
    if (trimmed.toLowerCase().includes('afternoon') || trimmed.toLowerCase().includes('lunch')) return { num: '1:00', period: 'PM' };
    if (trimmed.toLowerCase().includes('evening') || trimmed.toLowerCase().includes('sunset')) return { num: '5:30', period: 'PM' };
    if (trimmed.toLowerCase().includes('night') || trimmed.toLowerCase().includes('dinner')) return { num: '8:00', period: 'PM' };

    // Check for "Stop 1", "Stop 2", "Place 3", "Spot 4", etc.
    const stopMatch = trimmed.match(/^(?:Stop|Spot|Place|Location|Activity|Item|Step)\s*(\d+)/i);
    if (stopMatch) {
      return { num: stopMatch[1], period: '' };
    }

    // Check if trimmed contains purely digits
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length > 0 && digitsOnly.length <= 3) {
      return { num: digitsOnly, period: '' };
    }

    // If it is just the word "Stop" or similar, return index + 1
    if (/^(?:Stop|Spot|Place|Location|Activity)$/i.test(trimmed)) {
      return { num: `${defaultIdx + 1}`, period: '' };
    }

    const firstWord = trimmed.split(' ')[0];
    return { num: firstWord.length > 5 ? `${defaultIdx + 1}` : firstWord, period: '' };
  };

  // Build AI Day/Time structures
  const aiItineraryDays = useMemo(() => {
    if (!aiResponse) return [];

    if (aiResponse.days && aiResponse.days.length > 0) {
      return aiResponse.days.map((day, dIdx) => {
        const activities = day.activities || day.places || [];
        const items: DayTimeItem[] = activities.map((act, actIdx) => {
          const rawTime = act.time || act.time_slot || `Stop ${actIdx + 1}`;
          const parsed = parseTime(rawTime, actIdx);
          const place: PlaceSearchResult = {
            id: `ai_d${dIdx}_p${actIdx}`,
            name: act.name || act.place || 'Curated Landmark',
            category: `Day ${day.dayNumber || day.day || dIdx + 1}`,
            type: 'attraction',
            description: act.description || act.purpose || 'Must-visit highlight of this itinerary.',
            reason: act.description || act.purpose,
            rating: 4.8,
            lat: act.lat,
            lng: act.lng,
            image: act.image || null,
          };

          return {
            id: place.id,
            dayIndex: dIdx,
            dayLabel: day.title || `Day ${day.dayNumber || day.day || dIdx + 1}`,
            time: rawTime,
            timeNumber: parsed.num,
            timePeriod: parsed.period,
            place,
          };
        });

        return {
          dayIndex: dIdx,
          dayNumber: day.dayNumber || day.day || dIdx + 1,
          dayTitle: day.title || `Day ${day.dayNumber || day.day || dIdx + 1}`,
          estimatedDayCost: day.estimated_day_cost,
          items,
        };
      });
    }

    if (aiResponse.recommended_places && aiResponse.recommended_places.length > 0) {
      const defaultTimes = ['09:30 AM', '12:00 PM', '02:30 PM', '05:00 PM', '07:30 PM'];
      const items: DayTimeItem[] = aiResponse.recommended_places.map((p, idx) => {
        const rawTime = defaultTimes[idx % defaultTimes.length];
        const parsed = parseTime(rawTime, idx);
        const place: PlaceSearchResult = {
          id: `ai_d0_p${idx}`,
          name: p.name,
          category: p.type === 'food' ? 'Food Stop' : (p.type || 'Highlight'),
          type: p.type || 'attraction',
          description: p.reason || 'Curated recommendation for this destination.',
          reason: p.reason,
          rating: 4.8,
          lat: p.lat,
          lng: p.lng,
          image: p.image || null,
        };

        return {
          id: place.id,
          dayIndex: 0,
          dayLabel: 'Day 1: Highlights',
          time: rawTime,
          timeNumber: parsed.num,
          timePeriod: parsed.period,
          place,
        };
      });

      return [
        {
          dayIndex: 0,
          dayNumber: 1,
          dayTitle: 'Day 1: Curated Highlights',
          estimatedDayCost: undefined,
          items,
        },
      ];
    }

    return [];
  }, [aiResponse]);

  // Sync active day schedule
  const activeDaySchedule = aiItineraryDays[selectedDayIndex] || aiItineraryDays[0];
  const activeDayPlaces = activeDaySchedule?.items || [];

  // Filter places for search mode
  const filteredSearchPlaces: PlaceSearchResult[] = useMemo(() => {
    if (categorizedResults) {
      if (activeMapCategory === 'food') return categorizedResults.food;
      if (activeMapCategory === 'markets') return categorizedResults.markets;
      if (activeMapCategory === 'attractions') return categorizedResults.attractions;
      if (activeMapCategory === 'hidden_gems') return categorizedResults.hidden_gems;
      return categorizedResults.places;
    }

    if (searchResults.length > 0) {
      if (activeMapCategory === 'food') return searchResults.filter((p) => p.type === 'food' || p.category?.toLowerCase().includes('food'));
      if (activeMapCategory === 'markets') return searchResults.filter((p) => p.type === 'market' || p.category?.toLowerCase().includes('market'));
      if (activeMapCategory === 'attractions') return searchResults.filter((p) => p.type === 'attraction' || (!p.type?.includes('food') && !p.type?.includes('market')));
      return searchResults;
    }

    return [];
  }, [categorizedResults, searchResults, activeMapCategory]);

  const activeTips: TravelTipItem[] = useMemo(() => {
    if (categorizedResults?.tips && categorizedResults.tips.length > 0) {
      return categorizedResults.tips;
    }
    if (aiResponse?.tips && aiResponse.tips.length > 0) {
      return aiResponse.tips.map((t) => ({ text: t, category: 'Travel Advice' }));
    }
    return [];
  }, [categorizedResults, aiResponse]);

  // Scroll smoothly to exact card index without triggering oscillation loops
  const scrollToCardIndex = useCallback((index: number, placeId?: string) => {
    if (index < 0) return;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    isScrollingProgrammatically.current = true;
    if (placeId) {
      lastScrolledIdRef.current = placeId;
    }
    placesScrollViewRef.current?.scrollTo({ x: index * (CARD_WIDTH + CARD_GAP), animated: true });
    timeScrollViewRef.current?.scrollTo({ x: Math.max(0, index * 60 - 40), animated: true });

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 450);
  }, [CARD_WIDTH, CARD_GAP]);

  // When day changes, scroll to initial position & focus first place
  useEffect(() => {
    if (activeDayPlaces.length > 0) {
      const currentSelected = activeDayPlaces.find((p) => p.id === selectedPlaceId);
      if (!currentSelected) {
        setSelectedPlaceId(activeDayPlaces[0].id);
        scrollToCardIndex(0, activeDayPlaces[0].id);
      } else {
        const idx = activeDayPlaces.indexOf(currentSelected);
        if (idx >= 0) {
          scrollToCardIndex(idx, currentSelected.id);
        }
      }
    }
  }, [selectedDayIndex]);

  // When search places or category changes, ensure selected place is focused & centered
  useEffect(() => {
    if (!aiResponse && filteredSearchPlaces.length > 0) {
      const currentSelected = filteredSearchPlaces.find((p) => p.id === selectedPlaceId);
      if (!currentSelected) {
        setSelectedPlaceId(filteredSearchPlaces[0].id);
        scrollToCardIndex(0, filteredSearchPlaces[0].id);
      } else {
        const idx = filteredSearchPlaces.indexOf(currentSelected);
        if (idx >= 0) {
          scrollToCardIndex(idx, currentSelected.id);
        }
      }
    }
  }, [activeMapCategory, filteredSearchPlaces.length]);

  // Center carousel when selectedPlaceId changes (e.g. from map pin tap, list click, or card press)
  useEffect(() => {
    if (!selectedPlaceId) return;
    if (lastScrolledIdRef.current === selectedPlaceId) return;

    if (aiResponse && activeDayPlaces.length > 0) {
      const idx = activeDayPlaces.findIndex((p) => p.id === selectedPlaceId);
      if (idx >= 0) {
        scrollToCardIndex(idx, selectedPlaceId);
      }
    } else if (filteredSearchPlaces.length > 0) {
      const idx = filteredSearchPlaces.findIndex((p) => p.id === selectedPlaceId);
      if (idx >= 0) {
        scrollToCardIndex(idx, selectedPlaceId);
      }
    }
  }, [selectedPlaceId, aiResponse, activeDayPlaces, filteredSearchPlaces, scrollToCardIndex]);

  const isTipsMode = activeMapCategory === 'tips' && activeTips.length > 0;
  const hasAiContent = Boolean(aiResponse) && aiItineraryDays.length > 0;
  const hasSearchContent = filteredSearchPlaces.length > 0 || isTipsMode;
  const hasContent = hasAiContent || hasSearchContent;
  const isVisible = isMapVisible && !isExpanded && (hasContent || isSearching || isProcessingAI);

  // Handle rating click: persists single active rating locally & syncs with backend
  const handleRatePlace = (placeId: string, star: number) => {
    submitPlaceRating(placeId, star);
  };

  if (!isVisible) {
    return null;
  }

  // Clean itinerary titles (strip prefixes like "Day-Wise Itinerary: ", "YouTube Vlog Itinerary: ")
  const cleanItineraryTitle = (rawTitle?: string, location?: string): string => {
    if (location && (!rawTitle || rawTitle.toLowerCase().includes('itinerary'))) {
      return location;
    }
    if (!rawTitle) return location || 'Trip Highlights';
    const cleaned = rawTitle
      .replace(/^(?:day[- ]wise\s+itinerary|youtube\s+vlog\s+itinerary|vlog\s+itinerary|ai\s+itinerary|itinerary)\s*:\s*/i, '')
      .replace(/^(?:day[- ]wise\s+itinerary|youtube\s+vlog\s+itinerary|vlog\s+itinerary|ai\s+itinerary|itinerary)\s+for\s+/i, '')
      .trim();
    return cleaned || location || 'Trip Highlights';
  };

  // Header Title & Location
  const headerTitle = aiResponse
    ? 'Itinerary'
    : isTipsMode
    ? `Travel Tips (${activeTips.length})`
    : `${activeMapCategory === 'all' ? 'All Places' : activeMapCategory.toUpperCase()} (${filteredSearchPlaces.length})`;

  // Subtitle location if different from main title (only for non-itinerary search places)
  const shouldShowSubLocation = Boolean(
    !aiResponse &&
    searchQuery &&
    headerTitle.toLowerCase().trim() !== searchQuery.toLowerCase().trim()
  );

  // Budget for top right header (day budget or total budget)
  const displayBudget = aiResponse
    ? (activeDaySchedule?.estimatedDayCost || aiResponse.budget_breakdown?.activities || aiResponse.budget)
    : null;

  // Explore Destination title above the carousel
  const exploreLocationTitle = aiResponse?.location || searchQuery || (filteredSearchPlaces[0]?.name ? filteredSearchPlaces[0].name : '');

  // Handle Time circle tap
  const handleSelectTimeItem = (item: DayTimeItem, index: number) => {
    setSelectedPlaceId(item.id);
    scrollToCardIndex(index, item.id);
  };

  // Handle place card click: select place, center card in carousel, and fly map to location
  const handleCardPress = (placeId: string, index?: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlaceId(placeId);
    if (typeof index === 'number') {
      scrollToCardIndex(index, placeId);
    }
  };

  // Handle place card long press to toggle Share / Visit buttons
  const handleCardLongPress = (placeId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlaceId(placeId);
    setActionCardId((prev) => (prev === placeId ? null : placeId));
  };

  // Share place with rich formatted text and Google Maps deep link (safe on web and native)
  const handleSharePlace = async (place: PlaceSearchResult, timeSlot?: string) => {
    try {
      const anyPlace = place as any;
      const lat = place.lat ?? anyPlace.latitude;
      const lng = place.lng ?? anyPlace.longitude;
      const mapsUrl = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : '';
      const timeText = timeSlot ? `\n⏰ Time: ${timeSlot}` : (place.timings ? `\n⏰ Timings: ${place.timings}` : '');
      const priceVal = place.ticket_price || anyPlace.price || anyPlace.entry_fee;
      const priceText = priceVal ? `\n🎟️ Entry: ${priceVal}` : '';
      const descText = place.description || place.reason ? `\n${place.description || place.reason}` : '';
      const locationText = place.city || anyPlace.address ? `\n📍 ${place.city || anyPlace.address}` : '';
      const mapLinkText = mapsUrl ? `\n\nExplore on Map: ${mapsUrl}` : '';

      const message = `✨ ${place.name}${locationText}${timeText}${priceText}${descText}${mapLinkText}\n\nShared via Ghumo 🌍`;

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
          try {
            await (navigator as any).share({
              title: place.name,
              text: message,
              url: mapsUrl || undefined,
            });
          } catch {
            // Dismissed or cancelled
          }
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(message);
        }
      } else {
        await Share.share(
          {
            title: place.name,
            message,
            url: mapsUrl || undefined,
          },
          {
            dialogTitle: `Share ${place.name}`,
          }
        );
      }
    } catch {
      // Ignore user cancellation
    }
  };

  // Visit place directly in device map apps using deep link coordinates
  const handleVisitPlace = async (place: PlaceSearchResult) => {
    try {
      const anyPlace = place as any;
      const lat = place.lat ?? anyPlace.latitude;
      const lng = place.lng ?? anyPlace.longitude;
      const name = encodeURIComponent(place.name || 'Location');
      if (lat && lng) {
        const scheme = Platform.select({
          ios: `maps:0,0?q=${name}@${lat},${lng}`,
          android: `geo:${lat},${lng}?q=${lat},${lng}(${name})`,
          default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        });
        const supported = await Linking.canOpenURL(scheme);
        if (supported) {
          await Linking.openURL(scheme);
        } else {
          await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
        }
      } else {
        await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${name}`);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      {/* "Explore <location>" text with drop shadow right above the carousel */}
      {Boolean(exploreLocationTitle) && (
        <View style={[styles.exploreHeaderContainer, { width: containerWidth }]} pointerEvents="none">
          <Text
            style={[
              styles.exploreHeaderText,
              isDark
                ? styles.exploreHeaderTextDark
                : [styles.exploreHeaderTextLight, { color: theme.colors.primary.default }],
            ]}
            numberOfLines={1}
          >
            {`Explore ${exploreLocationTitle}`}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.carouselWrapper,
          {
            width: containerWidth,
            backgroundColor: isDark ? 'rgba(27,26,24,0.97)' : 'rgba(255,253,249,0.97)',
            borderColor: isDark ? '#38332E' : '#E5DDD1',
          },
        ]}
      >
        {/* Top Header Row with Title, Location, Budget badge & Close button */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <View style={styles.headerTitleRow}>
              {Boolean(!aiResponse && filteredSearchPlaces[0]?.name) && (
                <Ionicons name="location-sharp" size={14} color={theme.colors.primary.default} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.statusText, { color: theme.colors.text.primary }]} numberOfLines={1}>
                {headerTitle}
              </Text>
            </View>
            {shouldShowSubLocation && (
              <View style={styles.subLocationRow}>
                <Ionicons name="location-sharp" size={11} color={theme.colors.primary.default} style={{ marginRight: 3 }} />
                <Text style={[styles.subLocationText, { color: theme.colors.primary.default }]} numberOfLines={1}>
                  {searchQuery}
                </Text>
              </View>
            )}
          </View>

          {/* Right Header Group: Day Budget + Close '✕' Button */}
          <View style={styles.headerRightGroup}>
            {Boolean(displayBudget) && (
              <View
                style={[
                  styles.budgetBadge,
                  {
                    backgroundColor: isDark ? '#38281E' : '#FCEFE7',
                    borderColor: theme.colors.primary.default,
                  },
                ]}
              >
                <FontAwesome5 name="money-bill-wave" size={10.5} color={theme.colors.primary.default} style={{ marginRight: 4 }} />
                <Text
                  style={[styles.budgetText, { color: theme.colors.primary.default }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayBudget}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={clearResults}
              style={[styles.closeButton, { backgroundColor: isDark ? '#3A3530' : '#E8E2D8' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close itinerary cards"
            >
              <Feather name="x" size={13} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= AI PROMPT VIEW: TIMELINE CHIPS + CENTERED PLACE CARDS ================= */}
        {hasAiContent ? (
          <View style={styles.aiContentContainer}>
            {/* 1. Timeline Rounded Rectangle Chips ( [1] [2] [3] or [9:00 AM] [1:30 PM] ) */}
            {activeDayPlaces.length > 0 && (
              <ScrollView
                ref={timeScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.timeScrollContainer}
                style={styles.timeScrollView}
              >
                {activeDayPlaces.map((item, idx) => {
                  const isTimeSelected = selectedPlaceId === item.id || (!selectedPlaceId && idx === 0);
                  const isPureNumber = !item.timePeriod;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.85}
                      onPress={() => handleSelectTimeItem(item, idx)}
                      style={[
                        styles.timeChip,
                        {
                          backgroundColor: isTimeSelected
                            ? theme.colors.primary.default
                            : (isDark ? '#262320' : '#F5EFE6'),
                          borderColor: isTimeSelected
                            ? '#FFFFFF'
                            : (isDark ? '#3D3732' : '#E2D9CC'),
                          shadowColor: isTimeSelected ? theme.colors.primary.default : 'transparent',
                          shadowOpacity: isTimeSelected ? 0.35 : 0,
                          shadowRadius: 6,
                          elevation: isTimeSelected ? 4 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          isPureNumber ? styles.timeChipPureNum : styles.timeChipText,
                          {
                            color: isTimeSelected ? '#FFFFFF' : theme.colors.text.primary,
                            fontWeight: isTimeSelected ? '800' : '700',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.timeNumber}
                      </Text>
                      {Boolean(item.timePeriod) && (
                        <Text
                          style={[
                            styles.timeChipPeriod,
                            {
                              color: isTimeSelected ? 'rgba(255,255,255,0.9)' : theme.colors.text.muted,
                              fontWeight: isTimeSelected ? '700' : '600',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.timePeriod}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* 2. Horizontal Centered Peek-Paginated Place Cards with Expandable Descriptions */}
            <ScrollView
              ref={placesScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              snapToAlignment="center"
              decelerationRate="fast"
              contentContainerStyle={[
                styles.scrollContainer,
                { paddingHorizontal: SIDE_INSET, gap: CARD_GAP },
              ]}
              onScrollBeginDrag={() => {
                isScrollingProgrammatically.current = false;
              }}
              onMomentumScrollEnd={(e) => {
                if (isScrollingProgrammatically.current) return;
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.max(0, Math.min(Math.round(offsetX / (CARD_WIDTH + CARD_GAP)), activeDayPlaces.length - 1));
                if (activeDayPlaces[index] && activeDayPlaces[index].id !== selectedPlaceId) {
                  lastScrolledIdRef.current = activeDayPlaces[index].id;
                  setSelectedPlaceId(activeDayPlaces[index].id);
                  timeScrollViewRef.current?.scrollTo({ x: Math.max(0, index * 60 - 40), animated: true });
                }
              }}
            >
              {activeDayPlaces.map((item, idx) => {
                const place = item.place;
                const isSelected = selectedPlaceId === place.id;
                const isCardExpanded = expandedCardId === place.id;
                const imageUri = place.image?.url || place.imageUrl;

                return (
                  <TouchableOpacity
                    key={place.id}
                    activeOpacity={0.92}
                    onPress={() => handleCardPress(place.id, idx)}
                    onLongPress={() => handleCardLongPress(place.id)}
                    delayLongPress={300}
                    style={[
                      styles.card,
                      {
                        width: CARD_WIDTH,
                        backgroundColor: isDark ? '#23211F' : '#FAF6EE',
                        borderColor: isSelected ? theme.colors.primary.default : (isDark ? '#38332E' : '#E8E0D2'),
                        borderWidth: isSelected ? 1.8 : 1,
                        transform: [{ scale: isSelected ? 1.02 : 0.98 }],
                        elevation: isSelected ? 6 : 2,
                        shadowOpacity: isSelected ? 0.25 : 0.08,
                      },
                    ]}
                  >
                    <View style={styles.cardContentRow}>
                      {/* Thumbnail Image */}
                      {imageUri ? (
                        <RNImage source={{ uri: imageUri }} style={styles.placeImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.placeholderThumb, { backgroundColor: isDark ? '#332E2A' : '#EAE3D5' }]}>
                          {place.type === 'food' ? (
                            <Ionicons name="restaurant-outline" size={24} color={isDark ? '#FFFFFF' : '#222222'} />
                          ) : place.type === 'market' ? (
                            <Feather name="shopping-bag" size={22} color={isDark ? '#FFFFFF' : '#222222'} />
                          ) : (
                            <MaterialCommunityIcons name="castle" size={24} color={isDark ? '#FFFFFF' : '#222222'} />
                          )}
                        </View>
                      )}

                      {/* Place Details & Output Description */}
                      <View style={styles.detailsCol}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.placeName, { color: theme.colors.text.primary }]} numberOfLines={1}>
                            {place.name}
                          </Text>
                          {Boolean(place.rating) && (
                            <View style={styles.ratingBadge}>
                              <Ionicons name="star" size={11} color={theme.colors.primary.default} />
                              <Text style={[styles.ratingText, { color: theme.colors.primary.default }]}>
                                {place.rating}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Empty spacing placeholder in place of removed in-card timings */}
                        <View style={styles.cardEmptySpace} />

                        {/* Description: full text always expanded */}
                        {Boolean(place.description || place.reason) && (
                          <Text style={[styles.descText, { color: theme.colors.text.secondary }]}>
                            {place.description || place.reason}
                          </Text>
                        )}

                        {/* 1-5 Star Interactive Rating: Out of the box, unfilled by default, filled on click */}
                        <View style={styles.ratingRow}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const userRating = userRatings[place.id] || 0;
                            const isFilled = star <= userRating;
                            return (
                              <TouchableOpacity
                                key={star}
                                style={styles.starBtn}
                                onPress={() => handleRatePlace(place.id, star)}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                accessibilityRole="button"
                                accessibilityLabel={`Rate ${star} stars`}
                              >
                                <Ionicons
                                  name={isFilled ? 'star' : 'star-outline'}
                                  size={16}
                                  color={isFilled ? '#E59834' : (isDark ? '#8A8177' : '#B5ABA0')}
                                />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons: Share & Visit (Always visible) */}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtnOutline,
                          {
                            backgroundColor: isDark ? '#2E2A27' : '#FFFFFF',
                            borderColor: isDark ? '#474039' : '#DED6C8',
                          },
                        ]}
                        onPress={() => handleSharePlace(place, item.time)}
                        activeOpacity={0.75}
                      >
                        <Feather name="share-2" size={13} color={theme.colors.text.primary} style={{ marginRight: 5 }} />
                        <Text style={[styles.actionBtnTextOutline, { color: theme.colors.text.primary }]}>Share</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtnFilled,
                          {
                            backgroundColor: theme.colors.primary.default,
                          },
                        ]}
                        onPress={() => handleVisitPlace(place)}
                        activeOpacity={0.8}
                      >
                        <Feather name="navigation" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.actionBtnTextFilled}>Visit</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : isTipsMode ? (
          /* ================= TIPS VIEW ================= */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingHorizontal: SIDE_INSET, gap: CARD_GAP },
            ]}
          >
            {activeTips.map((tip: TravelTipItem, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.card,
                  {
                    width: CARD_WIDTH,
                    backgroundColor: isDark ? '#1E2522' : '#EFF7F4',
                    borderColor: theme.colors.brand.heritageGreen,
                    borderWidth: 1.2,
                  },
                ]}
              >
                <View style={styles.tipCardHeader}>
                  <Ionicons name="bulb-outline" size={13} color={theme.colors.brand.heritageGreen} style={{ marginRight: 4 }} />
                  <Text style={[styles.tipCategoryBadge, { color: theme.colors.brand.heritageGreen }]}>
                    {tip.category ? tip.category.toUpperCase() : 'LOCAL TIP'}
                  </Text>
                </View>
                <Text style={[styles.tipCardText, { color: theme.colors.text.primary }]}>
                  {tip.text || tip.tip_text || ''}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : filteredSearchPlaces.length > 0 ? (
          /* ================= SEARCH RESULTS CAROUSEL ================= */
          <ScrollView
            ref={placesScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingHorizontal: SIDE_INSET, gap: CARD_GAP },
            ]}
            onScrollBeginDrag={() => {
              isScrollingProgrammatically.current = false;
            }}
            onMomentumScrollEnd={(e) => {
              if (isScrollingProgrammatically.current) return;
              const offsetX = e.nativeEvent.contentOffset.x;
              const index = Math.max(0, Math.min(Math.round(offsetX / (CARD_WIDTH + CARD_GAP)), filteredSearchPlaces.length - 1));
              if (filteredSearchPlaces[index] && filteredSearchPlaces[index].id !== selectedPlaceId) {
                lastScrolledIdRef.current = filteredSearchPlaces[index].id;
                setSelectedPlaceId(filteredSearchPlaces[index].id);
              }
            }}
          >
            {filteredSearchPlaces.map((place, idx) => {
              const isSelected = selectedPlaceId === place.id;
              const isCardExpanded = expandedCardId === place.id;
              const imageUri = place.image?.url || place.imageUrl;

              return (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.9}
                  onPress={() => handleCardPress(place.id, idx)}
                  onLongPress={() => handleCardLongPress(place.id)}
                  delayLongPress={300}
                  style={[
                    styles.card,
                    {
                      width: CARD_WIDTH,
                      backgroundColor: isDark ? '#23211F' : '#FAF6EE',
                      borderColor: isSelected ? theme.colors.primary.default : (isDark ? '#38332E' : '#E8E0D2'),
                      borderWidth: isSelected ? 1.8 : 1,
                      transform: [{ scale: isSelected ? 1.02 : 0.98 }],
                      elevation: isSelected ? 6 : 2,
                      shadowOpacity: isSelected ? 0.25 : 0.08,
                    },
                  ]}
                >
                  <View style={styles.cardContentRow}>
                    {/* Place Thumbnail */}
                    {imageUri ? (
                      <RNImage source={{ uri: imageUri }} style={styles.placeImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.placeholderThumb, { backgroundColor: isDark ? '#332E2A' : '#EAE3D5' }]}>
                        {place.type === 'food' ? (
                          <Ionicons name="restaurant-outline" size={24} color={isDark ? '#FFFFFF' : '#222222'} />
                        ) : place.type === 'market' ? (
                          <Feather name="shopping-bag" size={22} color={isDark ? '#FFFFFF' : '#222222'} />
                        ) : (
                          <Ionicons name="location-outline" size={24} color={isDark ? '#FFFFFF' : '#222222'} />
                        )}
                      </View>
                    )}

                    {/* Place Details */}
                    <View style={styles.detailsCol}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.placeName, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {place.name}
                        </Text>
                        {Boolean(place.rating || place.feedback?.averageRating) && (
                          <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={11} color={theme.colors.primary.default} />
                            <Text style={[styles.ratingText, { color: theme.colors.primary.default }]}>
                              {place.rating || place.feedback?.averageRating}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Empty spacing placeholder */}
                      <View style={styles.cardEmptySpace} />

                      {/* Description: full text always expanded */}
                      {Boolean(place.reason || place.description) && (
                        <Text style={[styles.descText, { color: theme.colors.text.secondary }]}>
                          {place.reason || place.description}
                        </Text>
                      )}

                      {/* 1-5 Star Interactive Rating: Out of the box, unfilled by default, filled on click */}
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const userRating = userRatings[place.id] || 0;
                          const isFilled = star <= userRating;
                          return (
                            <TouchableOpacity
                              key={star}
                              style={styles.starBtn}
                              onPress={() => handleRatePlace(place.id, star)}
                              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                              accessibilityRole="button"
                              accessibilityLabel={`Rate ${star} stars`}
                            >
                              <Ionicons
                                name={isFilled ? 'star' : 'star-outline'}
                                size={16}
                                color={isFilled ? '#E59834' : (isDark ? '#8A8177' : '#B5ABA0')}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons: Share & Visit (Always visible) */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtnOutline,
                        {
                          backgroundColor: isDark ? '#2E2A27' : '#FFFFFF',
                          borderColor: isDark ? '#474039' : '#DED6C8',
                        },
                      ]}
                      onPress={() => handleSharePlace(place)}
                      activeOpacity={0.75}
                    >
                      <Feather name="share-2" size={13} color={theme.colors.text.primary} style={{ marginRight: 5 }} />
                      <Text style={[styles.actionBtnTextOutline, { color: theme.colors.text.primary }]}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtnFilled,
                        {
                          backgroundColor: theme.colors.primary.default,
                        },
                      ]}
                      onPress={() => handleVisitPlace(place)}
                      activeOpacity={0.8}
                    >
                      <Feather name="navigation" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={styles.actionBtnTextFilled}>Visit</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 146, // Aligned directly above the floating pills row
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 90,
  },
  exploreHeaderContainer: {
    marginBottom: 5,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  exploreHeaderText: {
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  exploreHeaderTextDark: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  exploreHeaderTextLight: {
    textShadowColor: 'rgba(255,255,255,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  actionBtnOutline: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextOutline: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionBtnFilled: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnTextFilled: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  carouselWrapper: {
    borderRadius: 22,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  headerTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  statusText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subLocationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardEmptySpace: {
    height: 14,
    marginVertical: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  budgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 160,
    flexShrink: 1,
  },
  budgetText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  closeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiContentContainer: {
    width: '100%',
    gap: 6,
  },
  timeScrollView: {
    width: '100%',
    marginVertical: 1,
  },
  timeScrollContainer: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignItems: 'center',
  },
  timeChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 33,
  },
  timeChipText: {
    fontSize: 11.5,
    letterSpacing: -0.2,
  },
  timeChipPureNum: {
    fontSize: 13.5,
    letterSpacing: -0.2,
    fontWeight: '800',
  },
  timeChipPeriod: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
  scrollContainer: {
    paddingVertical: 2,
  },
  card: {
    borderRadius: 16,
    padding: 10,
  },
  cardContentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  placeImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  placeholderThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  descText: {
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  starBtn: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCardHeader: {
    marginBottom: 4,
  },
  tipCategoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tipCardText: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
  },
});
