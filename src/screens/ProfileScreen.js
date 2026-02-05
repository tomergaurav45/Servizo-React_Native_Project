import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Allow access to gallery to upload profile picture"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Profile Image */}
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          <Image
            source={
              image
                ? { uri: image }
                : require("../../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Actions */}
        <TouchableOpacity style={styles.option}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <Text style={styles.optionText}>Manage Address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.optionText}>Help & Support</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  imageWrapper: {
    position: "relative",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    color: COLORS.textDark,
  },
  email: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 25,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.textDark,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    marginTop: "auto",
  },
  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
