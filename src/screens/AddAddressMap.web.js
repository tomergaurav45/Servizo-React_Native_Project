import { Text, View } from "react-native";

export default function AddAddressMap() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 16 }}>📍 Map not supported on web</Text>
      <Text style={{ marginTop: 8, color: "#666" }}>
        Please use mobile app for location selection
      </Text>
    </View>
  );
}