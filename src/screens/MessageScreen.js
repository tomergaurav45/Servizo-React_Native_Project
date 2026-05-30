import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  deleteSingleMessage,
  getMessages,
  sendMessage,
} from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { useSocketEvents } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const getUserId = (value) =>
  value?.userId || value?.id || value?._id || value?.providerId || value?.customerId;

const getMessageId = (item, index) => item?._id || item?.id || `${item?.createdAt || "msg"}-${index}`;
const sameId = (a, b) => String(a || "") === String(b || "");

export default function MessageScreen({ route }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = theme.colors;
  const selectedUser = route?.params?.user;
  const bookingId = route?.params?.bookingId || selectedUser?.bookingId;
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.userId;
  const receiverId = useMemo(() => getUserId(selectedUser), [selectedUser]);
  const listRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !receiverId) return;

    setLoading(true);

    const res = await getMessages({
      user1: currentUserId,
      user2: receiverId,
      bookingId,
    });

    if (res.success) {
      setMessages(res.data || []);
    } else {
      Toast.show({
        type: "error",
        text1: res.message || "Failed to fetch messages",
      });
    }

    setLoading(false);
  }, [bookingId, currentUserId, receiverId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );


  useSocketEvents(["newMessage", "message:new", "messageSent"], (newMessage) => {
    if (!newMessage || sameId(newMessage.senderId, currentUserId)) return;

    const sameBooking = !bookingId || !newMessage.bookingId || sameId(newMessage.bookingId, bookingId);
    const isCurrentChat =
      sameBooking &&
      (
        (sameId(newMessage.senderId, currentUserId) && sameId(newMessage.receiverId, receiverId)) ||
        (sameId(newMessage.senderId, receiverId) && sameId(newMessage.receiverId, currentUserId))
      );

    if (!isCurrentChat) return;

    setMessages((prev) => {
      const nextId = newMessage._id || newMessage.id;
      if (nextId && prev.some((item) => sameId(item._id || item.id, nextId))) {
        return prev;
      }
      return [...prev, newMessage];
    });

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  });

  useSocketEvents(["messageDeleted", "message:deleted", "deleteMessage"], (messageId) => {
    const deletedId = messageId?._id || messageId?.id || messageId?.messageId || messageId;
    setMessages((prev) =>
      prev.filter((msg) => !sameId(msg._id || msg.id, deletedId))
    );
  });

  const handleSend = async () => {
    const text = message.trim();

    if (!text || sending || !currentUserId || !receiverId) return;

    setSending(true);
    setMessage("");

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId,
      receiverId,
      message: text,
      bookingId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    const res = await sendMessage({
      senderId: currentUserId,
      receiverId,
      message: text,
      bookingId,
    });

    if (res.success) {
      setMessages((prev) =>
        prev.map((item) => (item._id === tempMessage._id ? res.data : item))
      );
    } else {
      setMessages((prev) => prev.filter((item) => item._id !== tempMessage._id));
      setMessage(text);

      Toast.show({
        type: "error",
        text1: res.message || "Failed to send message",
      });
    }

    setSending(false);
  };

  const renderItem = ({ item }) => {
    const isMine =
      item.senderId === currentUserId || item.sender === "me";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          Alert.alert(
            "Delete Message",
            "Delete this message for everyone?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    const res = await deleteSingleMessage(item._id);

                    if (res.success) {
                      setMessages((prev) =>
                        prev.filter(
                          (msg) => msg._id !== item._id
                        )
                      );
                    }
                  } catch (err) {
                    console.log(err);
                  }
                },
              },
            ]
          );
        }}
      >
        <View
          style={[
            styles.messageContainer,
            isMine ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine && styles.myMessageText,
            ]}
          >
            {item.message || item.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={36} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{selectedUser?.name || "User"}</Text>
            {!!bookingId && <Text style={styles.headerSub}>Booking chat</Text>}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            keyboardShouldPersistTaps="handled"
            ref={listRef}
            data={messages}
            keyExtractor={getMessageId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No messages yet</Text>
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.bg} />
            ) : (
              <Ionicons name="send" size={20} color={colors.bg} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => {
  const c = theme.colors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderColor: c.border,
    },
    headerText: {
      marginLeft: 10,
    },
    headerName: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
    headerSub: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      padding: 16,
      flexGrow: 1,
    },
    emptyText: {
      color: c.textMuted,
      textAlign: "center",
      marginTop: 30,
    },
    messageContainer: {
      maxWidth: "75%",
      padding: 10,
      borderRadius: 12,
      marginBottom: 10,
    },
    myMessage: {
      alignSelf: "flex-end",
      backgroundColor: c.primary,
    },
    otherMessage: {
      alignSelf: "flex-start",
      backgroundColor: c.surface,
    },
    messageText: {
      color: c.text,
    },
    myMessageText: {
      color: c.bg,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      padding: 10,
      backgroundColor: c.surface,
    },
    input: {
      flex: 1,
      backgroundColor: c.surfaceAlt,
      color: c.text,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 10,
      maxHeight: 120,
    },
    sendBtn: {
      marginLeft: 10,
      backgroundColor: c.primary,
      padding: 10,
      borderRadius: 20,
      minWidth: 40,
      minHeight: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: {
      opacity: 0.7,
    },
  });
};
