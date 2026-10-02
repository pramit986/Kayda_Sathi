// ============================================================
// Kayda Sathi — VoiceInput Component (expo-audio)
// ============================================================
// Uses expo-audio for native voice recording in modern Expo (SDK 52+).
// Safely handles microphone permissions, encodes audio, sends via
// FormData to /api/analyze, and returns the legal analysis.

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants';
import { api, LegalAnalysis } from '@/services/api';

export interface VoiceInputProps {
  onAnalysisSuccess?: (analysis: LegalAnalysis) => void;
  onTranscribeSuccess?: (transcribedText: string) => void;
  onError?: (errorMessage: string) => void;
  fallbackText?: string;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onAnalysisSuccess,
  onTranscribeSuccess,
  onError,
  fallbackText,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Initialize the modern expo-audio recorder hook
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Animation values for glowing pulsing rings while recording
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  // Pulse animation loop
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isRecording]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recorder.isRecording) {
        recorder.stop().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isProcessing) return;

    try {
      // 1. Request microphone permissions
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access to speak your legal issue to Kayda Sathi.'
        );
        onError?.('Microphone permission denied');
        return;
      }

      // 2. Configure audio mode
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // 3. Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();

      setIsRecording(true);
      setRecordingDuration(0);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      const msg = err?.message || 'Could not start microphone recording.';
      Alert.alert('Recording Error', msg);
      onError?.(msg);
      setIsRecording(false);
    }
  };

  const stopRecordingAndAnalyze = async () => {
    if (!isRecording) return;

    // Stop duration timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        throw new Error('Recording URI is null. Audio file could not be retrieved.');
      }

      // Send to backend via FormData
      const result = await api.analyzeVoice(uri, fallbackText);

      if (result.transcribed_text) {
        onTranscribeSuccess?.(result.transcribed_text);
      }
      onAnalysisSuccess?.(result);
    } catch (err: any) {
      console.error('Failed to process voice recording:', err);
      const msg = err?.message || 'Failed to process voice recording.';
      Alert.alert('Voice Analysis Error', msg);
      onError?.(msg);
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  const cancelRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorder.isRecording) {
      try {
        await recorder.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color={Colors.primary[600]} />
          <Text style={styles.processingText}>Transcribing & analyzing audio with AI...</Text>
        </View>
      ) : isRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.activeRecordingRow}>
            <Animated.View
              style={[
                styles.pulseIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons name="mic" size={20} color={Colors.error[600]} />
            </Animated.View>
            <View style={styles.timerBlock}>
              <Text style={styles.recordingTimer}>{formatDuration(recordingDuration)}</Text>
              <Text style={styles.recordingStatusLabel}>Listening... Speak clearly</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={cancelRecording}
              hitSlop={8}
            >
              <Ionicons name="close-circle-outline" size={20} color={Colors.neutral[500]} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.stopBtn}
              onPress={stopRecordingAndAnalyze}
              hitSlop={8}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.neutral[0]} />
              <Text style={styles.stopBtnText}>Done (Analyze)</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={[styles.micButton, disabled && styles.micButtonDisabled]}
          onPress={startRecording}
          disabled={disabled}
        >
          <View style={styles.micIconWrapper}>
            <Ionicons name="mic" size={18} color={Colors.primary[600]} />
          </View>
          <View style={styles.micTextWrapper}>
            <Text style={styles.micButtonTitle}>Tap to Speak</Text>
            <Text style={styles.micButtonSubtitle}>Describe your issue in your own words</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default VoiceInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  micIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  micTextWrapper: {
    flex: 1,
  },
  micButtonTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  micButtonSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.primary[600],
    marginTop: 1,
  },
  recordingContainer: {
    backgroundColor: Colors.error[50],
    borderWidth: 1.5,
    borderColor: Colors.error[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  activeRecordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  pulseIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  timerBlock: {
    flex: 1,
  },
  recordingTimer: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.error[700],
    fontVariant: ['tabular-nums'],
  },
  recordingStatusLabel: {
    fontSize: FontSize.xs,
    color: Colors.error[600],
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.error[100],
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  cancelBtnText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.error[600],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  stopBtnText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[0],
    fontWeight: '700',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  processingText: {
    fontSize: FontSize.sm,
    color: Colors.primary[700],
    fontWeight: '600',
  },
});
