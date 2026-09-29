import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { logger } from '@/utils/logger';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { MapBackground } from '@/components/home/MapBackground';
import { GhumoCenterBrand } from '@/components/home/GhumoCenterBrand';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { DynamicBottomBar } from '@/components/home/DynamicBottomBar';
import { MapPlaceCarousel } from '@/components/home/MapPlaceCarousel';
import { ExitConfirmationModal } from '@/components/common/ExitConfirmationModal';

export default function HomeScreen() {
  const { isAuthenticated, isGuest } = useAuth();
  const { theme, isDark, fadeAnim } = useTheme();
  const { isMapVisible, showExitModal, setShowExitModal } = useHome();

  useEffect(() => {
    logger.app('HomeScreen active state', { isAuthenticated, isGuest, isMapVisible });
  }, [isAuthenticated, isGuest, isMapVisible]);

  // If user is not logged in and has not skipped login -> render Revamped Auth Screen
  if (!isAuthenticated && !isGuest) {
    const authBg = isDark ? '#191816' : '#ECE8E1';
    return (
      <Animated.View style={[styles.screenRoot, { backgroundColor: authBg, opacity: fadeAnim }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={authBg}
        />
        <SafeAreaView style={[styles.topSafeArea, { backgroundColor: authBg }]} />

        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardAvoid, { backgroundColor: authBg }]}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { backgroundColor: authBg }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            nestedScrollEnabled={true}
            removeClippedSubviews={false}
            bounces={false}
          >
            {/* Top Brand Header Area matching Card Width & Theme Background */}
            <View style={[styles.heroSection, { backgroundColor: authBg }]}>
              <BrandHeader />
            </View>

            {/* Warm Ivory / Dark Charcoal Auth Card */}
            <View style={[styles.cardSection, { backgroundColor: authBg }]}>
              <AuthCard />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <AuthLoadingOverlay />
      </Animated.View>
    );
  }

  // When logged in or skipped -> render Home Page
  return (
    <Animated.View style={[styles.homeRoot, { backgroundColor: theme.colors.background.screen, opacity: fadeAnim }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.screen}
      />

      {/* Layer 1: Background Map View (Kept mounted to preserve location & pins on hide/show) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: isMapVisible ? 1 : 0,
            zIndex: isMapVisible ? 1 : -1,
          },
        ]}
        pointerEvents={isMapVisible ? 'auto' : 'none'}
      >
        <MapBackground />
      </View>

      {/* Layer 1.5: Center Ghumo Brand Logo when Map is Hidden */}
      {!isMapVisible && <GhumoCenterBrand />}

      {/* Layer 2: Floating Top App Bar */}
      <HomeTopBar />

      {/* Layer 3: Downward-gravity Map Place Carousel (when results active on map) */}
      <MapPlaceCarousel />

      {/* Layer 4: Dynamic Morphing Bottom Bar (AI + Search + Floating Map Toggle + Category Pills) */}
      <DynamicBottomBar />

      {/* Layer 5: Auth Action Loading Overlay */}
      <AuthLoadingOverlay />

      {/* Layer 6: Android Back Exit Confirmation Modal */}
      <ExitConfirmationModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  cardSection: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  homeRoot: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
