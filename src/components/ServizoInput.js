import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SIZES } from "../utils/constants";

export default function ServizoInput({
  label,
  placeholder,
  icon,
  secureTextEntry = false,
  value,
  onChangeText,
  keyboardType = "default",
  style,
  error,
  disabled = false,
  ...props
}) {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  // Animated values
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Shake animation for errors
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Interpolated styles
  const animatedScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const animatedBorderColor = isFocused
    ? COLORS.primary
    : error
    ? "#FF6B6B"
    : "transparent";

  const animatedShadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.2],
  });

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, isFocused && styles.labelFocused]}>
            {label}
          </Text>
          {props.required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          {
            transform: [{ scale: animatedScale }, { translateX: shakeAnim }],
            borderColor: animatedBorderColor,
            borderWidth: isFocused || error ? 1.5 : 0,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        {/* Gradient-like glow effect on focus */}
        {isFocused && (
          <View style={styles.focusGlow} pointerEvents="none" />
        )}

        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.textLight}
              style={styles.icon}
            />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            !icon && { paddingLeft: 16 },
            Platform.OS === "web" && styles.webInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight + "90"}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={hidePassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          selectionColor={COLORS.primary}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.textLight}
            />
          </TouchableOpacity>
        )}

        {/* Success checkmark when valid */}
        {value && !error && !secureTextEntry && (
          <View style={styles.validIcon}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          </View>
        )}
      </Animated.View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  required: {
    color: "#FF6B6B",
    marginLeft: 4,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    height: 54,
    overflow: "hidden",
    // Refined shadow
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  focusGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary + "05",
    borderRadius: SIZES.radius * 1.5,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  icon: {
    opacity: 0.9,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 16,
    paddingRight: 16,
    letterSpacing: 0.2,
  },
  webInput: {
    outlineStyle: "none",
  },
  eyeButton: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  validIcon: {
    paddingRight: 16,
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: "#F5F5F5",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginLeft: 4,
    fontWeight: "500",
  },
});
