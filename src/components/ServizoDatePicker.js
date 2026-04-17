import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { COLORS, SIZES } from "../utils/constants";

export default function ServizoDatePicker({
  label,
  value,
  onChange,
  required = false,
}) {
  const [show, setShow] = useState(false);


  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      onChange(formatted);
    }
  };


  const formatDisplayDate = (date) => {
    if (!date) return "Select Date";

    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}


      {Platform.OS === "web" ? (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={styles.webInput}
          max={new Date().toISOString().split("T")[0]} // ❌ future dates blocked
        />
      ) : (
        <>

          <TouchableOpacity
            style={[
              styles.inputContainer,
              required && !value && { borderColor: "red", borderWidth: 1 },
            ]}
            onPress={() => setShow(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
              style={styles.icon}
            />

            <Text
              style={[
                styles.text,
                !value && { color: "#999" }
              ]}
            >
              {formatDisplayDate(value)}
            </Text>
          </TouchableOpacity>


          {show && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display="spinner"
              maximumDate={new Date()} // ❌ no future date
              onChange={handleChange}
            />
          )}
        </>
      )}


      {required && !value && (
        <Text style={styles.errorText}>Please select date</Text>
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

  webInput: {
    height: 48,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});