/**
 * Search View Content Component
 * - Displays header with close button, full search input, quick categories,
 *   Ghumo AI Travel Planner starter trip inspirations, and destination results.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ScrollView, GestureDetector, type PanGesture } from 'react-native-gesture-handler';
import Svg, { Circle, Line } from 'react-native-svg';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { ProcessingOutline } from './ProcessingOutline';
import { SAMPLE_PLACES, SAMPLE_ITINERARIES, querySamplePlaces } from '@/data/sampleDatasets';

interface QuickCategoryItem {
  id: string;
  label: string;
  query: string;
  iconName: string;
  iconPack: 'Ionicons' | 'Feather' | 'MaterialCommunityIcons' | 'FontAwesome5';
}

const QUICK_CATEGORIES: QuickCategoryItem[] = [
  { id: '1', label: 'Forts & Palaces', query: 'Fort', iconName: 'landmark', iconPack: 'FontAwesome5' },
  { id: '2', label: 'Street Food & Chaat', query: 'Food', iconName: 'restaurant-outline', iconPack: 'Ionicons' },
  { id: '3', label: 'Flea Markets & Bazaars', query: 'Market', iconName: 'shopping-bag', iconPack: 'Feather' },
  { id: '4', label: 'Spiritual Shrines', query: 'Gurudwara', iconName: 'temple-hindu', iconPack: 'MaterialCommunityIcons' },
  { id: '5', label: 'Monuments & Heritage', query: 'Heritage', iconName: 'arch', iconPack: 'MaterialCommunityIcons' },
];

interface SearchViewProps {
  onClose: () => void;
  headerGesture?: PanGesture;
}

export const SearchView: React.FC<SearchViewProps> = ({ onClose, headerGesture }) => {
  const { theme, isDark } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    performSearch,
    searchResults,
    categorizedResults,
    searchHistory,
    isSearching,
    setActiveMode,
    setAiPrompt,
    submitAIPrompt,
    setSelectedPlaceId,
  } = useHome();

  const searchInputRef = useRef<TextInput>(null);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handlePlanWithAI = (item: (typeof SAMPLE_ITINERARIES)[0]) => {
    onClose();
    setActiveMode('ai');
    setAiPrompt(item.summary);
    submitAIPrompt(item.summary);
  };

  const hasProcessedSearch = searchResults.length > 0 || Boolean(categorizedResults);

  // Header Zone 1 (Title, Close button, Search box)
  const headerContent = (
    <View style={styles.zone1HeaderArea}>
      {/* Header Row: Title + Close Button */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Search & Explore
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: isDark ? '#2B2724' : '#EFE9DE' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close search view"
        >
          <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Embedded Search Input Field with Rotating Accent Outline */}
      <View style={styles.searchInputContainer}>
        <ProcessingOutline isProcessing={isSearching} borderRadius={24} strokeWidth={2.0}>
          <View
            style={[
              styles.searchInputWrapper,
              {
                backgroundColor: isDark ? '#25221F' : '#F6F1E9',
                borderColor: isSearching ? 'transparent' : theme.colors.border.default,
              },
            ]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.muted} strokeWidth="2.2" strokeLinecap="round">
              <Circle cx="11" cy="11" r="8" />
              <Line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Svg>

            <TextInput
              ref={searchInputRef}
              style={[styles.textInput, { color: theme.colors.text.primary }]}
              placeholder="Search destinations, forts, cafes..."
              placeholderTextColor={theme.colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoCapitalize="words"
              selectionColor={theme.colors.primary.default}
            />

            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                onPress={clearSearchQuery}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Clear search text"
              >
                <Ionicons name="backspace-outline" size={17} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </ProcessingOutline>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Zone 1: Header / Non-scrollable sheet drag area */}
      {headerGesture ? (
        <GestureDetector gesture={headerGesture}>
          {headerContent}
        </GestureDetector>
      ) : (
        headerContent
      )}

      {/* Zone 2: Horizontal Quick Category Chips (ONLY WHEN NO SEARCH IS PROCESSED - DEFAULT VIEW) */}
      {!hasProcessedSearch && (
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            contentContainerStyle={styles.categoryContainer}
          >
            {QUICK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isDark ? '#2A2623' : '#F3ECE1',
                    borderColor: isDark ? '#3D3732' : '#E5DDD1',
                  },
                ]}
                onPress={() => {
                  setSearchQuery(cat.query);
                  performSearch(cat.query);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.chipRow}>
                  {cat.iconPack === 'Ionicons' && (
                    <Ionicons name={cat.iconName as any} size={13} color={theme.colors.text.primary} />
                  )}
                  {cat.iconPack === 'Feather' && (
                    <Feather name={cat.iconName as any} size={12} color={theme.colors.text.primary} />
                  )}
                  {cat.iconPack === 'FontAwesome5' && (
                    <FontAwesome5 name={cat.iconName as any} size={11} color={theme.colors.text.primary} />
                  )}
                  {cat.iconPack === 'MaterialCommunityIcons' && (
                    <MaterialCommunityIcons name={cat.iconName as any} size={13} color={theme.colors.text.primary} />
                  )}
                  <Text style={[styles.categoryText, { color: theme.colors.text.primary }]}>
                    {cat.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Zone 3: Main Scrollable Content */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={[styles.contentInner, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        bounces={true}
        overScrollMode="always"
      >
        {/* Live Search Results if Available */}
        {hasProcessedSearch && (
          <View style={styles.resultsSection}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
              Search Results ({searchResults.length})
            </Text>
            {searchResults.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark ? '#24211E' : '#F9F5EE',
                    borderColor: theme.colors.border.default,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedPlaceId(place.id);
                  onClose();
                }}
              >
                <View style={styles.resultHeader}>
                  <View style={styles.titleWithIcon}>
                    {place.type === 'food' ? (
                      <Ionicons name="restaurant-outline" size={15} color={theme.colors.primary.default} />
                    ) : place.type === 'market' ? (
                      <Feather name="shopping-bag" size={14} color={theme.colors.primary.default} />
                    ) : (
                      <Ionicons name="location-outline" size={15} color={theme.colors.primary.default} />
                    )}
                    <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
                      {place.name}
                    </Text>
                  </View>
                  {place.rating && (
                    <View style={styles.ratingBadgeContainer}>
                      <Ionicons name="star" size={11} color={theme.colors.primary.default} />
                      <Text style={[styles.ratingBadge, { color: theme.colors.primary.default }]}>
                        {place.rating}
                      </Text>
                    </View>
                  )}
                </View>
                {place.category && (
                  <Text style={[styles.placeCategory, { color: theme.colors.primary.dark }]}>
                    {place.category}
                  </Text>
                )}
                {place.vibe && (
                  <View style={styles.inlineInfoRow}>
                    <Ionicons name="sparkles-outline" size={12} color={theme.colors.primary.default} />
                    <Text style={[styles.vibeText, { color: theme.colors.primary.default }]}>
                      Vibe: {place.vibe}
                    </Text>
                  </View>
                )}
                {place.reason ? (
                  <Text style={[styles.placeDesc, { color: theme.colors.text.secondary }]}>
                    {place.reason}
                  </Text>
                ) : place.description ? (
                  <Text style={[styles.placeDesc, { color: theme.colors.text.muted }]}>
                    {place.description}
                  </Text>
                ) : null}
                {place.must_try_cuisine && (
                  <View style={styles.inlineInfoRow}>
                    <Ionicons name="restaurant-outline" size={12} color={theme.colors.primary.default} />
                    <Text style={[styles.placeDesc, { color: theme.colors.primary.default }]}>
                      Must-Try: {place.must_try_cuisine}
                    </Text>
                  </View>
                )}
                {(place.ticket_price || place.timings) && (
                  <View style={styles.metaRow}>
                    {place.ticket_price && (
                      <View style={[styles.metaBadge, { backgroundColor: isDark ? '#2E2B27' : '#EFE9DE' }]}>
                        <Ionicons name="ticket-outline" size={12} color={theme.colors.text.secondary} />
                        <Text style={[styles.metaBadgeText, { color: theme.colors.text.secondary }]}>
                          {place.ticket_price}
                        </Text>
                      </View>
                    )}
                    {place.timings && (
                      <View style={[styles.metaBadge, { backgroundColor: isDark ? '#2E2B27' : '#EFE9DE' }]}>
                        <Feather name="clock" size={11} color={theme.colors.text.secondary} />
                        <Text style={[styles.metaBadgeText, { color: theme.colors.text.secondary }]}>
                          {place.timings}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {place.must_see && (
                  <View style={styles.inlineInfoRow}>
                    <Ionicons name="sparkles-outline" size={12} color={theme.colors.primary.default} />
                    <Text style={[styles.mustSeeText, { color: theme.colors.primary.default }]}>
                      Must-See: {place.must_see}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search History (ALWAYS DISPLAYED: directly below search bar when no results, or below results when search is active) */}
        {searchHistory.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeadingRow}>
              <Feather name="clock" size={13} color={theme.colors.text.secondary} />
              <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
                Recent Searches
              </Text>
            </View>
            <View style={styles.historyList}>
              {searchHistory.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.historyItem,
                    {
                      backgroundColor: isDark ? '#24211E' : '#FAF6EE',
                      borderColor: isDark ? '#36312C' : '#E8E1D5',
                    },
                  ]}
                  onPress={() => {
                    setSearchQuery(item);
                    performSearch(item);
                  }}
                  activeOpacity={0.75}
                >
                  <Feather name="search" size={13} color={theme.colors.text.muted} />
                  <Text style={[styles.historyText, { color: theme.colors.text.primary }]} numberOfLines={1}>
                    {item}
                  </Text>
                  <Feather name="arrow-up-right" size={16} color={theme.colors.primary.default} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Ghumo AI Travel Planner Section from Real Datasets */}
        <View style={styles.plannerSection}>
          <View style={styles.plannerHeaderRow}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
              Ghumo AI Travel Planner
            </Text>
            <Text style={[styles.subLabel, { color: theme.colors.text.muted }]}>
              Starter Trip Inspirations
            </Text>
          </View>

          {SAMPLE_ITINERARIES.map((item) => (
            <View
              key={item.id}
              style={[
                styles.inspirationCard,
                {
                  backgroundColor: isDark ? '#24211E' : '#F6F0E6',
                  borderColor: isDark ? '#36302B' : '#E6DEC1',
                },
              ]}
            >
              <View style={styles.cardTopRow}>
                <Feather name="map-pin" size={14} color={theme.colors.primary.default} />
                <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                  {item.title}
                </Text>
              </View>
              {item.budget && (
                <View style={styles.inlineInfoRow}>
                  <MaterialCommunityIcons name="cash-multiple" size={13} color={theme.colors.primary.default} />
                  <Text style={[styles.budgetText, { color: theme.colors.primary.default }]}>
                    {item.budget}
                  </Text>
                </View>
              )}
              <Text style={[styles.cardBody, { color: theme.colors.text.secondary }]}>
                {item.summary}
              </Text>
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.cardActionBtn, { borderColor: theme.colors.primary.default }]}
                  onPress={() => {
                    setSearchQuery(item.location);
                    performSearch(item.location);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cardActionBtnText, { color: theme.colors.primary.default }]}>
                    Explore Places
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cardActionBtnFill, { backgroundColor: theme.colors.primary.default }]}
                  onPress={() => handlePlanWithAI(item as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chipRow}>
                    <Text style={styles.cardActionBtnFillText}>Plan Itinerary</Text>
                    <Ionicons name="sparkles-outline" size={13} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Curated Heritage & Food Destinations from Datasets */}
        <View style={styles.popularSection}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
            Heritage & Food Spots (Old & New Delhi)
          </Text>
          {SAMPLE_PLACES.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.destinationCard,
                {
                  backgroundColor: isDark ? '#24211E' : '#F9F5EE',
                  borderColor: theme.colors.border.default,
                },
              ]}
              onPress={() => {
                setSearchQuery(item.name);
                performSearch(item.name);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.resultHeader}>
                <View style={styles.titleWithIcon}>
                  <Ionicons name="location-outline" size={14} color={theme.colors.primary.default} />
                  <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.ratingBadgeContainer}>
                  <Ionicons name="star" size={11} color={theme.colors.primary.default} />
                  <Text style={[styles.ratingBadge, { color: theme.colors.primary.default }]}>
                    {item.rating}
                  </Text>
                </View>
              </View>
              <Text style={[styles.placeCategory, { color: theme.colors.text.muted }]}>
                {item.city} • {item.category}
              </Text>
              {item.reason && (
                <Text style={[styles.placeDesc, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                  {item.reason}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
  },
  zone1HeaderArea: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginTop: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchInputContainer: {
    marginHorizontal: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    height: '100%',
  },
  clearBtn: {
    padding: 2,
  },
  clearBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categorySection: {
    marginTop: 12,
    marginBottom: 4,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
    marginTop: 8,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 16,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  resultsSection: {
    gap: 8,
  },
  resultCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  ratingBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inlineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  placeName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  ratingBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  placeCategory: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  placeDesc: {
    fontSize: 12.5,
    marginTop: 3,
    lineHeight: 16,
  },
  plannerSection: {
    marginTop: 6,
  },
  plannerHeaderRow: {
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
  inspirationCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    flex: 1,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  cardActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
  },
  cardActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActionBtnFill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  cardActionBtnFillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  popularSection: {
    marginTop: 6,
    gap: 8,
  },
  destinationCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  metaBadgeText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  mustSeeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 16,
  },
  vibeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  historySection: {
    marginTop: 4,
    marginBottom: 4,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  historyIcon: {
    fontSize: 14,
  },
  historyText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
  },
  historyActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
