import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ServizoBackButton({
  to,
  label = "Back",
  style,
}) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleBack = () => {
    if (to) {
      navigation.navigate(to);
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backBtn, style]}
      onPress={handleBack}
      activeOpacity={0.7}
    >
      <Text style={[styles.backText, { color: theme.colors.primary }]}>
        <Ionicons name="arrow-back-circle-sharp" size={24} color={theme.colors.primary} /> {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
