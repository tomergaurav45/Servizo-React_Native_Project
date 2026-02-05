
import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi </Text>
          <Text style={styles.subText}>What service do you need today?</Text>
        </View>

        {/* Search */}
        <TouchableOpacity style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <Text style={styles.searchText}>Search for services</Text>
        </TouchableOpacity>

        {/* Categories */}
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
    fontSize: 22,
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
});


