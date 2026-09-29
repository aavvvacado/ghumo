import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';

const QUICK_CATEGORIES = [
  { id: '1', label: ' Forts & Palaces', query: 'Historic Forts' },
  { id: '2', label: ' Lakes & Ghats', query: 'Scenic Lakes' },
  { id: '3', label: ' Local Cuisine', query: 'Food & Street Markets' },
  { id: '4', label: ' Ancient Temples', query: 'Heritage Temples' },
  { id: '5', label: ' Bazaars & Crafts', query: 'Handicraft Bazaars' },
];

const POPULAR_DESTINATIONS = [
  { id: 'p1', name: 'Amber Palace & Fort', city: 'Jaipur', rating: '4.8' },
  { id: 'p2', name: 'Lake Pichola Sunset Ghat', city: 'Udaipur', rating: '4.9' },
  { id: 'p3', name: 'Mehrangarh Citadel', city: 'Jodhpur', rating: '4.9' },
  { id: 'p4', name: 'Dashashwamedh Aarti Ghat', city: 'Varanasi', rating: '4.9' },
];

export const SearchExpandedSheet: React.FC = () => {
  const { theme, isDark } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    performSearch,
    searchResults,
    setIsExpanded,
  } = useHome();

  // PanResponder to detect swipe down gesture to minimize
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 40) {
        setIsExpanded(false);
      }
    },
  });

  return (
    <View
      style={[
        styles.sheetContainer,
        {
          backgroundColor: isDark ? '#1E1C1A' : theme.colors.background.surface,
          borderColor: theme.colors.border.default,
        },
      ]}
    >
      {/* Draggable Handle Bar (Swipe down to minimize) */}
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={[styles.handleBar, { backgroundColor: isDark ? '#4A443F' : '#DED8D1' }]} />
      </View>

      {/* Header Row: Title + Minimize Button */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Explore Places</Text>
        <TouchableOpacity
          onPress={() => setIsExpanded(false)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.minimizeText, { color: theme.colors.text.muted }]}>Close ✕</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {QUICK_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: isDark ? '#282522' : '#F5EFE6',
                borderColor: isDark ? '#3E3833' : '#E8DFD3',
              },
            ]}
            onPress={() => {
              setSearchQuery(cat.query);
              performSearch(cat.query);
            }}
          >
            <Text style={[styles.categoryText, { color: theme.colors.text.primary }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Results or Trending Places */}
      <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
        {searchResults.length > 0 ? (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
              Search Results
            </Text>
            {searchResults.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={[styles.resultCard, { borderBottomColor: theme.colors.border.default }]}
                activeOpacity={0.7}
              >
                <View style={styles.resultHeader}>
                  <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
                    📍 {place.name}
                  </Text>
                  {place.rating && (
                    <Text style={[styles.ratingBadge, { color: theme.colors.primary.default }]}>
                      ★ {place.rating}
                    </Text>
                  )}
                </View>
                {place.category && (
                  <Text style={[styles.categoryTag, { color: theme.colors.primary.dark }]}>
                    {place.category}
                  </Text>
                )}
                {place.description && (
                  <Text style={[styles.placeDescription, { color: theme.colors.text.muted }]}>
                    {place.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
              Popular Heritage Destinations
            </Text>
            {POPULAR_DESTINATIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.resultCard, { borderBottomColor: theme.colors.border.default }]}
                onPress={() => {
                  setSearchQuery(item.name);
                  performSearch(item.name);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.resultHeader}>
                  <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
                    📍 {item.name}
                  </Text>
                  <Text style={[styles.ratingBadge, { color: theme.colors.primary.default }]}>
                    ★ {item.rating}
                  </Text>
                </View>
                <Text style={[styles.categoryTag, { color: theme.colors.text.muted }]}>
                  {item.city}, India
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    width: '100%',
    maxHeight: 380,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  handleArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  minimizeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  contentList: {
    maxHeight: 240,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingBadge: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  categoryTag: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  placeDescription: {
    fontSize: 12,
    marginTop: 3,
  },
});
