import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  deleteMessagesForUser,
  getMessages,
  getProviderRequests,
  getUserBookings,
} from "../apis/authApi";
import { useAuth } from "../context/AuthContext";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:            "#0a0a0f",
  surface:       "#0f0f1a",
  surfaceHover:  "#13132a",
  border:        "#1e1e2e",
  accent:        "#a78bfa",
  accentDim:     "#6c5ce722",
  accentBorder:  "#6c5ce740",
  textPrimary:   "#e0e0f0",
  textSecondary: "#7070a0",
  textMuted:     "#4a4a6a",
  avatarBg:      "#1e1e3a",
  unread:        "#a78bfa",
  online:        "#00cec9",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getParticipantId = (p) =>
  p?.userId || p?.providerId || p?.id || p?._id;

const getBookingId = (b) => b?.bookingId || b?._id || b?.id;

const getOtherUserFromBooking = (booking, isCustomer) => {
  const participant = isCustomer
    ? booking?.participants?.provider
    : booking?.participants?.user;
  if (!participant) return null;
  return { ...participant, userId: getParticipantId(participant) };
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDay = Math.floor((now - d) / 86400000);
  if (diffDay === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7)  return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Initials avatar colours cycle
const AVATAR_COLORS = ["#6c5ce7", "#00cec9", "#fd79a8", "#fdcb6e", "#0984e3"];
const avatarColor = (name = "") =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const bg = avatarColor(name);

  return (
    <View style={[styles.avatar, { backgroundColor: bg + "33", borderColor: bg + "66" }]}>
      <Text style={[styles.avatarText, { color: bg }]}>{initials}</Text>
    </View>
  );
};

// ─── ConversationCard ─────────────────────────────────────────────────────────
const ConversationCard = ({ item, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    onLongPress={onLongPress}
    activeOpacity={0.75}
  >
    <View style={styles.cardInner}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Avatar name={item.user?.name} />
        {/* Online dot – purely decorative, remove if you have real presence data */}
        <View style={styles.onlineDot} />
      </View>

      {/* Text */}
      <View style={styles.textCol}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.user?.name || "User"}
          </Text>
          <Text style={styles.time}>{formatTime(item.updatedAt)}</Text>
        </View>

        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>

        {!!item.serviceName && (
          <View style={styles.servicePill}>
            <Ionicons name="briefcase-outline" size={10} color={T.accent} />
            <Text style={styles.serviceText} numberOfLines={1}>
              {item.serviceName}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ─── MessagesListScreen ───────────────────────────────────────────────────────
export default function MessagesListScreen({ navigation }) {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchConversations = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);

    const bookingRes = isCustomer
      ? await getUserBookings(user.userId)
      : await getProviderRequests(user.userId);

    if (!bookingRes.success) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const uniqueConversations = [];
    const seen = new Set();

    (bookingRes.data || []).forEach((booking) => {
      const otherUser  = getOtherUserFromBooking(booking, isCustomer);
      const otherUserId = getParticipantId(otherUser);
      const bookingId  = getBookingId(booking);
      if (!otherUserId || !bookingId) return;
      const key = `${otherUserId}-${bookingId}`;
      if (seen.has(key)) return;
      seen.add(key);
      uniqueConversations.push({
        id: key,
        bookingId,
        serviceName: booking.serviceName,
        user: { ...otherUser, userId: otherUserId },
        updatedAt: booking.updatedAt || booking.createdAt,
      });
    });

    const withLastMessages = await Promise.all(
      uniqueConversations.map(async (conv) => {
        const messageRes = await getMessages({
          user1: user.userId,
          user2: conv.user.userId,
          bookingId: conv.bookingId,
        });
        const chats   = messageRes.success ? messageRes.data || [] : [];
        const lastChat = chats[chats.length - 1];
        return {
          ...conv,
          lastMessage: lastChat?.message || conv.serviceName || "No messages yet",
          updatedAt:   lastChat?.createdAt || conv.updatedAt,
        };
      })
    );

    withLastMessages.sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );
    setConversations(withLastMessages);
    setLoading(false);
  }, [isCustomer, user]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const handleDelete = (item) => {
    Alert.alert("Delete Chat", "This will remove this conversation.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMessagesForUser({
              user1: user.userId,
              user2: item.user.userId,
              bookingId: item.bookingId,
            });
            setConversations((prev) => prev.filter((c) => c.id !== item.id));
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  const filtered = conversations.filter((c) =>
    (c.user?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} size="large" />
        <Text style={styles.loadingText}>Loading chats…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {conversations.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{conversations.length}</Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={15} color={T.textMuted} style={{ marginRight: 8 }} />
        <Text
          style={styles.searchInput}
          onPress={() => {/* hook up real TextInput if needed */}}
        >
          {search || <Text style={{ color: T.textMuted }}>Search conversations…</Text>}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationCard
            item={item}
            onPress={() =>
              navigation.navigate("MessageScreen", {
                user: item.user,
                bookingId: item.bookingId,
              })
            }
            onLongPress={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={filtered.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Ionicons name="chatbubbles-outline" size={52} color={T.textMuted} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyMsg}>
              Your chats will appear here once a booking is made.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.bg,
    gap: 12,
  },
  loadingText: {
    color: T.textMuted,
    fontSize: 13,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: T.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: T.textPrimary,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: T.accentDim,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: T.accentBorder,
  },
  countText: {
    color: T.accent,
    fontSize: 11,
    fontWeight: "600",
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: T.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: T.textPrimary,
  },

  // Card
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: T.border,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Avatar
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: T.online,
    borderWidth: 2,
    borderColor: T.bg,
    position: "absolute",
    bottom: 0,
    right: 0,
  },

  // Text column
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: T.textPrimary,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 11,
    color: T.textMuted,
    marginLeft: 8,
  },
  lastMsg: {
    fontSize: 12,
    color: T.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  servicePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: T.accentDim,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: T.accentBorder,
  },
  serviceText: {
    fontSize: 10,
    color: T.accent,
    fontWeight: "500",
  },

  // Empty
  emptyWrap: {
    flex: 1,
  },
  emptyInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: T.textMuted,
    marginTop: 4,
  },
  emptyMsg: {
    fontSize: 13,
    color: T.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});