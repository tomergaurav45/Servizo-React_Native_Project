import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServizoAlert } from "../components/ServizoAlert";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";


const MENU_ITEMS_TOP = [
  {
    icon: "person-outline",
    label: "Edit Profile",
    screen: "EditProfileScreen",
    iconBg: "#eef4ff",
    iconColor: "#4a7fe0",
  },
  {
    icon: "location-outline",
    label: "Manage Address",
    screen: "ManageAddressScreen",
    iconBg: "#fff0e6",
    iconColor: "#e07a4a",
  },
  {
    icon: "document-text-outline",
    label: "My Activities",
    screen: "ActivityScreen",
    iconBg: "#e8f8f2",
    iconColor: "#3ab07d",
  },
  {
    icon: "chatbubble-ellipses-outline",
    label: "My Ratings / Reviews",
    screen: "ReviewScreen",
    iconBg: "#fdf0ff",
    iconColor: "#9b59b6",
    providerOnly: true,
  },
];

const MENU_ITEMS_BOTTOM = [
  {
    icon: "lock-closed-outline",
    label: "Change Password",
    screen: "ChangePassword",
    iconBg: "#fff5e6",
    iconColor: "#e0943a",
  },
  {
    icon: "help-circle-outline",
    label: "Help & Support",
    screen: "HelpSupportScreen",
    iconBg: "#e8f5ff",
    iconColor: "#3a9ee0",
  },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [image, setImage] = useState(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const isProvider = user?.role === "provider";

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const renderMenuItem = (item, index, arr) => {
    if (item.providerOnly && !isProvider) return null;
    return (
      <View key={item.screen}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.icon} size={18} color={item.iconColor} />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
        {index < arr.length - 1 && <View style={styles.menuSep} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Dark Profile Card */}
        <View style={styles.profileCard}>
          {/* Decorative circles */}
          <View style={styles.deco1} />
          <View style={styles.deco2} />

          <View style={styles.profileRow}>
            {/* Avatar */}
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../assets/images/avatar.png")
                }
                style={styles.avatar}
              />
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={11} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            {/* User info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "Your Name"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "email@example.com"}</Text>
              <View style={styles.roleBadge}>
                <View style={styles.roleDot} />
                <Text style={styles.roleText}>
                  {isProvider ? "Provider" : "Customer"}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          {isProvider && (
            <View style={styles.statsRow}>
              {[
                { label: "Jobs Done", value: "24", screen: "ActivityScreen" },
                { label: "Rating", value: "4.8", screen: "ReviewScreen" },
                { label: "Pending", value: "3", screen: "ActivityScreen" },
              ].map((stat, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.statBox}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate(stat.screen)}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Menu Group 1 */}
        <View style={styles.menuCard}>
          {MENU_ITEMS_TOP.map((item, i) => renderMenuItem(item, i, MENU_ITEMS_TOP))}
        </View>

        {/* Menu Group 2 */}
        <View style={styles.menuCard}>
          {MENU_ITEMS_BOTTOM.map((item, i) =>
            renderMenuItem(item, i, MENU_ITEMS_BOTTOM)
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutAlert(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#f8f7f4" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>


        <ServizoAlert
          visible={showLogoutAlert}
          title="Logout"
          message="Are you sure you want to logout?"
          onCancel={() => setShowLogoutAlert(false)}
          onConfirm={() => {
            setShowLogoutAlert(false);
            logout();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f7f4",
  },
  scroll: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8e6e1",
    alignItems: "center",
    justifyContent: "center",
  },

  // Profile Card
  profileCard: {
    margin: 12,
    backgroundColor: "#1c1c1e",
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
  },
  deco1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  deco2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#c49a7a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  cameraBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#f8f7f4",
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 13,
    color: "#a09e9a",
    marginTop: 3,
    fontWeight: "300",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    backgroundColor: "rgba(245,200,66,0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(245,200,66,0.35)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f5c842",
  },
  roleText: {
    fontSize: 11,
    color: "#f5c842",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8f7f4",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: "#a09e9a",
    marginTop: 2,
  },

  // Menu Cards
  menuCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: "#e8e6e1",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "400",
  },
  menuSep: {
    height: 0.5,
    backgroundColor: "#e8e6e1",
    marginLeft: 68,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1c1c1e",
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: 18,
    paddingVertical: 16,
  },
  logoutText: {
    color: "#f8f7f4",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});