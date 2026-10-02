// Re-export from Theme for backward compatibility
import { Colors as ThemeColors } from './Theme';

const Colors = {
  light: {
    text: ThemeColors.neutral[900],
    background: ThemeColors.neutral[50],
    tint: ThemeColors.primary[500],
    tabIconDefault: ThemeColors.neutral[400],
    tabIconSelected: ThemeColors.primary[500],
  },
  dark: {
    text: ThemeColors.neutral[0],
    background: ThemeColors.neutral[900],
    tint: ThemeColors.neutral[0],
    tabIconDefault: ThemeColors.neutral[400],
    tabIconSelected: ThemeColors.neutral[0],
  },
};

export default Colors;
