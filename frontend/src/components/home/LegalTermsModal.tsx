import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';

interface LegalTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Modal Window */}
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? '#23211F' : '#FAF6EE',
              borderColor: isDark ? '#38332E' : '#E5DDD1',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Feather name="shield" size={20} color={theme.colors.primary.default} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                  Legal & Terms of Service
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.text.muted }]}>
                  Terms, Public Data Fair Use & Privacy
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? '#2E2A26' : '#ECE5D8' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close legal terms"
            >
              <Feather name="x" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Terms Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            bounces={true}
            overScrollMode="always"
          >
            <View
              style={[
                styles.highlightBox,
                {
                  backgroundColor: isDark ? '#2D221A' : '#FDF4EB',
                  borderColor: theme.colors.primary.default,
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={theme.colors.primary.default}
              />
              <Text style={[styles.highlightText, { color: theme.colors.text.primary }]}>
                Ghumo is dedicated to open, lawful, and transparent travel intelligence. This
                section outlines our operating principles, public web data indexing rights, and user
                protections.
              </Text>
            </View>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              1. Acceptance of Terms & Services
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              By accessing or utilizing the Ghumo mobile application, AI itinerary planners,
              discovery search engine, and interactive map interfaces, you enter into a legally
              binding agreement to comply with these terms. Ghumo provides real-time destination
              indexing, curated travel highlights, AI-synthesized day plans, and geolocation-based
              navigational assistance.
            </Text>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              2. Public Data Scraping, Search Indexing & Legality Declaration
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              Ghumo indexes, organizes, and presents factual travel information—including public
              landmark names, historical descriptions, geographic coordinates, ticket rates, and
              visitor hours—lawfully gathered from publicly available web sources.
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              Under established international legal frameworks and judicial precedents governing
              public web data (including doctrines affirmed in landmark cases such as hiQ Labs,
              Inc. v. LinkedIn Corp. and Van Buren v. United States), automated indexing of
              publicly accessible, unauthenticated internet data for search and factual reference
              is fully lawful and protected under fair use principles. Ghumo strictly observes the
              following standards:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.text.secondary }]}>
                • <Text style={styles.boldText}>No Access Barrier Breach:</Text> We do not bypass
                paywalls, break technological access controls, or access private personal accounts.
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.text.secondary }]}>
                • <Text style={styles.boldText}>Factual Data Standard:</Text> Factual attributes
                (coordinates, names, operating hours) are non-copyrightable public information
                aggregated for informational search utility.
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.text.secondary }]}>
                • <Text style={styles.boldText}>Transformative Search Utility:</Text> Aggregated data
                is transformed through AI synthesis into novel, actionable day itineraries and
                spatial discovery layers.
              </Text>
            </View>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              3. Open Data & OpenStreetMap Attribution
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              Map background tiles and geographical coordinates are provided by OpenStreetMap (OSM)
              contributors and licensed under the Open Data Commons Open Database License (ODbL).
              Photography and cultural references are sourced under Creative Commons licenses (CC
              BY-SA / CC BY) and Wikimedia Commons public archives with full attribution to their
              respective creators.
            </Text>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              4. Single Active Rating & Community Feedback Integrity (TargetFeedback)
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              To prevent rating manipulation and maintain authentic, unskewed quality scores across
              destinations and itineraries, Ghumo strictly enforces a Single Active Rating policy
              per user (TargetFeedback) keyed to unique user and anonymous IDs. Rating submissions
              update existing records rather than creating duplicate entries. Users agree not to
              engage in automated vote manipulation or fraudulent submissions.
            </Text>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              5. Local-First Privacy & Geolocation Protection
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              Your privacy is fundamental to our architecture. Search queries and AI itinerary
              prompt histories are cached locally on your device storage. Ghumo does not sell,
              broker, or rent personal identifiable information. GPS geolocation permissions are
              utilized strictly in real-time to position the map and calculate distance to nearby
              landmarks, without persistent external tracking.
            </Text>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              6. AI Synthesizer & Limitation of Liability
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              Ghumo AI generative itineraries and crowd estimates are designed as assistive travel
              guides. Local pricing, monument timings, weather conditions, and transport schedules
              are subject to independent local changes. Travelers are advised to verify on-ground
              conditions. Ghumo disclaims direct liability for travel disruptions, delays, or
              localized itinerary variations.
            </Text>

            <Text style={[styles.sectionHeading, { color: theme.colors.primary.default }]}>
              7. Inquiries & Data Corrections
            </Text>
            <Text style={[styles.bodyText, { color: theme.colors.text.secondary }]}>
              Landmark owners, businesses, or content creators wishing to update, verify, or
              correct public directory listings are invited to contact the Ghumo team directly for
              swift synchronization.
            </Text>
          </ScrollView>

          {/* Dismiss Button */}
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.colors.primary.default }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneButtonText}>I Understand & Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    zIndex: 1000,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    height: '82%',
    maxHeight: 650,
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
    flexShrink: 0,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
    marginVertical: 12,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 16,
    flexGrow: 1,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  bulletList: {
    gap: 6,
    paddingLeft: 4,
    marginVertical: 2,
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    flexShrink: 0,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
