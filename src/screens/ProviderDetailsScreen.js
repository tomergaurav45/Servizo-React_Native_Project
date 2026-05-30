import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProviderReviews } from "../apis/authApi";
import { useTheme } from "../context/ThemeContext";

export default function ProviderProfileScreen({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = theme.colors;

  const provider = route?.params?.provider;

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const res = await getProviderReviews(
        provider?.providerId
      );

      if (res.success) {
        setReviews(res.data?.reviews || []);
        setAvgRating(res.data?.avgRating || 0);
        setTotalReviews(res.data?.totalReviews || 0);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Provider Profile
          </Text>

          <View style={{ width: 40 }} />
        </View>

       
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {provider?.name
                ?.split(" ")
                ?.map((n) => n[0])
                ?.join("")
                ?.slice(0, 2)
                ?.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {provider?.name}
          </Text>

          <Text style={styles.role}>
            {provider?.experience || "Provider"}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons
              name="star"
              size={18}
              color={colors.warning}
            />

            <Text style={styles.ratingText}>
              {avgRating || "0"} ({totalReviews} reviews)
            </Text>
          </View>
        </View>

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Contact Information
          </Text>

          <InfoRow
            icon="call-outline"
            value={provider?.phone || "Not Available"}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="mail-outline"
            value={provider?.email || "Not Available"}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="person-outline"
            value={provider?.gender || "Not Available"}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="briefcase-outline"
            value={provider?.availability || "Available"}
            colors={colors}
            styles={styles}
          />
        </View>

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer Reviews
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>
              No reviews yet
            </Text>
          ) : (
            reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewUser}>
                    {review?.userName || "User"}
                  </Text>

                  <View style={styles.reviewRating}>
                    <Ionicons
                      name="star"
                      size={14}
                      color={colors.warning}
                    />

                    <Text style={styles.reviewRatingText}>
                      {review?.rating}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reviewComment}>
                  {review?.comment || "No comment"}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({
  icon,
  value,
  colors,
  styles,
}) => (
  <View style={styles.infoRow}>
    <Ionicons
      name={icon}
      size={18}
      color={colors.primary}
    />

    <Text style={styles.infoText}>
      {value}
    </Text>
  </View>
);

const createStyles = (theme) => {
  const c = theme.colors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
    },

    profileCard: {
      backgroundColor: c.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      marginBottom: 20,
    },

    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: c.primary + "22",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },

    avatarText: {
      fontSize: 30,
      fontWeight: "800",
      color: c.primary,
    },

    name: {
      fontSize: 24,
      fontWeight: "700",
      color: c.text,
    },

    role: {
      fontSize: 14,
      color: c.textMuted,
      marginTop: 4,
    },

    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      gap: 6,
    },

    ratingText: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },

    section: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 18,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: c.text,
      marginBottom: 14,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 12,
    },

    infoText: {
      fontSize: 14,
      color: c.text,
    },

    emptyText: {
      color: c.textMuted,
      textAlign: "center",
      marginTop: 10,
    },

    reviewCard: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },

    reviewTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },

    reviewUser: {
      fontSize: 14,
      fontWeight: "700",
      color: c.text,
    },

    reviewRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    reviewRatingText: {
      fontSize: 13,
      fontWeight: "600",
      color: c.text,
    },

    reviewComment: {
      fontSize: 13,
      lineHeight: 20,
      color: c.textMuted,
    },
  });
};