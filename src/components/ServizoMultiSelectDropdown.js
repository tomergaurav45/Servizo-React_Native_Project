import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { COLORS, SIZES } from "../utils/constants";

export default function ServizoMultiSelectDropdown({
  label,
  icon,
  data = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
}) {
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    setTempSelected(selectedValues);
  }, [selectedValues]);

  const toggleItem = (item) => {
    let updated;

    if (tempSelected.includes(item)) {
      updated = tempSelected.filter((v) => v !== item);
    } else {
      updated = [...tempSelected, item];
    }

    setTempSelected(updated);
  };

  const handleSave = () => {
    onChange(tempSelected);
    setOpen(false);
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Dropdown Input */}
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setOpen(!open)}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={COLORS.primary}
            style={styles.icon}
          />
        )}

        <Text style={styles.text}>
          {selectedValues.length > 0
            ? selectedValues.join(", ")
            : placeholder}
        </Text>

        <Ionicons
          name={open ? "chevron-up-outline" : "chevron-down-outline"}
          size={20}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {/* Dropdown List */}
      {open && (
        <View style={styles.dropdown}>
        <ScrollView style={{ maxHeight: 180 }}
        nestedScrollEnabled={true}
  showsVerticalScrollIndicator={true}
   showsHorizontalScrollIndicator={false}>
  {data.map((item, index) => {
    const selected = tempSelected.includes(item);

    return (
      <TouchableOpacity
        key={index}
        style={styles.option}
        onPress={() => toggleItem(item)}
      >
        <Text style={styles.optionText}>{item}</Text>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={COLORS.primary}
          />
        )}
      </TouchableOpacity>
    );
  })}
</ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: "space-between",
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
    flex: 1,
    color: COLORS.textDark,
  },

  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
    paddingBottom: 10,
  },

  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  optionText: {
    fontSize: 15,
    color: COLORS.textDark,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },

  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  clearText: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});