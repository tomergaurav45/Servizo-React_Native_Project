import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import io from "socket.io-client";
import {
  deleteSingleMessage,
  getMessages,
  sendMessage,
} from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const getUserId = (value) =>
  value?.userId || value?.id || value?._id || value?.providerId || value?.customerId;

const getMessageId = (item, index) => item?._id || item?.id || `${item?.createdAt || "msg"}-${index}`;

export default function MessageScreen({ route }) {
  const selectedUser = route?.params?.user;
  const bookingId = route?.params?.bookingId || selectedUser?.bookingId;
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.userId;
  const receiverId = useMemo(() => getUserId(selectedUser), [selectedUser]);
  const listRef = useRef(null);
  const socketRef = useRef(null);

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


  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io("http://192.168.31.62:5000");

    socketRef.current.emit("join", currentUserId);

   socketRef.current.on("newMessage", (newMessage) => {

    socketRef.current.on("messageDeleted", (messageId) => {
  setMessages((prev) =>
    prev.filter((msg) => msg._id !== messageId)
  );
});

  if (newMessage.senderId === currentUserId) {
    return;
  }

  const isCurrentChat =
    newMessage.bookingId === bookingId &&
    (
      (newMessage.senderId === currentUserId &&
        newMessage.receiverId === receiverId) ||
      (newMessage.senderId === receiverId &&
        newMessage.receiverId === currentUserId)
    );

  if (!isCurrentChat) return;

  setMessages((prev) => [...prev, newMessage]);

  setTimeout(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, 100);
});

    return () => {
      socketRef.current?.disconnect();
    };
  }, [bookingId, currentUserId, receiverId]);

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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={36} color={COLORS.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{selectedUser?.name || "User"}</Text>
            {!!bookingId && <Text style={styles.headerSub}>Booking chat</Text>}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
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
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerText: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSub: {
    color: "#777",
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
    color: "#777",
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
    backgroundColor: COLORS.primary,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    color: "#000",
  },
  myMessageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
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
