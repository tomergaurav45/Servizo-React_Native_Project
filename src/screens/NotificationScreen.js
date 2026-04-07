import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";

const NotificationScreen = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Booking Confirmed ✅",
      message: "Your home cleaning is scheduled for tomorrow",
      time: "2 min ago",
      read: false,
    },
    {
      id: "2",
      title: "Payment Successful 💰",
      message: "₹499 paid for AC servicing",
      time: "1 hour ago",
      read: true,
    },
  ]);

  // 🔥 Mark as read on click
  const handlePress = (id) => {
    const updated = notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );
    setNotifications(updated);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item.id)}
    >
      {!item.read && <View style={styles.unreadDot} />}

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        {/* 🔥 Clear All Button */}
        <TouchableOpacity onPress={() => setNotifications([])}>
          <Ionicons name="trash-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* List OR Empty */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },

  title: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
  },

  message: {
    color: "#555",
    marginTop: 2,
  },

  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    color: "#999",
  },
});