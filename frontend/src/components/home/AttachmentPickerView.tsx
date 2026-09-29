/**
 * Attachment Picker View Component
 * Rendered inline inside the compact expanded bottom bar card when the '+' button is clicked.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { GestureDetector, type PanGesture } from 'react-native-gesture-handler';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '@/context/themeContext';
import { AttachmentItem } from '@/domain/models/ai';

interface AttachmentPickerViewProps {
  onClose: () => void;
  onSelect: (type: AttachmentItem['type'], name: string) => void;
  headerGesture?: PanGesture;
}

export const AttachmentPickerView: React.FC<AttachmentPickerViewProps> = ({
  onClose,
  onSelect,
  headerGesture,
}) => {
  const { theme, isDark } = useTheme();

  const headerContent = (
    <View style={styles.headerArea}>
      {/* Header Row with Title + Close '✕' button */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            📎 Add to Prompt
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: isDark ? '#2B2724' : '#EFE9DE' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close attachment picker"
        >
          <Text style={[styles.closeText, { color: theme.colors.text.secondary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionSubtitle, { color: theme.colors.text.muted }]}>
        Choose content or media to enrich your AI travel request
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {headerGesture ? (
        <GestureDetector gesture={headerGesture}>
          {headerContent}
        </GestureDetector>
      ) : (
        headerContent
      )}

      {/* Options List */}
      <View style={styles.optionsList}>
        {/* Option 1: Social Travel Video (Reels/TikTok/Shorts for /itinerary/video) */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            {
              backgroundColor: isDark ? '#24211E' : '#FAF6EE',
              borderColor: theme.colors.border.default,
            },
          ]}
          onPress={() => onSelect('video', 'Travel Reel / Video URL')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#2E221E' : '#FDEEE7' }]}>
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary.default} strokeWidth="2">
              <Rect x="2" y="2" width="20" height="20" rx="2.18" />
              <Path d="m10 8 6 4-6 4V8z" fill={theme.colors.primary.default} />
            </Svg>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
              Travel Video / Reel URL
            </Text>
            <Text style={[styles.optionDesc, { color: theme.colors.text.muted }]}>
              AI extracts places, food stops & sights from travel clips
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Photos / Image */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            {
              backgroundColor: isDark ? '#24211E' : '#FAF6EE',
              borderColor: theme.colors.border.default,
            },
          ]}
          onPress={() => onSelect('image', 'Place Photo')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1E2B27' : '#E8F5F1' }]}>
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={theme.colors.brand.heritageGreen} strokeWidth="2">
              <Rect x="3" y="3" width="18" height="18" rx="2" />
              <Circle cx="8.5" cy="8.5" r="1.5" />
              <Path d="m21 15-5-5L5 21" />
            </Svg>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
              Photos & Landscapes
            </Text>
            <Text style={[styles.optionDesc, { color: theme.colors.text.muted }]}>
              Identify hidden places & architecture from pictures
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 3: Document / Itinerary Draft */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            {
              backgroundColor: isDark ? '#24211E' : '#FAF6EE',
              borderColor: theme.colors.border.default,
            },
          ]}
          onPress={() => onSelect('document', 'Trip Notes.pdf')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#2E281E' : '#FEF6E8' }]}>
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={theme.colors.brand.heritageAccent} strokeWidth="2">
              <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <Path d="M14 2v6h6" />
              <Path d="M16 13H8" />
              <Path d="M16 17H8" />
            </Svg>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
              Trip Notes / Document
            </Text>
            <Text style={[styles.optionDesc, { color: theme.colors.text.muted }]}>
              Enrich existing travel notes, budget drafts & bookings
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerArea: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 11.5,
    marginTop: 1,
    lineHeight: 15,
  },
});
