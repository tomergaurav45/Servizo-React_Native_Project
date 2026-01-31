import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../utils/constants";

const services = [
  { id: 1, name: "Electrician", icon: "⚡" },
  { id: 2, name: "Plumber", icon: "🚰" },
  { id: 3, name: "Cleaning", icon: "🧹" },
  { id: 4, name: "Salon", icon: "💇‍♀️" },
  { id: 5, name: "AC Repair", icon: "❄️" },
  { id: 6, name: "Carpenter", icon: "🪚" },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hello 👋</Text>
          <Text style={styles.location}>Delhi NCR</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.profile}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBox}>
        <Text style={styles.searchText}>Search for services...</Text>
      </TouchableOpacity>

      {/* Services */}
      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.grid}>
        {services.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Services */}
      <Text style={styles.sectionTitle}>Popular Services</Text>
      <View style={styles.popularCard}>
        <Text>🔥 AC Servicing</Text>
      </View>
      <View style={styles.popularCard}>
        <Text>🧽 Bathroom Cleaning</Text>
      </View>
      <View style={styles.popularCard}>
        <Text>💇‍♀️ Salon at Home</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcome: {
    fontSize: 18,
    color: COLORS.textDark,
  },
  location: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  profile: {
    fontSize: 26,
  },
  searchBox: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  searchText: {
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "30%",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  popularCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
});
