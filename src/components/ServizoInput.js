import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  ...props
}) {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && { shadowOpacity: 0.15, transform: [{ scale: 1.01 }] },
          style,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={COLORS.primary}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            Platform.OS === "web" && {
              outline: "none", // ✅ no outline
              border: "none", // ✅ no border
              boxShadow: "none", // ✅ remove browser’s inset shadow
              appearance: "none", // ✅ removes default style in Safari/Edge
              backgroundColor: "transparent",
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.primary}
              style={styles.iconRight}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: 12,
    height: 48,
    // ✨ soft shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 0,
    outlineWidth: 0,
    outline: "none",
  },
});
