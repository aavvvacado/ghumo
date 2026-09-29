import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { AttachmentItem } from '@/domain/models/ai';

interface AttachmentPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AttachmentPickerModal: React.FC<AttachmentPickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const { addAttachment } = useHome();

  const handleSelectOption = (type: AttachmentItem['type'], name: string) => {
    addAttachment({
      id: `att_${Date.now()}`,
      name,
      type,
    });
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.background.surface,
                  borderColor: theme.colors.border.default,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                Add to Prompt
              </Text>

              {/* Option 1: Social Travel Video (Reels/TikTok/Shorts for /itinerary/video) */}
              <TouchableOpacity
                style={[styles.optionRow, { borderBottomColor: theme.colors.border.default }]}
                onPress={() => handleSelectOption('video', 'Travel Reel / Video URL')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#2E221E' : '#FDEEE7' }]}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary.default} strokeWidth="2">
                    <Rect x="2" y="2" width="20" height="20" rx="2.18" />
                    <Path d="m10 8 6 4-6 4V8z" fill={theme.colors.primary.default} />
                  </Svg>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
                    Travel Video / Reel URL
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.text.muted }]}>
                    AI extracts places from travel clips
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Photos / Image */}
              <TouchableOpacity
                style={[styles.optionRow, { borderBottomColor: theme.colors.border.default }]}
                onPress={() => handleSelectOption('image', 'Place Photo')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1E2B27' : '#E8F5F1' }]}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.brand.heritageGreen} strokeWidth="2">
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
                    Identify hidden places from pictures
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 3: Document / Itinerary Draft */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleSelectOption('document', 'Trip Notes.pdf')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#2E281E' : '#FEF6E8' }]}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.brand.heritageAccent} strokeWidth="2">
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
                    Enrich existing travel notes
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 90,
  },
  modalCard: {
    width: '92%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
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
    fontSize: 14,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
