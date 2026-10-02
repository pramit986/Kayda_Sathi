// ============================================================
// Kayda Sathi — Button Component
// ============================================================

import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing, Shadow } from '@/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: variantStyle.bg, borderColor: variantStyle.border },
        variantStyle.border !== 'transparent' && styles.bordered,
        sizeStyle.container,
        variant === 'primary' && Shadow.sm,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyle.iconSize}
              color={isDisabled ? Colors.neutral[400] : variantStyle.text}
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: isDisabled ? Colors.neutral[400] : variantStyle.text },
              sizeStyle.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyle.iconSize}
              color={isDisabled ? Colors.neutral[400] : variantStyle.text}
              style={{ marginLeft: Spacing.sm }}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: Colors.primary[500],
    text: Colors.neutral[0],
    border: 'transparent',
  },
  secondary: {
    bg: Colors.primary[50],
    text: Colors.primary[500],
    border: 'transparent',
  },
  outline: {
    bg: 'transparent',
    text: Colors.primary[500],
    border: Colors.neutral[300],
  },
  ghost: {
    bg: 'transparent',
    text: Colors.primary[500],
    border: 'transparent',
  },
  danger: {
    bg: Colors.error[500],
    text: Colors.neutral[0],
    border: 'transparent',
  },
};

const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
  sm: {
    container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    text: { fontSize: FontSize.sm },
    iconSize: 16,
  },
  md: {
    container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
    text: { fontSize: FontSize.md },
    iconSize: 18,
  },
  lg: {
    container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing['2xl'] },
    text: { fontSize: FontSize.lg },
    iconSize: 20,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  bordered: {
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
  },
});
