import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { COLORS, SIZES } from "../utils/constants";

export default function ServizoDatePicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(false);

    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      onChange(formatted);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* WEB DATE INPUT */}
      {Platform.OS === "web" ? (
        <TextInput
          style={styles.inputContainer}
          value={value}
          onChangeText={onChange}
          placeholder="Select Date"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShow(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
              style={styles.icon}
            />

            <Text style={styles.text}>
              {value || "Select Date"}
            </Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display="spinner"
              onChange={handleChange}
            />
          )}
        </>
      )}
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },

  icon: {
    marginRight: 8,
  },

  text: {
    fontSize: 15,
    color: COLORS.textDark,
  },
});