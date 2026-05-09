import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMessages, getProviderRequests, getUserBookings } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const getParticipantId = (person) =>
  person?.userId || person?.providerId || person?.id || person?._id;

const getBookingId = (booking) => booking?.bookingId || booking?._id || booking?.id;

const getOtherUserFromBooking = (booking, isCustomer) => {
  const participant = isCustomer
    ? booking?.participants?.provider
    : booking?.participants?.user;

  if (!participant) return null;

  return {
    ...participant,
    userId: getParticipantId(participant),
  };
};

export default function MessagesListScreen({ navigation }) {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const otherUser = getOtherUserFromBooking(booking, isCustomer);
      const otherUserId = getParticipantId(otherUser);
      const bookingId = getBookingId(booking);

      if (!otherUserId || !bookingId) return;

      const key = `${otherUserId}-${bookingId}`;

      if (seen.has(key)) return;

      seen.add(key);
      uniqueConversations.push({
        id: key,
        bookingId,
        serviceName: booking.serviceName,
        user: {
          ...otherUser,
          userId: otherUserId,
        },
        updatedAt: booking.updatedAt || booking.createdAt,
      });
    });

    const withLastMessages = await Promise.all(
      uniqueConversations.map(async (conversation) => {
        const messageRes = await getMessages({
          user1: user.userId,
          user2: conversation.user.userId,
          bookingId: conversation.bookingId,
        });

        const chats = messageRes.success ? messageRes.data || [] : [];
        const lastChat = chats[chats.length - 1];

        return {
          ...conversation,
          lastMessage: lastChat?.message || conversation.serviceName || "No messages yet",
          updatedAt: lastChat?.createdAt || conversation.updatedAt,
        };
      })
    );

    withLastMessages.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    setConversations(withLastMessages);
    setLoading(false);
  }, [isCustomer, user]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("MessageScreen", {
          user: item.user,
          bookingId: item.bookingId,
        })
      }
    >
      <View style={styles.row}>
        <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />

        <View style={styles.textCol}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.user?.name || "User"}
            </Text>
            {!!item.updatedAt && (
              <Text style={styles.time}>
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>

          {!!item.serviceName && (
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceName}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No chats available yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  textCol: {
    flex: 1,
    marginLeft: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    color: "#999",
    fontSize: 11,
    marginLeft: 10,
  },
  lastMessage: {
    color: "#777",
    marginTop: 2,
  },
  serviceName: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 3,
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 30,
  },
});
