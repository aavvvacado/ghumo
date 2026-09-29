/**
 * Processing Outline Component
 * Renders an animated accent-color beam that rotates ~40% of its perimeter
 * continuously around the rounded text input field while a request is processing.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '@/context/themeContext';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface ProcessingOutlineProps {
  isProcessing: boolean;
  borderRadius?: number;
  strokeWidth?: number;
  accentColor?: string;
  children?: React.ReactNode;
}

export const ProcessingOutline: React.FC<ProcessingOutlineProps> = ({
  isProcessing,
  borderRadius = 25,
  strokeWidth = 2.0,
  accentColor,
  children,
}) => {
  const { theme } = useTheme();
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const activeColor = accentColor || theme.colors.primary.default;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0 && (width !== layout.width || height !== layout.height)) {
      setLayout({ width, height });
    }
  };

  const { width, height } = layout;
  // Exact perimeter of rounded rectangle: 2*(W+H) - (8 - 2*PI)*R
  const perimeter = width > 0 && height > 0
    ? Math.max(10, 2 * (width + height) - 1.7168 * borderRadius)
    : 100;

  const dashOffset = useSharedValue(0);
  const opacityAnim = useSharedValue(0);

  useEffect(() => {
    if (isProcessing) {
      opacityAnim.value = withTiming(1, { duration: 250 });
      dashOffset.value = 0;
      dashOffset.value = withRepeat(
        withTiming(-perimeter, {
          duration: 1800,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      opacityAnim.value = withTiming(0, { duration: 200 });
      dashOffset.value = 0;
    }
  }, [isProcessing, perimeter, dashOffset, opacityAnim]);

  const animatedRectProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: dashOffset.value,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,
    };
  });

  const strokeDasharray = `${perimeter * 0.4} ${perimeter * 0.6}`;

  return (
    <View style={styles.container} onLayout={onLayout}>
      {children}

      {width > 0 && height > 0 && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.svgOverlay,
            overlayAnimatedStyle,
          ]}
          pointerEvents="none"
        >
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <AnimatedRect
              x={strokeWidth / 2}
              y={strokeWidth / 2}
              width={Math.max(0, width - strokeWidth)}
              height={Math.max(0, height - strokeWidth)}
              rx={borderRadius}
              ry={borderRadius}
              fill="none"
              stroke={activeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              animatedProps={animatedRectProps}
            />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  svgOverlay: {
    zIndex: 20,
  },
});
