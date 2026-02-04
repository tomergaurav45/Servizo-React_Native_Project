import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../utils/constants";

export default function ServizoButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = "primary",
  iconLeft = null,
  iconRight = null,
}) {
  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: COLORS.secondary || "#6c757d",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: COLORS.primary,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {iconLeft && <>{iconLeft}</>}
          <Text
            style={[
              styles.text,
              variant === "outline"
                ? { color: COLORS.primary }
                : { color: COLORS.white },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight && <>{iconRight}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: Platform.OS === "web" ? 14 : 12,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
