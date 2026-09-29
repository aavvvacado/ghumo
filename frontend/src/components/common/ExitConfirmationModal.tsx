import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/themeContext';

interface ExitConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const { theme, isDark } = useTheme();

  const handleExit = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      BackHandler.exitApp();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#23211F' : '#FAF6EE',
                  borderColor: isDark ? '#38332E' : '#E5DDD1',
                },
              ]}
            >
              {/* Header Title */}
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                Exit Ghumo?
              </Text>

              {/* Confirmation Description */}
              <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
                Are you sure you want to exit the app? Your recent searches and AI itineraries are safely stored locally.
              </Text>

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: isDark ? '#2D2925' : '#EFE9DE',
                      borderColor: isDark ? '#3D3732' : '#DFD7C9',
                    },
                  ]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelText, { color: theme.colors.text.primary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.exitButton,
                    {
                      backgroundColor: theme.colors.primary.default,
                    },
                  ]}
                  onPress={handleExit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.exitText}>
                    Exit App
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  exitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D95338',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exitText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
