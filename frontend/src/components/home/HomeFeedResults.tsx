import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image as RNImage, Platform, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';

export const HomeFeedResults: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const {
    suggestions,
    searchResults,
    hiddenGems,
    tips,
    nearbyPlaces,
    aiResponse,
    statusMessage,
    isSearching,
    isLoadingSuggestions,
    isProcessingAI,
    submitPlaceRating,
    clearResults,
  } = useHome();

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isSearching || isProcessingAI) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isSearching, isProcessingAI, pulseAnim]);

  const isLoading = isSearching || isProcessingAI;
  const hasSearchOrAi = searchResults.length > 0 || Boolean(aiResponse) || Boolean(statusMessage);
  // Disabled initial hot destinations card overlay so entire background map is visible
  const showSuggestions = false;

  if (!hasSearchOrAi && !isLoading && !isLoadingSuggestions) {
    return null;
  }

  // Dynamic top offset positioned safely below the floating HomeTopBar pill with increased margin
  const topOffset = (insets.top > 0 ? insets.top : 24) + (Platform.OS === 'android' ? 82 : 76);

  return (
    <View
      style={[
        styles.container,
        {
          top: topOffset,
          backgroundColor: isDark ? 'rgba(27,26,24,0.95)' : 'rgba(255,253,249,0.95)',
          borderColor: theme.colors.border.default,
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.statusText, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {statusMessage ||
            (isSearching
              ? 'Searching places across map layers...'
              : isProcessingAI
              ? 'Crafting itinerary...'
              : showSuggestions
              ? 'Hot Destinations & Verified Spots'
              : 'Ghumo Discovery')}
        </Text>
        {(hasSearchOrAi || isLoading) && (
          <TouchableOpacity
            onPress={clearResults}
            style={[styles.closeButton, { backgroundColor: isDark ? '#2E2B27' : '#EFE8DE' }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Close results"
          >
            <Ionicons name="close" size={15} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Animated Loading Shimmer Card */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingHeader}>
            <ActivityIndicator size="small" color={theme.colors.primary.default} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              {isProcessingAI ? 'Gemini AI is analyzing travel insights...' : 'Scanning OpenStreetMap & intelligence layer...'}
            </Text>
          </View>

          <View style={styles.skeletonList}>
            {[1, 2].map((k) => (
              <Animated.View
                key={k}
                style={[
                  styles.skeletonCard,
                  {
                    backgroundColor: isDark ? '#2D2A27' : '#F4EFE6',
                    opacity: pulseAnim,
                  },
                ]}
              >
                <View style={[styles.skeletonLine, { width: '60%', height: 14, backgroundColor: isDark ? '#3D3833' : '#E8E0D2' }]} />
                <View style={[styles.skeletonLine, { width: '40%', height: 10, marginTop: 6, backgroundColor: isDark ? '#3D3833' : '#E8E0D2' }]} />
                <View style={[styles.skeletonLine, { width: '85%', height: 10, marginTop: 6, backgroundColor: isDark ? '#3D3833' : '#E8E0D2' }]} />
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {/* ================= 1. LIVE SUGGESTIONS (GET /suggestions) ================= */}
        {showSuggestions && (
          <View style={styles.section}>
            {suggestions.map((item) => {
              const imageUri = item.image?.url || item.imageUrl;
              return (
                <View key={item.id} style={[styles.cardItem, { borderBottomColor: theme.colors.border.default }]}>
                  {imageUri ? (
                    <RNImage source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.cardInfo}>
                    <View style={styles.rowBetween}>
                      <View style={styles.inlineRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.primary.default} />
                        <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{item.name}</Text>
                      </View>
                      {Boolean(item.rating || item.feedback?.averageRating) && (
                        <View style={styles.ratingBadgeContainer}>
                          <Ionicons name="star" size={11} color={theme.colors.primary.default} />
                          <Text style={[styles.ratingBadge, { color: theme.colors.primary.default }]}>
                            {item.rating || item.feedback?.averageRating}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.itemCategory, { color: theme.colors.text.secondary }]}>
                      {item.city ? `${item.city} • ` : ''}{item.category || 'Must-Visit Spot'}
                    </Text>
                    {Boolean(item.description) && (
                      <Text style={[styles.itemDesc, { color: theme.colors.text.muted }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}

                    {/* Interactive 1-5 Star Rating Buttons (POST /target-feedback) */}
                    <View style={styles.ratingRow}>
                      <Text style={[styles.rateLabel, { color: theme.colors.text.muted }]}>Rate:</Text>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          style={[styles.starBtn, { backgroundColor: isDark ? '#2D2A27' : '#F4EFE6' }]}
                          onPress={() => submitPlaceRating(item.id, star)}
                        >
                          <Text style={{ fontSize: 11, color: '#D95338' }}>{star}★</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ================= 2. SEARCH RESULTS (GET /search) ================= */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            {searchResults.map((place) => {
              const imageUri = place.image?.url || place.imageUrl;
              return (
                <View key={place.id} style={[styles.cardItem, { borderBottomColor: theme.colors.border.default }]}>
                  {imageUri ? (
                    <RNImage source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.cardInfo}>
                    <View style={styles.rowBetween}>
                      <View style={styles.inlineRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.primary.default} />
                        <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{place.name}</Text>
                      </View>
                      {Boolean(place.rating || place.feedback?.averageRating) && (
                        <View style={styles.ratingBadgeContainer}>
                          <Ionicons name="star" size={11} color={theme.colors.primary.default} />
                          <Text style={[styles.ratingBadge, { color: theme.colors.primary.default }]}>
                            {place.rating || place.feedback?.averageRating}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.itemCategory, { color: theme.colors.text.secondary }]}>
                      {place.category || 'Travel Destination'}
                    </Text>
                    {Boolean(place.description) && (
                      <Text style={[styles.itemDesc, { color: theme.colors.text.muted }]} numberOfLines={3}>
                        {place.description}
                      </Text>
                    )}

                    {/* Chained Hidden Gems Badge if present */}
                    {place.hidden_gems && place.hidden_gems.length > 0 && (
                      <View style={[styles.badgePill, { backgroundColor: isDark ? '#2A1A10' : '#FFF3EB' }]}>
                        <Ionicons name="diamond-outline" size={12} color="#D95338" />
                        <Text style={[styles.badgeText, { color: '#D95338' }]}>
                          Offbeat: {place.hidden_gems[0].name}
                        </Text>
                      </View>
                    )}

                    {/* Chained Travel Tips Badge if present */}
                    {place.tips && place.tips.length > 0 && (
                      <View style={[styles.badgePill, { backgroundColor: isDark ? '#102A1E' : '#EBFDF3' }]}>
                        <Ionicons name="bulb-outline" size={12} color="#2E7D5B" />
                        <Text style={[styles.badgeText, { color: '#2E7D5B' }]}>
                          Tip: {place.tips[0].tip_text || place.tips[0].text}
                        </Text>
                      </View>
                    )}

                    {/* Interactive 1-5 Star Rating Buttons */}
                    <View style={styles.ratingRow}>
                      <Text style={[styles.rateLabel, { color: theme.colors.text.muted }]}>Rate:</Text>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          style={[styles.starBtn, { backgroundColor: isDark ? '#2D2A27' : '#F4EFE6' }]}
                          onPress={() => submitPlaceRating(place.id, star)}
                        >
                          <Text style={{ fontSize: 11, color: '#D95338' }}>{star}★</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ================= 3. CHAINED HIDDEN GEMS & TIPS ================= */}
        {hiddenGems.length > 0 && searchResults.length === 0 && (
          <View style={styles.secondarySection}>
            <View style={styles.inlineRow}>
              <Ionicons name="diamond-outline" size={14} color={theme.colors.primary.default} />
              <Text style={[styles.sectionHeader, { color: theme.colors.primary.default }]}>Offbeat Hidden Gems</Text>
            </View>
            {hiddenGems.map((gem, idx) => (
              <View key={idx} style={[styles.secondaryCard, { backgroundColor: isDark ? '#242220' : '#FDFBF7' }]}>
                <Text style={[styles.gemName, { color: theme.colors.text.primary }]}>{gem.name}</Text>
                {Boolean(gem.description) && (
                  <Text style={[styles.gemDesc, { color: theme.colors.text.secondary }]}>{gem.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {tips.length > 0 && searchResults.length === 0 && (
          <View style={styles.secondarySection}>
            <View style={styles.inlineRow}>
              <Ionicons name="bulb-outline" size={14} color="#2E7D5B" />
              <Text style={[styles.sectionHeader, { color: '#2E7D5B' }]}>Authenticated Travel Tips</Text>
            </View>
            {tips.map((tip, idx) => (
              <View key={idx} style={[styles.secondaryCard, { backgroundColor: isDark ? '#242220' : '#FDFBF7' }]}>
                <Text style={[styles.gemDesc, { color: theme.colors.text.primary }]}>
                  • {tip.tip_text || tip.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= 4. AI ITINERARY (POST /itinerary & /itinerary/video) ================= */}
        {aiResponse && (
          <View style={styles.itinerarySection}>
            <View style={styles.inlineRow}>
              <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary.default} />
              <Text style={[styles.itineraryTitle, { color: theme.colors.primary.default }]}>
                {aiResponse.title}
              </Text>
            </View>
            {Boolean(aiResponse.budget) && (
              <View style={[styles.inlineRow, { marginTop: 4 }]}>
                <MaterialCommunityIcons name="cash-multiple" size={13} color={theme.colors.text.secondary} />
                <Text style={[styles.budgetBadge, { color: theme.colors.text.secondary }]}>
                  Estimated Budget: {aiResponse.budget}
                </Text>
              </View>
            )}

            {/* Categorized Budget Breakdown Card */}
            {aiResponse.budget_breakdown && (
              <View style={[styles.budgetBox, { backgroundColor: isDark ? '#242220' : '#FAF6F0' }]}>
                <Text style={[styles.budgetBoxTitle, { color: theme.colors.text.primary }]}>Budget Allocation</Text>
                <View style={styles.budgetRow}>
                  {Boolean(aiResponse.budget_breakdown.stay) && (
                    <Text style={[styles.budgetItem, { color: theme.colors.text.secondary }]}>
                      Stay: {aiResponse.budget_breakdown.stay}
                    </Text>
                  )}
                  {Boolean(aiResponse.budget_breakdown.food) && (
                    <Text style={[styles.budgetItem, { color: theme.colors.text.secondary }]}>
                      Food: {aiResponse.budget_breakdown.food}
                    </Text>
                  )}
                </View>
                <View style={styles.budgetRow}>
                  {Boolean(aiResponse.budget_breakdown.activities) && (
                    <Text style={[styles.budgetItem, { color: theme.colors.text.secondary }]}>
                      Activities: {aiResponse.budget_breakdown.activities}
                    </Text>
                  )}
                  {Boolean(aiResponse.budget_breakdown.transport) && (
                    <Text style={[styles.budgetItem, { color: theme.colors.text.secondary }]}>
                      Transport: {aiResponse.budget_breakdown.transport}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Structured Itinerary Days / Time Slots */}
            {aiResponse.days && aiResponse.days.length > 0 && (
              <View style={styles.daysContainer}>
                {aiResponse.days.map((dayItem, dIdx) => (
                  <View key={dIdx} style={[styles.dayCard, { borderColor: theme.colors.border.default }]}>
                    <Text style={[styles.dayTitle, { color: theme.colors.text.primary }]}>
                      {dayItem.title || `Day ${dayItem.dayNumber || dIdx + 1}`}
                    </Text>
                    {Boolean(dayItem.stay_recommendation) && (
                      <Text style={[styles.stayRecommendation, { color: theme.colors.text.secondary }]}>
                        Stay: {dayItem.stay_recommendation}
                      </Text>
                    )}
                    {dayItem.activities &&
                      dayItem.activities.map((act, aIdx) => (
                        <View key={aIdx} style={styles.activityRow}>
                          <Text style={[styles.actTime, { color: theme.colors.primary.default }]}>
                            {act.time || act.time_slot || `Stop ${aIdx + 1}`}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.actName, { color: theme.colors.text.primary }]}>
                              {act.name || act.place}
                            </Text>
                            {Boolean(act.description || act.purpose) && (
                              <Text style={[styles.actDesc, { color: theme.colors.text.muted }]}>
                                {act.description || act.purpose}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                  </View>
                ))}
              </View>
            )}

            {/* Markdown Table Format (if provided) */}
            {Boolean(aiResponse.markdown_table) && (
              <View style={[styles.tableBox, { backgroundColor: isDark ? '#1C1A18' : '#F9F5EE' }]}>
                <Text style={[styles.tableBoxTitle, { color: theme.colors.text.primary }]}>Plan Overview</Text>
                <Text style={[styles.tableText, { color: theme.colors.text.secondary }]}>
                  {aiResponse.markdown_table}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 440,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    maxHeight: 340,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    gap: 10,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 12,
    gap: 10,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonList: {
    gap: 8,
    marginTop: 4,
  },
  skeletonCard: {
    padding: 12,
    borderRadius: 12,
  },
  skeletonLine: {
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  scrollList: {
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  cardItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  ratingBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemCategory: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '600',
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 2,
  },
  starBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  secondarySection: {
    marginTop: 10,
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryCard: {
    padding: 10,
    borderRadius: 10,
  },
  gemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  gemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  itinerarySection: {
    marginTop: 6,
    gap: 8,
  },
  itineraryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  budgetBadge: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  budgetBox: {
    padding: 10,
    borderRadius: 12,
    gap: 6,
  },
  budgetBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItem: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  daysContainer: {
    gap: 8,
    marginTop: 4,
  },
  dayCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  dayTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stayRecommendation: {
    fontSize: 11.5,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actTime: {
    fontSize: 11.5,
    fontWeight: '700',
    width: 68,
  },
  actName: {
    fontSize: 12,
    fontWeight: '600',
  },
  actDesc: {
    fontSize: 11.5,
  },
  tableBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  tableBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  tableText: {
    fontFamily: typeof Platform !== 'undefined' && Platform?.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    lineHeight: 15,
  },
});
