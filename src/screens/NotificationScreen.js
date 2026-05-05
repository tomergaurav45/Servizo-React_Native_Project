import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getNotifications, markNotificationRead } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      if (!user?.userId) return;

      const res = await getNotifications(user.userId);

      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [user])
  );

  const handlePress = async (id, item) => {
    try {
      await markNotificationRead(id);

      const updated = notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      );

      setNotifications(updated);


      if (item.type === "booking") {
        navigation.navigate("BookingScreen");
      }

    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: item?.isRead ? "#f9f9f9" : "#eef4ff" }
      ]}
      onPress={() => handlePress(item?._id, item)}
    >
      {!item?.isRead && <View style={styles.unreadDot} />}

      <View style={{ flex: 1 }}>


        <Text style={styles.title}>
          {typeof item?.title === "string" ? item.title : ""}
        </Text>


        <Text style={styles.message}>
          {typeof item?.message === "string" ? item.message : ""}
        </Text>


        <Text style={styles.time}>
          {item?.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : ""}
        </Text>

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


        <TouchableOpacity onPress={() => setNotifications([])}>
          <Ionicons name="trash-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>


      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
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