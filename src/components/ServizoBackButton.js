import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../utils/constants";

export default function ServizoBackButton({
  to,
  label = "Back",
  style,
}) {
  const navigation = useNavigation();

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
      <Text style={styles.backText}><Ionicons name="arrow-back-circle-sharp" size={24} color={COLORS.primary} /> {label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "600",
  },
});