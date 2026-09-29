/**
 * Prompt View Content Component
 * - Displays header with close button, dynamic AI prompt input, attachment picker,
 *   starter trip inspirations, and generated day-by-day travel itineraries.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Share,
  Platform,
} from 'react-native';
import { ScrollView, GestureDetector, type PanGesture } from 'react-native-gesture-handler';
import Svg, { Path, Line } from 'react-native-svg';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { AttachmentPickerModal } from './AttachmentPickerModal';
import { ProcessingOutline } from './ProcessingOutline';
import { SAMPLE_ITINERARIES } from '@/data/sampleDatasets';

interface StarterPromptItem {
  id: string;
  title: string;
  prompt: string;
  iconName: string;
  iconPack: 'Ionicons' | 'Feather' | 'MaterialCommunityIcons' | 'FontAwesome5';
}

const STARTER_PROMPTS: StarterPromptItem[] = [
  { id: '1', title: SAMPLE_ITINERARIES[0].title, prompt: SAMPLE_ITINERARIES[0].summary, iconName: 'map-pin', iconPack: 'Feather' },
  { id: '2', title: SAMPLE_ITINERARIES[1].title, prompt: SAMPLE_ITINERARIES[1].summary, iconName: 'restaurant-outline', iconPack: 'Ionicons' },
  { id: '3', title: '3-Day Royal Heritage in Jaipur', prompt: 'Create a 3-day royal heritage itinerary for Jaipur covering forts, traditional dining, and local bazaars.', iconName: 'landmark', iconPack: 'FontAwesome5' },
  { id: '4', title: 'Lakeside Cafes & Sunsets in Udaipur', prompt: 'Find the most scenic lakeside cafes, sunset viewpoints, and boat ride spots in Udaipur.', iconName: 'water-outline', iconPack: 'Ionicons' },
];

interface PromptViewProps {
  onClose: () => void;
  headerGesture?: PanGesture;
}

export const PromptView: React.FC<PromptViewProps> = ({ onClose, headerGesture }) => {
  const { theme, isDark } = useTheme();
  const {
    aiPrompt,
    setAiPrompt,
    submitAIPrompt,
    aiResponse,
    isProcessingAI,
    promptHistory,
    attachments,
    removeAttachment,
    clearAiPrompt,
  } = useHome();

  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [selectedHistoryPrompt, setSelectedHistoryPrompt] = useState<string | null>(null);
  const promptInputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (aiPrompt.trim()) {
      submitAIPrompt(aiPrompt);
    }
  };

  const handleShareItinerary = async () => {
    if (!aiResponse) return;
    try {
      let text = `🗺️ *${aiResponse.title}*\n`;
      if (aiResponse.location) text += `📍 Destination: ${aiResponse.location}\n`;
      if (aiResponse.budget) text += `💰 Estimated Budget: ${aiResponse.budget}\n`;
      if (aiResponse.summary) text += `\n📝 ${aiResponse.summary}\n`;

      if (aiResponse.days && aiResponse.days.length > 0) {
        text += `\n━━━━━━━━━━━━━━━━━━━━\n📅 *DAY-BY-DAY ITINERARY*\n━━━━━━━━━━━━━━━━━━━━\n`;
        aiResponse.days.forEach((day: any) => {
          const dayNum = day.dayNumber || day.day;
          text += `\n🔹 *Day ${dayNum}: ${day.title || ''}*\n`;
          if (day.estimatedDayCost) text += `   💵 Day Budget: ${day.estimatedDayCost}\n`;
          const places = day.places || day.activities || [];
          places.forEach((p: any, idx: number) => {
            const time = p.time || p.time_slot || `Stop ${idx + 1}`;
            const name = p.name || p.place || '';
            const desc = p.description || p.reason || p.activity || '';
            const cost = p.cost || p.price || p.entry_fee || '';
            text += `   • [${time}] ${name}\n`;
            if (desc) text += `     ${desc}\n`;
            if (cost) text += `     Entry/Cost: ${cost}\n`;
          });
        });
      }

      if (aiResponse.recommended_places && aiResponse.recommended_places.length > 0) {
        text += `\n━━━━━━━━━━━━━━━━━━━━\n⭐ *RECOMMENDED SPOTS*\n━━━━━━━━━━━━━━━━━━━━\n`;
        aiResponse.recommended_places.forEach((p: any) => {
          text += `\n• *${p.name}* (${p.type || 'Attraction'})\n`;
          if (p.reason || p.description) text += `  ${p.reason || p.description}\n`;
        });
      }

      if (aiResponse.tips && aiResponse.tips.length > 0) {
        text += `\n━━━━━━━━━━━━━━━━━━━━\n💡 *TRAVEL TIPS*\n━━━━━━━━━━━━━━━━━━━━\n`;
        aiResponse.tips.forEach((tip: string) => {
          text += `• ${tip}\n`;
        });
      }

      text += `\n✨ Curated with Ghumo AI Travel App 🌍`;

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
          try {
            await (navigator as any).share({
              title: aiResponse.title || 'Ghumo Itinerary',
              text,
            });
          } catch {
            // Dismissed or cancelled
          }
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await Share.share(
          {
            title: aiResponse.title || 'Trip Itinerary',
            message: text,
          },
          {
            dialogTitle: 'Share Trip Itinerary',
          }
        );
      }
    } catch {
      // Ignore user cancellation
    }
  };

  // Header Zone 1 (Title, Close button, Input box, Attachments)
  const headerContent = (
    <View style={styles.zone1HeaderArea}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Ghumo AI Travel Planner
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: isDark ? '#2B2724' : '#EFE9DE' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close prompt view"
        >
          <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Embedded Dynamic Prompt Input Field with Rotating Accent Outline */}
      <View style={styles.promptInputContainer}>
        <ProcessingOutline isProcessing={isProcessingAI} borderRadius={25} strokeWidth={2.0}>
          <View
            style={[
              styles.promptInputWrapper,
              {
                backgroundColor: isDark ? '#25221F' : '#F6F1E9',
                borderColor: isProcessingAI ? 'transparent' : theme.colors.primary.default,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.plusButton, { backgroundColor: isDark ? '#2E2B27' : '#EBE4D8' }]}
              activeOpacity={0.7}
              onPress={() => setAttachmentModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Add attachment or media"
            >
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary.default} strokeWidth="2.5" strokeLinecap="round">
                <Line x1="12" y1="5" x2="12" y2="19" />
                <Line x1="5" y1="12" x2="19" y2="12" />
              </Svg>
            </TouchableOpacity>

            <TextInput
              ref={promptInputRef}
              style={[styles.textInput, { color: theme.colors.text.primary }]}
              placeholder="Ask Ghumo AI to plan a trip, itinerary, or cafe list..."
              placeholderTextColor={theme.colors.text.muted}
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
              scrollEnabled={false}
              autoCapitalize="sentences"
              selectionColor={theme.colors.primary.default}
            />

            {aiPrompt.trim().length > 0 && (
              <TouchableOpacity
                onPress={clearAiPrompt}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Clear prompt text"
              >
                <Ionicons name="backspace-outline" size={17} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: aiPrompt.trim().length > 0 ? theme.colors.primary.default : (isDark ? '#35312D' : '#DED8CE'),
                },
              ]}
              onPress={handleSubmit}
              disabled={!aiPrompt.trim() || isProcessingAI}
              activeOpacity={0.8}
            >
              {isProcessingAI ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M5 12h14" />
                  <Path d="m12 5 7 7-7 7" />
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </ProcessingOutline>
      </View>

      {/* Active Attachments list if present */}
      {attachments.length > 0 && (
        <View style={styles.attachmentList}>
          {attachments.map((att) => (
            <View
              key={att.id}
              style={[styles.attachmentBadge, { backgroundColor: isDark ? '#2E2B27' : '#F4EEE4' }]}
            >
              <Feather name="paperclip" size={12} color={theme.colors.primary.default} />
              <Text style={[styles.attachmentText, { color: theme.colors.primary.default }]}>
                {att.name}
              </Text>
              <TouchableOpacity onPress={() => removeAttachment(att.id)}>
                <Text style={styles.removeAttText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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

      {/* Zone 3: Main Scrollable Content: Generated Itinerary or Starter Inspirations */}
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

        {aiResponse && (
          <View style={[styles.itineraryCard, { backgroundColor: isDark ? '#24211E' : '#F9F4EB', borderColor: theme.colors.primary.default }]}>
            <View style={styles.itineraryHeader}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary.default} />
                <Text style={[styles.itineraryTitle, { color: theme.colors.primary.default }]}>
                  {aiResponse.title}
                </Text>
              </View>
              <View style={styles.itineraryHeaderRight}>
                {aiResponse.budget && (
                  <View style={[styles.budgetBadgeContainer, { backgroundColor: isDark ? '#2B2520' : '#F7EBE2' }]}>
                    <MaterialCommunityIcons name="cash-multiple" size={13} color={theme.colors.primary.default} />
                    <Text style={[styles.budgetBadge, { color: theme.colors.primary.default }]}>
                      {aiResponse.budget}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.shareItineraryBtn,
                    {
                      backgroundColor: theme.colors.primary.default,
                    },
                  ]}
                  onPress={handleShareItinerary}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Share complete itinerary"
                >
                  <Feather name="share-2" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.shareItineraryText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.itinerarySummary, { color: theme.colors.text.primary }]}>
              {aiResponse.summary}
            </Text>

            {/* Recommended Places Section (e.g., from /itinerary/video) */}
            {aiResponse.recommended_places && aiResponse.recommended_places.length > 0 && (
              <View style={styles.recommendedSection}>
                <View style={styles.sectionHeadingRow}>
                  <Ionicons name="location-outline" size={14} color={theme.colors.text.secondary} />
                  <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
                    Recommended Spots & Food Stops
                  </Text>
                </View>
                {aiResponse.recommended_places.map((place, pIdx) => (
                  <View
                    key={pIdx}
                    style={[
                      styles.recPlaceCard,
                      {
                        backgroundColor: isDark ? '#1F1D1A' : '#FFFFFF',
                        borderColor: theme.colors.border.default,
                      },
                    ]}
                  >
                    <View style={styles.recPlaceHeader}>
                      <View style={styles.titleWithIcon}>
                        {place.type === 'food' ? (
                          <Ionicons name="restaurant-outline" size={14} color={theme.colors.primary.default} />
                        ) : (
                          <Ionicons name="location-outline" size={14} color={theme.colors.primary.default} />
                        )}
                        <Text style={[styles.recPlaceName, { color: theme.colors.text.primary }]}>
                          {place.name}
                        </Text>
                      </View>
                      {place.type && (
                        <Text style={[styles.recPlaceType, { color: theme.colors.primary.default }]}>
                          {place.type.toUpperCase()}
                        </Text>
                      )}
                    </View>
                    {place.reason && (
                      <Text style={[styles.recPlaceReason, { color: theme.colors.text.muted }]}>
                        {place.reason}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Day-by-Day breakdown matching the timeline layout */}
            {aiResponse.days && aiResponse.days.length > 0 && aiResponse.days.map((day) => (
              <View
                key={day.dayNumber || day.day}
                style={[
                  styles.daySection,
                  {
                    backgroundColor: isDark ? '#1F1D1A' : '#FFFFFF',
                    borderColor: isDark ? '#36302B' : '#E6DEC1',
                  },
                ]}
              >
                <Text style={[styles.dayTitle, { color: theme.colors.primary.default }]}>
                  Day {day.dayNumber || day.day}: {day.title}
                </Text>
                {(day.places || day.activities || []).map((p: any, idx: number) => {
                  const rawTime = p.time || p.time_slot || `Stop ${idx + 1}`;
                  const formattedTime = rawTime.includes(' - ') ? rawTime.replace(' - ', '\n- ') : rawTime;

                  return (
                    <View key={idx} style={styles.placeItemRow}>
                      <Text style={[styles.timeBadge, { color: theme.colors.text.muted }]}>
                        {formattedTime}
                      </Text>
                      <View style={styles.placeItemDetails}>
                        <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
                          {p.name || p.place}
                        </Text>
                        {Boolean(p.description || p.purpose) && (
                          <Text style={[styles.placeDescription, { color: theme.colors.text.secondary }]}>
                            {p.description || p.purpose}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}

            {/* Travel Tips Section */}
            {aiResponse.tips && aiResponse.tips.length > 0 && (
              <View style={[styles.tipsSection, { backgroundColor: isDark ? '#1E2522' : '#EFF7F4' }]}>
                <View style={styles.tipsTitleRow}>
                  <Ionicons name="bulb-outline" size={15} color={theme.colors.brand.heritageGreen} />
                  <Text style={[styles.tipsTitle, { color: theme.colors.brand.heritageGreen }]}>
                    Local Travel & Metro Tips
                  </Text>
                </View>
                {aiResponse.tips.map((tip, tIdx) => (
                  <Text key={tIdx} style={[styles.tipItem, { color: theme.colors.text.secondary }]}>
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Recent AI Prompts (ALWAYS DISPLAYED: directly below prompt bar when no results, or below results when itinerary is active) */}
        {promptHistory && promptHistory.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeadingRow}>
              <Feather name="clock" size={13} color={theme.colors.text.secondary} />
              <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
                Recent Prompts
              </Text>
            </View>
            <View style={styles.historyList}>
              {promptHistory.map((item, idx) => (
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
                    setAiPrompt(item);
                    submitAIPrompt(item);
                  }}
                  onLongPress={() => {
                    setSelectedHistoryPrompt(item);
                  }}
                  delayLongPress={350}
                  activeOpacity={0.75}
                >
                  <Ionicons name="sparkles-outline" size={14} color={theme.colors.primary.default} />
                  <Text
                    style={[styles.historyText, { color: theme.colors.text.primary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item}
                  </Text>
                  <Feather name="arrow-up-right" size={16} color={theme.colors.primary.default} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Starter Trip Inspirations */}
        <View style={styles.starterSection}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text.secondary }]}>
            Starter Trip Inspirations
          </Text>
          {STARTER_PROMPTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.promptCard,
                {
                  backgroundColor: isDark ? '#24211E' : '#F6F0E6',
                  borderColor: isDark ? '#36302B' : '#E6DEC1',
                },
              ]}
              onPress={() => {
                setAiPrompt(item.prompt);
                submitAIPrompt(item.prompt);
              }}
              activeOpacity={0.75}
            >
              <View style={styles.promptHeaderRow}>
                {item.iconPack === 'Ionicons' && (
                  <Ionicons name={item.iconName as any} size={15} color={theme.colors.primary.default} />
                )}
                {item.iconPack === 'Feather' && (
                  <Feather name={item.iconName as any} size={14} color={theme.colors.primary.default} />
                )}
                {item.iconPack === 'FontAwesome5' && (
                  <FontAwesome5 name={item.iconName as any} size={13} color={theme.colors.primary.default} />
                )}
                <Text style={[styles.promptTitle, { color: theme.colors.text.primary }]}>
                  {item.title}
                </Text>
              </View>
              <Text style={[styles.promptBody, { color: theme.colors.text.muted }]}>
                {item.prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Full Prompt Preview Modal on Long Press */}
      <Modal
        visible={Boolean(selectedHistoryPrompt)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedHistoryPrompt(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#23201C' : '#FFFFFF',
                borderColor: theme.colors.border.default,
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary.default} />
                <Text style={[styles.modalTitle, { color: theme.colors.primary.default }]}>
                  Full AI Prompt
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedHistoryPrompt(null)}
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#302B26' : '#ECE5DA' }]}
              >
                <Ionicons name="close" size={15} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={true}>
              <Text style={[styles.modalBodyText, { color: theme.colors.text.primary }]}>
                {selectedHistoryPrompt}
              </Text>
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.colors.border.default }]}
                onPress={() => setSelectedHistoryPrompt(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: theme.colors.text.secondary }]}>
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: theme.colors.primary.default }]}
                onPress={() => {
                  if (selectedHistoryPrompt) {
                    const p = selectedHistoryPrompt;
                    setSelectedHistoryPrompt(null);
                    setAiPrompt(p);
                    submitAIPrompt(p);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.chipRow}>
                  <Text style={styles.modalSubmitText}>Hit Go</Text>
                  <Ionicons name="sparkles-outline" size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Attachment Picker Modal */}
      <AttachmentPickerModal
        visible={attachmentModalVisible}
        onClose={() => setAttachmentModalVisible(false)}
      />
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
  promptInputContainer: {
    marginHorizontal: 16,
  },
  promptInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    gap: 10,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '400',
    paddingVertical: 4,
    textAlignVertical: 'center',
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
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  attachmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeAttText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8C9094',
  },
  contentScroll: {
    flex: 1,
    marginTop: 10,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 12,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
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
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  starterSection: {
    gap: 8,
  },
  promptCard: {
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  promptBody: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  itineraryCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itineraryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareItineraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  shareItineraryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  itinerarySummary: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  daySection: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  placeItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 2,
  },
  timeBadge: {
    fontSize: 12,
    fontWeight: '700',
    width: 82,
    lineHeight: 16,
  },
  placeItemDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  placeDescription: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  budgetBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  budgetBadge: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  recommendedSection: {
    marginTop: 6,
    gap: 6,
  },
  recPlaceCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  recPlaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recPlaceName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  recPlaceType: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recPlaceReason: {
    fontSize: 12,
    lineHeight: 16,
  },
  tipsSection: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipItem: {
    fontSize: 12,
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '75%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBodyScroll: {
    maxHeight: 280,
    marginVertical: 8,
  },
  modalBodyText: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 9999,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
