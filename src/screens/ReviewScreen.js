import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProviderReviews } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoLoader from "../components/ServizoLoader";
import { useAuth } from "../context/AuthContext";

const C = {
  bg: "#F7F5F0",
  card: "#FFFFFF",
  primary: "#1C1A17",
  accent: "#C4AA7A",
  muted: "#A89F8E",
  subtext: "#7A7263",
  body: "#5A5449",
  border: "#EAE7E0",
  pill: "#F0EDE7",
  positive: { bg: "#E1F5EE", text: "#0F6E56", stroke: "#5DCAA5" },
  negative: { bg: "#FCEBEB", text: "#A32D2D", stroke: "#F09595" },
  star: "#C4AA7A",
  starEmpty: "#E0DDD6",
};


function Stars({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={size}
          color={i <= rating ? C.star : C.starEmpty}
        />
      ))}
    </View>
  );
}


function SentimentBadge({ rating }) {
  const positive = rating >= 4;
  const neutral = rating === 3;
  const palette = positive ? C.positive : neutral
    ? { bg: "#FAEEDA", text: "#854F0B" }
    : C.negative;
  const label = positive ? "Positive" : neutral ? "Neutral" : "Negative";
  const icon = positive ? "thumbs-up-outline" : neutral ? "remove-outline" : "thumbs-down-outline";

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Ionicons name={icon} size={10} color={palette.text} />
      <Text style={[styles.badgeText, { color: palette.text }]}>{label}</Text>
    </View>
  );
}


function Avatar({ name }) {
  const parts = name.trim().split(" ");
  const initials = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  const colors = [
    { bg: "#EEEDFE", text: "#534AB7" },
    { bg: "#E1F5EE", text: "#0F6E56" },
    { bg: "#FAECE7", text: "#993C1D" },
    { bg: "#FBEAF0", text: "#993556" },
    { bg: "#E6F1FB", text: "#185FA5" },
  ];
  const palette = colors[name.charCodeAt(0) % colors.length];
  return (
    <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
      <Text style={[styles.avatarText, { color: palette.text }]}>
        {initials.toUpperCase()}
      </Text>
    </View>
  );
}


function ReviewCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <Avatar name={item.name} />
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <SentimentBadge rating={item.rating} />
          </View>
          <Stars rating={item.rating} />
        </View>
      </View>

      <Text style={styles.comment} numberOfLines={2}>{item.comment}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={11} color={C.muted} />
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.viewMore}>View details →</Text>
      </View>
    </TouchableOpacity>
  );
}


function ReviewModal({ review, visible, onClose }) {
  if (!review) return null;
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalAvatarRow}>
            <Avatar name={review.name} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.modalName}>{review.name}</Text>
              <Stars rating={review.rating} size={16} />
            </View>
            <SentimentBadge rating={review.rating} />
          </View>

          <View style={styles.modalDivider} />

          <Text style={styles.modalComment}>{review.comment}</Text>

          <View style={styles.modalDateRow}>
            <Ionicons name="time-outline" size={13} color={C.muted} />
            <Text style={styles.modalDate}>{review.date}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}


function RatingSummary({ reviews }) {
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const pos = reviews.filter((r) => r.rating >= 4).length;
  const neg = reviews.filter((r) => r.rating <= 2).length;

  return (
    <View style={styles.summary}>
      <View style={styles.summaryMain}>
        <Text style={styles.summaryAvg}>{avg}</Text>
        <Stars rating={Math.round(Number(avg))} size={12} />
        <Text style={styles.summaryTotal}>{reviews.length} reviews</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.positive.text }]}>{pos}</Text>
          <Text style={styles.statLabel}>Positive</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.negative.text }]}>{neg}</Text>
          <Text style={styles.statLabel}>Negative</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.primary }]}>
            {reviews.length - pos - neg}
          </Text>
          <Text style={styles.statLabel}>Neutral</Text>
        </View>
      </View>
    </View>
  );
}


const TABS = [
  { key: "all", label: "All", icon: "list-outline" },
  { key: "positive", label: "Positive", icon: "thumbs-up-outline" },
  { key: "negative", label: "Negative", icon: "thumbs-down-outline" },
];



export default function ReviewScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const filtered = reviews.filter((r) => {
    if (activeTab === "positive") return r.rating >= 4;
    if (activeTab === "negative") return r.rating <= 2;
    return true;
  });

  const openModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);

      const providerId = user?.userId;

      const res = await getProviderReviews(providerId);

      console.log("REVIEWS API:", res);

      if (res.success) {
        const formatted = res.data.reviews.map((r, i) => ({
          id: i.toString(),
          name: r.userName,
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.createdAt).toLocaleDateString(),
        }));

        setReviews(formatted);
      } else {
        setReviews([]);
      }

      setLoading(false);
    };

    if (user?.userId) {
      fetchReviews();
    }
  }, [user]);


  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.topBar}>
        <ServizoBackButton />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Feedback</Text>
        <Text style={styles.heroTitle}>
          My <Text style={styles.heroTitleItalic}>Reviews</Text>
        </Text>
        <Text style={styles.heroSub}>See what people say about you</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <RatingSummary reviews={reviews} />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={active ? "#fff" : C.subtext}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {loading ? (
        <View style={{ marginTop: 40 }}>
          <ServizoLoader text="Fetching addresses..." />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ReviewCard item={item} onPress={openModal} />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reviews found</Text>
          }
        />
      )}

      <ReviewModal
        review={selectedReview}
        visible={showModal}
        onClose={() => setShowModal(false)}
      />

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  topBar: { paddingHorizontal: 20, paddingTop: 8 },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: C.primary,
    lineHeight: 32,
  },
  heroTitleItalic: {
    fontStyle: "italic",
    fontWeight: "400",
    color: "#6B5E3F",
  },
  heroSub: { fontSize: 13, color: C.subtext, marginTop: 2 },


  summary: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  summaryMain: { alignItems: "center", gap: 4 },
  summaryAvg: {
    fontSize: 32,
    fontWeight: "300",
    color: C.primary,
    lineHeight: 36,
  },
  summaryTotal: { fontSize: 11, color: C.muted, marginTop: 2 },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: C.border,
  },
  summaryStats: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 2 },
  statNum: { fontSize: 20, fontWeight: "500" },
  statLabel: { fontSize: 11, color: C.muted },


  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  tabText: { fontSize: 13, color: C.subtext },
  tabTextActive: { color: "#fff", fontWeight: "500" },


  list: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  emptyText: {
    textAlign: "center",
    color: C.subtext,
    fontSize: 14,
    marginTop: 40,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: { fontSize: 14, fontWeight: "600", color: C.primary, flex: 1 },
  comment: { fontSize: 13, color: C.body, lineHeight: 19 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  date: { fontSize: 11, color: C.muted },
  viewMore: { fontSize: 12, color: C.accent, fontWeight: "500" },


  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 14, fontWeight: "600" },


  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 10, fontWeight: "500" },


  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28,26,23,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0DDD6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalName: { fontSize: 17, fontWeight: "500", color: C.primary },
  modalDivider: { height: 1, backgroundColor: C.border },
  modalComment: { fontSize: 14, color: C.body, lineHeight: 22 },
  modalDateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  modalDate: { fontSize: 12, color: C.muted },
  closeBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  closeBtnText: { color: "#fff", fontSize: 14, fontWeight: "500" },
});