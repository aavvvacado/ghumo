/**
 * Dynamic Bottom Bar Component
 * - Hardware-accelerated GPU transforms (translateY) for 60/120fps buttery-smooth drag on Android.
 * - Action button permanently anchored on the left (height: 1.4x search bar).
 * - Action button expands outwards to the right, and text box contracts from the left by the exact same amount.
 * - Map Show/Hide button expands downwards, contracting the action button below it by the exact same amount with icon fade transition.
 * - Overlay cards (Attachment Picker / Search / Prompt) float with the exact same bottom margin as the search bar & action buttons.
 * - AI action button icon: Exact speech bubble with 3 square dots from design spec, theme-shaded (B&W).
 * - Prompt send button: Paper plane icon embedded directly inside the prompt text box.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated as RNAnimated,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector, ScrollView, type PanGesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { AttachmentPickerView } from './AttachmentPickerView';
import { SearchView } from './SearchView';
import { PromptView } from './PromptView';
import { ProcessingOutline } from './ProcessingOutline';

interface FilterPillItem {
  id: string;
  label: string;
  iconName?: string;
  iconPack?: 'Ionicons' | 'Feather' | 'MaterialCommunityIcons' | 'FontAwesome5';
}

const SEARCH_BAR_HEIGHT = 52;
const ACTION_BUTTON_WIDTH = 54;
const ACTION_BUTTON_HEIGHT = Math.round(SEARCH_BAR_HEIGHT * 1.4); // 73px (1.4x search bar height)
const MAP_BUTTON_SIZE = 44;
const MAX_PROMPT_LENGTH = 500;

export const DynamicBottomBar: React.FC = () => {
  const { theme, isDark } = useTheme();
  const {
    activeMode,
    setActiveMode,
    isExpanded,
    setIsExpanded,
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    aiPrompt,
    setAiPrompt,
    clearAiPrompt,
    addAttachment,
    performSearch,
    submitAIPrompt,
    isSearching,
    isProcessingAI,
    searchResults,
    categorizedResults,
    activeMapCategory,
    setActiveMapCategory,
    aiResponse,
    isMapVisible,
    toggleMapVisible,
    isUsingCachedResult,
    refetchCurrentResults,
  } = useHome();

  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [promptBoxHeight, setPromptBoxHeight] = useState(SEARCH_BAR_HEIGHT);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const searchInputRef = useRef<TextInput>(null);
  const aiInputRef = useRef<TextInput>(null);

  // Dynamic filter pills derived directly from search output headers or itinerary days
  const availableFilterPills = useMemo<FilterPillItem[]>(() => {
    const pills: FilterPillItem[] = [];

    if (categorizedResults) {
      if (categorizedResults.food && categorizedResults.food.length > 0) {
        pills.push({ id: 'food', label: `Food (${categorizedResults.food.length})`, iconName: 'restaurant-outline', iconPack: 'Ionicons' });
      }
      if (categorizedResults.markets && categorizedResults.markets.length > 0) {
        pills.push({ id: 'markets', label: `Markets (${categorizedResults.markets.length})`, iconName: 'shopping-bag', iconPack: 'Feather' });
      }
      if (categorizedResults.attractions && categorizedResults.attractions.length > 0) {
        pills.push({ id: 'attractions', label: `Attractions (${categorizedResults.attractions.length})`, iconName: 'landmark', iconPack: 'FontAwesome5' });
      }
      if (categorizedResults.hidden_gems && categorizedResults.hidden_gems.length > 0) {
        pills.push({ id: 'hidden_gems', label: `Hidden Gems (${categorizedResults.hidden_gems.length})`, iconName: 'diamond-outline', iconPack: 'Ionicons' });
      }
      if (categorizedResults.tips && categorizedResults.tips.length > 0) {
        pills.push({ id: 'tips', label: `Tips (${categorizedResults.tips.length})`, iconName: 'bulb-outline', iconPack: 'Ionicons' });
      }
      if (pills.length > 1) {
        pills.unshift({ id: 'all', label: `All Places (${categorizedResults.places.length})`, iconName: 'location-outline', iconPack: 'Ionicons' });
      }
    } else if (searchResults.length > 0) {
      pills.push({ id: 'all', label: `All Places (${searchResults.length})`, iconName: 'location-outline', iconPack: 'Ionicons' });
    } else if (aiResponse) {
      if (aiResponse.days && aiResponse.days.length > 0) {
        aiResponse.days.forEach((day, idx) => {
          pills.push({
            id: `day_${idx}`,
            label: `Day ${day.dayNumber || day.day || idx + 1}`,
            iconName: 'calendar-outline',
            iconPack: 'Ionicons',
          });
        });
      } else {
        pills.push({ id: 'day_0', label: 'Day 1', iconName: 'calendar-outline', iconPack: 'Ionicons' });
      }
    }

    // When viewing locally cached results, display a matching Refresh pill as the first item
    if (isUsingCachedResult && pills.length > 0) {
      pills.unshift({ id: 'refresh', label: '', iconName: 'refresh-cw', iconPack: 'Feather' });
    }

    return pills;
  }, [categorizedResults, searchResults, aiResponse, isUsingCachedResult]);

  // Horizontal coupling physics animations (expansion of active pill, contraction of adjacent pills/map button)
  const pillHorizontalExpandAnims = useRef<RNAnimated.Value[]>(
    Array.from({ length: 12 }, () => new RNAnimated.Value(0))
  ).current;
  const mapButtonDisplaceAnim = useRef(new RNAnimated.Value(0)).current;

  const handlePillPress = (catId: string, index: number) => {
    // If user tapped the Refresh pill, trigger fresh refetch from backend
    if (catId === 'refresh') {
      refetchCurrentResults();
      return;
    }
    // Horizontal coupling animation:
    // 1. Tapped pill expands horizontally (+16px)
    // 2. Left neighbor (or map button if first pill) contracts by (-8px)
    // 3. Right neighbor contracts by (-8px)
    const animations: RNAnimated.CompositeAnimation[] = [];

    // Tapped pill expansion spring
    animations.push(
      RNAnimated.sequence([
        RNAnimated.spring(pillHorizontalExpandAnims[index], {
          toValue: 16,
          speed: 28,
          bounciness: 10,
          useNativeDriver: false,
        }),
        RNAnimated.spring(pillHorizontalExpandAnims[index], {
          toValue: 0,
          speed: 22,
          bounciness: 6,
          useNativeDriver: false,
        }),
      ])
    );

    // Left neighbor or Map button contraction
    if (index === 0) {
      animations.push(
        RNAnimated.sequence([
          RNAnimated.spring(mapButtonDisplaceAnim, {
            toValue: -8,
            speed: 28,
            bounciness: 10,
            useNativeDriver: false,
          }),
          RNAnimated.spring(mapButtonDisplaceAnim, {
            toValue: 0,
            speed: 22,
            bounciness: 6,
            useNativeDriver: false,
          }),
        ])
      );
    } else if (pillHorizontalExpandAnims[index - 1]) {
      animations.push(
        RNAnimated.sequence([
          RNAnimated.spring(pillHorizontalExpandAnims[index - 1], {
            toValue: -8,
            speed: 28,
            bounciness: 10,
            useNativeDriver: false,
          }),
          RNAnimated.spring(pillHorizontalExpandAnims[index - 1], {
            toValue: 0,
            speed: 22,
            bounciness: 6,
            useNativeDriver: false,
          }),
        ])
      );
    }

    // Right neighbor contraction
    if (pillHorizontalExpandAnims[index + 1]) {
      animations.push(
        RNAnimated.sequence([
          RNAnimated.spring(pillHorizontalExpandAnims[index + 1], {
            toValue: -8,
            speed: 28,
            bounciness: 10,
            useNativeDriver: false,
          }),
          RNAnimated.spring(pillHorizontalExpandAnims[index + 1], {
            toValue: 0,
            speed: 22,
            bounciness: 6,
            useNativeDriver: false,
          }),
        ])
      );
    }

    RNAnimated.parallel(animations).start();
    setActiveMapCategory(catId);
  };

  // Screen calculations
  const windowDims = Dimensions.get('window');
  const screenWidth = windowDims.width;
  const screenHeight = windowDims.height;

  const CONTENT_MAX_WIDTH = 520;
  const HORIZONTAL_MARGIN = 20;

  const containerMaxWidth = Math.min(
    CONTENT_MAX_WIDTH,
    screenWidth - HORIZONTAL_MARGIN * 2
  );

  const restingInputWidth = containerMaxWidth - ACTION_BUTTON_WIDTH - 12;
  const expandedOverlayHeight = Math.min(screenHeight * 0.90, 760);
  const ATTACHMENT_PICKER_HEIGHT = Math.min(screenHeight * 0.55, 310);

  // Reanimated UI-thread values for 60/120fps GPU performance
  const dragProgress = useSharedValue(0);
  const sheetTranslateY = useSharedValue(expandedOverlayHeight + 50);
  const startSheetY = useSharedValue(0);

  // React Native Animated values for micro-interactions
  const modeAnim = useRef(new RNAnimated.Value(activeMode === 'ai' ? 1 : 0)).current;
  const keyboardOffset = useRef(new RNAnimated.Value(0)).current;
  const actionExpandAnim = useRef(new RNAnimated.Value(0)).current;
  const contentFadeAnim = useRef(new RNAnimated.Value(1)).current;
  const mapExpandAnim = useRef(new RNAnimated.Value(0)).current;
  const mapIconFadeAnim = useRef(new RNAnimated.Value(1)).current;

  const hasPromptText = aiPrompt.trim().length > 0;
  const hasSearchText = searchQuery.trim().length > 0;

  // Open & Close Handlers
  const openSheet = useCallback(() => {
    setIsExpanded(true);
    Keyboard.dismiss();
    dragProgress.value = withSpring(1, { damping: 24, stiffness: 240, mass: 0.8 });
    sheetTranslateY.value = withSpring(0, { damping: 24, stiffness: 240, mass: 0.8 });
  }, [setIsExpanded, dragProgress, sheetTranslateY]);

  const closeSheet = useCallback(() => {
    setIsExpanded(false);
    setIsAttachmentPickerOpen(false);
    const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
    sheetTranslateY.value = withTiming(currentHeight + 80, { duration: 220 });
    dragProgress.value = withTiming(0, { duration: 220 });
  }, [setIsExpanded, isAttachmentPickerOpen, dragProgress, sheetTranslateY, ATTACHMENT_PICKER_HEIGHT, expandedOverlayHeight]);

  const animateTo = useCallback(
    (toValue: number) => {
      if (toValue === 1) {
        openSheet();
      } else {
        closeSheet();
      }
    },
    [openSheet, closeSheet]
  );

  // Sync isExpanded state if changed externally
  useEffect(() => {
    const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
    if (isExpanded) {
      dragProgress.value = withSpring(1, { damping: 24, stiffness: 240, mass: 0.8 });
      sheetTranslateY.value = withSpring(0, { damping: 24, stiffness: 240, mass: 0.8 });
    } else {
      sheetTranslateY.value = withTiming(currentHeight + 80, { duration: 220 });
      dragProgress.value = withTiming(0, { duration: 220 });
    }
  }, [isExpanded, isAttachmentPickerOpen, dragProgress, sheetTranslateY, ATTACHMENT_PICKER_HEIGHT, expandedOverlayHeight]);

  // Keyboard listener with generous safety offset to prevent any overlap
  const bottomMargin = isKeyboardOpen ? 14 : (Platform.OS === 'ios' ? 24 : 16);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      setIsKeyboardOpen(true);
      const height = e?.endCoordinates?.height || 280;
      RNAnimated.spring(keyboardOffset, {
        toValue: height + 10,
        damping: 24,
        stiffness: 260,
        useNativeDriver: false,
      }).start();
    };

    const onHide = () => {
      setIsKeyboardOpen(false);
      RNAnimated.spring(keyboardOffset, {
        toValue: 0,
        damping: 24,
        stiffness: 260,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  // Smooth mode transition animation
  useEffect(() => {
    RNAnimated.spring(modeAnim, {
      toValue: activeMode === 'ai' ? 1 : 0,
      damping: 22,
      stiffness: 220,
      mass: 0.7,
      useNativeDriver: false,
    }).start();
  }, [activeMode, modeAnim]);

  // Mode switcher: Action button expands to the right while text box contracts by the same amount
  const toggleMode = () => {
    actionExpandAnim.setValue(18);
    RNAnimated.spring(actionExpandAnim, {
      toValue: 0,
      damping: 14,
      stiffness: 280,
      mass: 0.65,
      useNativeDriver: false,
    }).start();

    RNAnimated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 75,
      useNativeDriver: false,
    }).start(() => {
      const nextMode = activeMode === 'search' ? 'ai' : 'search';
      setActiveMode(nextMode);
      if (nextMode === 'ai') {
        setTimeout(() => aiInputRef.current?.focus(), 40);
      } else {
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
      RNAnimated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }).start();
    });
  };

  // Map button: Expands downwards, action button contracts from top by the same amount, with icon fade
  const handleToggleMap = () => {
    mapExpandAnim.setValue(14);
    mapExpandAnim.setValue(18);
    RNAnimated.spring(mapExpandAnim, {
      toValue: 0,
      damping: 15,
      stiffness: 260,
      mass: 0.7,
      useNativeDriver: false,
    }).start();

    RNAnimated.sequence([
      RNAnimated.timing(mapIconFadeAnim, {
        toValue: 0.15,
        duration: 70,
        useNativeDriver: true,
      }),
      RNAnimated.timing(mapIconFadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    toggleMapVisible();
  };

  // Trigger expansion into attachment picker view
  const handleOpenAttachmentPicker = () => {
    setIsAttachmentPickerOpen(true);
    openSheet();
  };

  // Zone 1 Top Handle Drag Gesture (memoized instance for sheet top handle)
  const handlePanGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-25, 25])
      .onStart(() => {
        'worklet';
        startSheetY.value = sheetTranslateY.value;
      })
      .onUpdate((event) => {
        'worklet';
        if (event.translationY > 0) {
          sheetTranslateY.value = startSheetY.value + event.translationY;
        } else {
          sheetTranslateY.value = startSheetY.value + event.translationY * 0.15;
        }
        const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
        dragProgress.value = interpolate(
          sheetTranslateY.value,
          [currentHeight + 50, 0],
          [0, 1],
          Extrapolation.CLAMP
        );
      })
      .onEnd((event) => {
        'worklet';
        if (event.translationY > 60 || event.velocityY > 250) {
          const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
          sheetTranslateY.value = withTiming(currentHeight + 80, { duration: 200 });
          dragProgress.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(closeSheet)();
            }
          });
        } else {
          sheetTranslateY.value = withSpring(0, { damping: 24, stiffness: 260 });
          dragProgress.value = withSpring(1, { damping: 24, stiffness: 260 });
        }
      });
  }, [isAttachmentPickerOpen, expandedOverlayHeight, closeSheet, sheetTranslateY, startSheetY, dragProgress, ATTACHMENT_PICKER_HEIGHT]);

  // Zone 1 Header & Input Field Drag Gesture (memoized separate instance for child search/prompt views)
  const headerPanGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-25, 25])
      .onStart(() => {
        'worklet';
        startSheetY.value = sheetTranslateY.value;
      })
      .onUpdate((event) => {
        'worklet';
        if (event.translationY > 0) {
          sheetTranslateY.value = startSheetY.value + event.translationY;
        } else {
          sheetTranslateY.value = startSheetY.value + event.translationY * 0.15;
        }
        const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
        dragProgress.value = interpolate(
          sheetTranslateY.value,
          [currentHeight + 50, 0],
          [0, 1],
          Extrapolation.CLAMP
        );
      })
      .onEnd((event) => {
        'worklet';
        if (event.translationY > 60 || event.velocityY > 250) {
          const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
          sheetTranslateY.value = withTiming(currentHeight + 80, { duration: 200 });
          dragProgress.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(closeSheet)();
            }
          });
        } else {
          sheetTranslateY.value = withSpring(0, { damping: 24, stiffness: 260 });
          dragProgress.value = withSpring(1, { damping: 24, stiffness: 260 });
        }
      });
  }, [isAttachmentPickerOpen, expandedOverlayHeight, closeSheet, sheetTranslateY, startSheetY, dragProgress, ATTACHMENT_PICKER_HEIGHT]);

  // Whole resting bottom bar swipe-up Gesture to open Search/Prompt view (memoized)
  const bottomBarPanGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-25, 25])
      .onEnd((event) => {
        'worklet';
        if (event.translationY < -15 || event.velocityY < -200) {
          runOnJS(openSheet)();
        }
      });
  }, [openSheet]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
    openSheet();
  };

  const handlePromptSubmit = () => {
    if (hasPromptText) {
      submitAIPrompt(aiPrompt);
      openSheet();
    }
  };

  // Dedicated expanded height for attachment picker vs full views
  const currentExpandedHeight = isAttachmentPickerOpen
    ? ATTACHMENT_PICKER_HEIGHT
    : expandedOverlayHeight;

  // Reanimated Animated Styles for buttery-smooth 60/120fps UI Thread Rendering
  const expandedSheetAnimatedStyle = useAnimatedStyle(() => {
    const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
    const progress = interpolate(
      sheetTranslateY.value,
      [currentHeight + 50, 0],
      [0, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(progress, [0, 0.05, 1], [0, 1, 1], Extrapolation.CLAMP);

    return {
      transform: [{ translateY: sheetTranslateY.value }],
      opacity,
      display: sheetTranslateY.value >= currentHeight + 40 ? 'none' : 'flex',
    };
  });

  const scrimAnimatedStyle = useAnimatedStyle(() => {
    const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
    const progress = interpolate(
      sheetTranslateY.value,
      [currentHeight + 50, 0],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: interpolate(progress, [0, 1], [0, 0.45], Extrapolation.CLAMP),
      display: progress <= 0.01 ? 'none' : 'flex',
    };
  });

  const restingBarAnimatedStyle = useAnimatedStyle(() => {
    const currentHeight = isAttachmentPickerOpen ? ATTACHMENT_PICKER_HEIGHT : expandedOverlayHeight;
    const progress = interpolate(
      sheetTranslateY.value,
      [currentHeight + 50, 0],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: interpolate(progress, [0, 0.25], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(progress, [0, 1], [0, 30], Extrapolation.CLAMP) }],
    };
  });

  // Mode crossfade opacities for text box contents
  const searchModeOpacity = modeAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const aiModeOpacity = modeAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  // Theme color for AI icon: black in light mode, white in dark mode
  const iconThemeColor = isDark ? '#FFFFFF' : '#1A1816';

  // Dynamic animated widths and heights for coupled expansion/contraction
  const dynamicActionButtonWidth = RNAnimated.add(new RNAnimated.Value(ACTION_BUTTON_WIDTH), actionExpandAnim);
  const dynamicActionButtonHeight = RNAnimated.subtract(new RNAnimated.Value(ACTION_BUTTON_HEIGHT), mapExpandAnim);
  const dynamicTextCardWidth = RNAnimated.subtract(new RNAnimated.Value(restingInputWidth), actionExpandAnim);
  const dynamicMapButtonHeight = RNAnimated.add(new RNAnimated.Value(MAP_BUTTON_SIZE), mapExpandAnim);

  return (
    <>
      {/* Full Backdrop Scrim */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.scrimBackdrop,
          scrimAnimatedStyle,
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => animateTo(0)}
        />
      </Animated.View>

      {/* Main Bottom Container with ample margin above keyboard */}
      <RNAnimated.View
        style={[
          styles.outerContainer,
          {
            bottom: keyboardOffset,
            paddingBottom: bottomMargin,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* ================= RESTING STATE: FLOATING BUTTONS + ACTION ROW ================= */}
        <Animated.View
          style={[
            styles.restingRowContainer,
            {
              maxWidth: containerMaxWidth,
            },
            restingBarAnimatedStyle,
          ]}
          pointerEvents={isExpanded ? 'none' : 'box-none'}
        >
          {/* Floating Map Toggle Button + Category Filter Pills (Aligned above action button) */}
          <View style={styles.floatingToggleRow} pointerEvents="box-none">
            <RNAnimated.View
              style={[
                styles.floatingToggleButton,
                {
                  height: dynamicMapButtonHeight,
                  transform: [{ translateX: mapButtonDisplaceAnim }],
                  backgroundColor: isDark ? '#1F1D1B' : '#FFFFFF',
                  borderColor: isMapVisible ? theme.colors.primary.default : theme.colors.border.default,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.fullTouch}
                onPress={handleToggleMap}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={isMapVisible ? 'Hide map view' : 'Show map view'}
              >
                <RNAnimated.View style={{ opacity: mapIconFadeAnim, alignItems: 'center', justifyContent: 'center' }}>
                  {isMapVisible ? (
                    <Feather name="map" size={19} color={theme.colors.primary.default} />
                  ) : (
                    <MaterialCommunityIcons name="map-outline" size={20} color={theme.colors.text.muted} />
                  )}
                </RNAnimated.View>
              </TouchableOpacity>
            </RNAnimated.View>

            {/* Dynamic Filter Pills beside Map Button (only when Map is active and results exist) */}
            {isMapVisible && availableFilterPills.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.pillsScrollContainer}
                style={styles.pillsScrollView}
              >
                {availableFilterPills.map((pill: FilterPillItem, idx: number) => {
                  const isActive = activeMapCategory === pill.id;
                  const expandAnim = pillHorizontalExpandAnims[idx] || new RNAnimated.Value(0);
                  const iconColor = isActive ? theme.colors.primary.default : theme.colors.text.primary;

                  return (
                    <RNAnimated.View
                      key={pill.id}
                      style={{
                        transform: [
                          {
                            scaleX: expandAnim.interpolate({
                              inputRange: [-8, 0, 16],
                              outputRange: [0.88, 1, 1.14],
                            }),
                          },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.mapCategoryPill,
                          {
                            backgroundColor: isActive
                              ? (isDark ? '#3D2820' : '#FCEEE8')
                              : (isDark ? 'rgba(35,32,29,0.95)' : 'rgba(255,255,255,0.95)'),
                            borderColor: isActive ? theme.colors.primary.default : (isDark ? '#3D3732' : '#E0D6C8'),
                            borderWidth: isActive ? 1.6 : 1,
                            paddingHorizontal: pill.label ? 12 : 10,
                          },
                        ]}
                        onPress={() => handlePillPress(pill.id, idx)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.pillInnerRow}>
                          {pill.iconPack === 'Ionicons' && pill.iconName && (
                            <Ionicons name={pill.iconName as any} size={14} color={iconColor} />
                          )}
                          {pill.iconPack === 'Feather' && pill.iconName && (
                            <Feather name={pill.iconName as any} size={13} color={iconColor} />
                          )}
                          {pill.iconPack === 'FontAwesome5' && pill.iconName && (
                            <FontAwesome5 name={pill.iconName as any} size={12} color={iconColor} />
                          )}
                          {pill.iconPack === 'MaterialCommunityIcons' && pill.iconName && (
                            <MaterialCommunityIcons name={pill.iconName as any} size={14} color={iconColor} />
                          )}
                          {Boolean(pill.label) && (
                            <Text
                              style={[
                                styles.mapPillText,
                                {
                                  color: iconColor,
                                  fontWeight: isActive ? '700' : '600',
                                },
                              ]}
                            >
                              {pill.label}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </RNAnimated.View>
                  );
                })}
              </ScrollView>
            ) : (!isSearching && !isProcessingAI) ? (
              /* Dynamic Mode Title: "Search" vs "Plan Your Itinerary" (in line with show/hide map button) */
              <View style={styles.floatingHeaderContainer} pointerEvents="none">
                <RNAnimated.View
                  style={[
                    styles.floatingHeaderItem,
                    {
                      opacity: searchModeOpacity,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.floatingHeaderText,
                      isDark
                        ? styles.floatingHeaderTextDark
                        : [styles.floatingHeaderTextLight, { color: theme.colors.primary.default }],
                    ]}
                    numberOfLines={1}
                  >
                    Search
                  </Text>
                </RNAnimated.View>
                <RNAnimated.View
                  style={[
                    styles.floatingHeaderItem,
                    styles.floatingHeaderItemAbsolute,
                    {
                      opacity: aiModeOpacity,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.floatingHeaderText,
                      isDark
                        ? styles.floatingHeaderTextDark
                        : [styles.floatingHeaderTextLight, { color: theme.colors.primary.default }],
                    ]}
                    numberOfLines={1}
                  >
                    Plan Your Itinerary
                  </Text>
                </RNAnimated.View>
              </View>
            ) : null}
          </View>

          {/* Main Row: Single GestureDetector wrapping the ENTIRE barRow */}
          <GestureDetector gesture={bottomBarPanGesture}>
            <View style={styles.barRow} pointerEvents="box-none">
              {/* ================= LEFT ACTION BUTTON (Coupled with Text Box & Map Button) ================= */}
              <RNAnimated.View
                style={[
                  styles.actionButtonWrapper,
                  {
                    width: dynamicActionButtonWidth,
                    height: dynamicActionButtonHeight,
                    transform: [{ translateY: mapExpandAnim }],
                    backgroundColor: isDark ? '#1D1B19' : theme.colors.background.surface,
                    borderColor: theme.colors.border.default,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.actionButtonTouch}
                  activeOpacity={0.75}
                  onPress={toggleMode}
                  accessibilityRole="button"
                  accessibilityLabel={activeMode === 'search' ? 'Switch to Ghumo AI Prompt' : 'Switch to Search'}
                >
                  <RNAnimated.View style={{ opacity: contentFadeAnim, alignItems: 'center', justifyContent: 'center' }}>
                    {activeMode === 'search' ? (
                      /* AI Action Button Icon: Exact Speech Bubble with 3 Square Dots from Spec */
                      <Svg width={26} height={26} viewBox="0 0 28 28" fill="none">
                        <Path
                          d="M4.5 4C3.67 4 3 4.67 3 5.5V19.5C3 20.33 3.67 21 4.5 21H10.5L14 24.5L17.5 21H23.5C24.33 21 25 20.33 25 19.5V5.5C25 4.67 24.33 4 23.5 4H4.5Z"
                          stroke={iconThemeColor}
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Rect x="7" y="11" width="3" height="3" fill={iconThemeColor} />
                        <Rect x="12.5" y="11" width="3" height="3" fill={iconThemeColor} />
                        <Rect x="18" y="11" width="3" height="3" fill={iconThemeColor} />
                      </Svg>
                    ) : (
                      /* Search Action Button Icon (to switch back to Search) */
                      <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={iconThemeColor} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <Circle cx="11" cy="11" r="7.5" />
                        <Line x1="21" y1="21" x2="16.5" y2="16.5" />
                      </Svg>
                    )}
                  </RNAnimated.View>
                </TouchableOpacity>
              </RNAnimated.View>

              {/* ================= RIGHT TEXT BOX (Contracts as Action Button Expands) ================= */}
              <RNAnimated.View
                style={{
                  width: dynamicTextCardWidth,
                }}
              >
                <ProcessingOutline
                  isProcessing={activeMode === 'search' ? isSearching : isProcessingAI}
                  borderRadius={26}
                  strokeWidth={2.0}
                >
                  <RNAnimated.View
                    style={[
                      styles.restingTextCard,
                      {
                        width: '100%',
                        height: activeMode === 'ai' ? promptBoxHeight : SEARCH_BAR_HEIGHT,
                        backgroundColor: isDark ? '#1D1B19' : theme.colors.background.surface,
                        borderColor: (activeMode === 'search' ? isSearching : isProcessingAI)
                          ? 'transparent'
                          : activeMode === 'ai'
                            ? theme.colors.primary.default
                            : theme.colors.border.default,
                        borderWidth: activeMode === 'ai' ? 1.5 : 1,
                      },
                    ]}
                  >
                    {/* Top Drag Handle */}
                    <View style={styles.handleContainer} pointerEvents="none">
                      <View style={[styles.handleBar, { backgroundColor: isDark ? '#4A443F' : '#DED8D1' }]} />
                    </View>

                    {/* Resting Content Container */}
                    <RNAnimated.View
                      style={[
                        styles.restingContentWrapper,
                        {
                          opacity: contentFadeAnim,
                        },
                      ]}
                    >
                      {activeMode === 'search' ? (
                        /* ================= SEARCH INPUT FIELD (Default) ================= */
                        <RNAnimated.View style={[styles.inputRowContent, { opacity: searchModeOpacity }]}>
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.muted} strokeWidth="2.2" strokeLinecap="round">
                            <Circle cx="11" cy="11" r="8" />
                            <Line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </Svg>

                          <TextInput
                            ref={searchInputRef}
                            style={[styles.textInput, { color: theme.colors.text.primary }]}
                            placeholder="Search or swipe up..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                            onSubmitEditing={handleSearchSubmit}
                            scrollEnabled={false}
                            autoCapitalize="words"
                            selectionColor={theme.colors.primary.default}
                          />

                          {hasSearchText && (
                            <TouchableOpacity
                              onPress={clearSearchQuery}
                              style={styles.clearButton}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              accessibilityLabel="Clear search text"
                            >
                              <Ionicons name="backspace-outline" size={18} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            onPress={handleSearchSubmit}
                            style={[styles.submitIconBtn, { backgroundColor: theme.colors.primary.default }]}
                            accessibilityLabel="Search"
                          >
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                              <Path d="M5 12h14" />
                              <Path d="m12 5 7 7-7 7" />
                            </Svg>
                          </TouchableOpacity>
                        </RNAnimated.View>
                      ) : (
                        /* ================= PROMPT INPUT FIELD ================= */
                        <RNAnimated.View style={[styles.inputRowContent, { opacity: aiModeOpacity }]}>
                          {/* '+' Attachment Button */}
                          <TouchableOpacity
                            style={[styles.plusButton, { backgroundColor: isDark ? '#2B2824' : '#EFE8DE' }]}
                            activeOpacity={0.7}
                            onPress={handleOpenAttachmentPicker}
                            accessibilityRole="button"
                            accessibilityLabel="Add attachment"
                          >
                            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary.default} strokeWidth="2.6" strokeLinecap="round">
                              <Line x1="12" y1="5" x2="12" y2="19" />
                              <Line x1="5" y1="12" x2="19" y2="12" />
                            </Svg>
                          </TouchableOpacity>

                          {/* Multiline Prompt TextInput */}
                          <TextInput
                            ref={aiInputRef}
                            style={[styles.textInput, { color: theme.colors.text.primary }]}
                            placeholder="Ask Ghumo AI or swipe up..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={aiPrompt}
                            maxLength={MAX_PROMPT_LENGTH}
                            onChangeText={(text) => {
                              const trimmed = text.slice(0, MAX_PROMPT_LENGTH);
                              setAiPrompt(trimmed);
                              if (!trimmed || trimmed.trim().length === 0) {
                                setPromptBoxHeight(SEARCH_BAR_HEIGHT);
                              }
                            }}
                            onContentSizeChange={(e) => {
                              const contentHeight = e?.nativeEvent?.contentSize?.height || 0;
                              if (!aiPrompt || aiPrompt.trim().length === 0) {
                                setPromptBoxHeight(SEARCH_BAR_HEIGHT);
                              } else {
                                const calculatedHeight = Math.max(SEARCH_BAR_HEIGHT, Math.ceil(contentHeight + 20));
                                setPromptBoxHeight(calculatedHeight);
                              }
                            }}
                            multiline={true}
                            scrollEnabled={false}
                            autoCapitalize="sentences"
                            blurOnSubmit={false}
                            selectionColor={theme.colors.primary.default}
                          />

                          {/* Clear backspace button */}
                          {hasPromptText && (
                            <TouchableOpacity
                              onPress={() => {
                                clearAiPrompt();
                                setPromptBoxHeight(SEARCH_BAR_HEIGHT);
                              }}
                              style={styles.clearButton}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              accessibilityLabel="Clear prompt text"
                            >
                              <Ionicons name="backspace-outline" size={18} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                          )}

                          {/* Send Button with Paper Plane Icon (Embedded Inside Text Box) */}
                          <TouchableOpacity
                            onPress={handlePromptSubmit}
                            disabled={!hasPromptText}
                            style={[
                              styles.paperPlaneButton,
                              {
                                backgroundColor: hasPromptText ? theme.colors.primary.default : (isDark ? '#2D2925' : '#E8E2D8'),
                                opacity: hasPromptText ? 1 : 0.6,
                              },
                            ]}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Send AI prompt"
                          >
                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={hasPromptText ? '#FFFFFF' : theme.colors.text.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <Path d="M22 2L11 13" />
                              <Path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </Svg>
                          </TouchableOpacity>
                        </RNAnimated.View>
                      )}
                    </RNAnimated.View>
                  </RNAnimated.View>
                </ProcessingOutline>
              </RNAnimated.View>
            </View>
          </GestureDetector>
        </Animated.View>

        {/* ================= EXPANDED FULL-SCREEN SHEET (Floating with exact same bottom margin) ================= */}
        <Animated.View
          style={[
            styles.expandedSheetContainer,
            {
              width: containerMaxWidth,
              height: currentExpandedHeight,
              bottom: bottomMargin,
              backgroundColor: isDark ? '#1D1B19' : theme.colors.background.surface,
              borderColor: activeMode === 'ai' ? theme.colors.primary.default : theme.colors.border.default,
              borderWidth: activeMode === 'ai' ? 1.5 : 1,
            },
            expandedSheetAnimatedStyle,
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          {/* Sheet Top Drag Header Area (Zone 1 Handle) */}
          <GestureDetector gesture={handlePanGesture}>
            <View style={styles.sheetHandleArea}>
              <View style={[styles.handleBar, { backgroundColor: isDark ? '#4A443F' : '#DED8D1' }]} />
            </View>
          </GestureDetector>

          {/* Active Overlay Content */}
          <View style={styles.sheetContent}>
            {activeMode === 'search' ? (
              <SearchView onClose={() => animateTo(0)} headerGesture={headerPanGesture} />
            ) : isAttachmentPickerOpen ? (
              <AttachmentPickerView
                onClose={() => animateTo(0)}
                headerGesture={headerPanGesture}
                onSelect={(type, name) => {
                  addAttachment({
                    id: `att_${Date.now()}`,
                    name,
                    type,
                  });
                  animateTo(0);
                }}
              />
            ) : (
              <PromptView onClose={() => animateTo(0)} headerGesture={headerPanGesture} />
            )}
          </View>
        </Animated.View>
      </RNAnimated.View>
    </>
  );
};

const styles = StyleSheet.create({
  scrimBackdrop: {
    backgroundColor: '#000000',
    zIndex: 90,
  },
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 0,
  },
  restingRowContainer: {
    width: '100%',
    alignItems: 'center',
  },
  floatingToggleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
    zIndex: 95,
    gap: 8,
  },
  floatingHeaderContainer: {
    flex: 1,
    height: MAP_BUTTON_SIZE,
    justifyContent: 'center',
    marginLeft: 6,
    position: 'relative',
  },
  floatingHeaderItem: {
    justifyContent: 'center',
  },
  floatingHeaderItemAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  floatingHeaderText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  floatingHeaderTextDark: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  floatingHeaderTextLight: {
    textShadowColor: 'rgba(255,255,255,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  pillsScrollView: {
    flex: 1,
    marginLeft: 4,
  },
  pillsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  mapCategoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  pillInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapPillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  floatingToggleButton: {
    width: MAP_BUTTON_SIZE,
    borderRadius: MAP_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  fullTouch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    gap: 12,
  },
  actionButtonWrapper: {
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    zIndex: 10,
  },
  actionButtonTouch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restingTextCard: {
    borderRadius: 26,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 50,
  },
  handleContainer: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  handleBar: {
    width: 32,
    height: 3.5,
    borderRadius: 2,
  },
  restingContentWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  inputRowContent: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.5,
    lineHeight: 20,
    paddingVertical: 0,
    fontWeight: '400',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  clearButton: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  submitIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperPlaneButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D95338',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  expandedSheetContainer: {
    position: 'absolute',
    borderRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
    overflow: 'hidden',
    zIndex: 60,
  },
  sheetHandleArea: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sheetContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
