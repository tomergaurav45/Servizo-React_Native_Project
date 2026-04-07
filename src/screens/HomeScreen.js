import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { registerUser } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";
const categories = [
  { id: 1, name: "Home Cleaning", icon: "home-outline" },
  { id: 2, name: "Electrician", icon: "flash-outline" },
  { id: 3, name: "Plumber", icon: "water-outline" },
  { id: 4, name: "Salon", icon: "cut-outline" },
  { id: 5, name: "AC Repair", icon: "snow-outline" },
  { id: 6, name: "Appliance Repair", icon: "build-outline" },
];

export default function HomeScreen() {

  const { user, updateRole } = useAuth();

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const addr = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addr.length > 0) {
        setAddress(`${addr[0].city}, ${addr[0].region}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (user && !user.role) {
      setShowRoleModal(true);
    } else {
      setShowRoleModal(false);
    }
  }, [user]);

  const selectRole = async (role) => {
    try {

      const response = await registerUser({
        userId: user.userId,
        role: role
      });

      if (response.success) {

        updateRole(role);

        setShowRoleModal(false);

        if (role === "customer") {
          Toast.show({
            type: "success",
            text1: "Congratulations 🎉",
            text2: "You can now find trusted services on Servizo",
          });
        }

        if (role === "provider") {
          Toast.show({
            type: "success",
            text1: "Congratulations 🎉",
            text2: "You can now offer services and earn with Servizo",
          });
        }

      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "Role update failed",
        });
      }

    } catch (error) {

      Toast.show({
        type: "error",
        text1: "Server Error",
        text2: "Unable to update role",
      });

    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={showRoleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Image
                source={require("../../assets/images/icon1.png")}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>
                Welcome to Servizo
              </Text>
            </View>

            <Text style={styles.modalSubtitle}>
              How do you want to use Servizo?
            </Text>

            {/* Find Services */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => selectRole("customer")}
            >
              <Ionicons name="search-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.roleTitle}>Find Services</Text>
                <Text style={styles.roleSubtitle}>
                  Book trusted professionals
                </Text>
              </View>
            </TouchableOpacity>

            {/* Offer Services */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => selectRole("provider")}
            >
              <Ionicons name="briefcase-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.roleTitle}>Offer Services</Text>
                <Text style={styles.roleSubtitle}>
                  Earn money with your skills
                </Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
       <TouchableOpacity
  style={styles.locationBar}
  onPress={() => navigation.navigate("ManageAddressScreen")}
>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />

          <View style={{ marginLeft: 8 }}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.locationText}>
              {address || "Detecting location..."}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color="#999"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome to Servizo</Text>
            <Text style={styles.subText}>
              How would you like to use the app?
            </Text>
          </View>

        <TouchableOpacity
  style={styles.notificationIcon}
  onPress={() => navigation.navigate("NotificationScreen")}
>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <Text style={styles.searchText}>Search for services</Text>
        </TouchableOpacity>


        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <TouchableOpacity key={item.id} style={styles.categoryCard}>
              <Ionicons name={item.icon} size={28} color={COLORS.primary} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Services */}
        <Text style={styles.sectionTitle}>Popular Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.popularCard}>
            <Text style={styles.popularTitle}>Full Home Cleaning</Text>
            <Text style={styles.popularPrice}>Starting ₹999</Text>
          </View>

          <View style={styles.popularCard}>
            <Text style={styles.popularTitle}>AC Servicing</Text>
            <Text style={styles.popularPrice}>Starting ₹499</Text>
          </View>
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 15,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  subText: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchText: {
    marginLeft: 10,
    color: "#888",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.textDark,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  popularCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 14,
    marginRight: 12,
    width: 220,
  },
  popularTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  popularPrice: {
    color: "#fff",
    marginTop: 6,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  notificationIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },

  locationLabel: {
    fontSize: 12,
    color: "#777",
  },

  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 6,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  modalIcon: {
    width: 70,
    height: 70,
    marginRight: 8,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  modalSubtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
    fontWeight: "bold"
  },

  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  roleSubtitle: {
    fontSize: 13,
    color: "#666",
  },
});


