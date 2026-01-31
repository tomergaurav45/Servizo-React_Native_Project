import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../utils/constants";

export default function ServizoCheckbox({
  label,
  checked = false,
  onChange,
  size = 22,
  color = COLORS.primary2,
  style,
  labelStyle,
}) {
  const [isChecked, setIsChecked] = useState(checked);

  const toggleCheck = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleCheck}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: isChecked ? color : COLORS.primary2 },
          isChecked && { backgroundColor: color },
        ]}
      >
        {isChecked && <Ionicons name="checkmark" size={size - 8} color={COLORS.white} />}
      </View>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textDark,
  },
});
