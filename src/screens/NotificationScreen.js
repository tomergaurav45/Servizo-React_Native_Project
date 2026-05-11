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

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEME = {
  bg: "#0a0a0f",
  surface: "#0f0f1a",
  surfaceAlt: "#12122a",
  border: "#1e1e2e",
  accent: "#a78bfa",
  accentDim: "#6c5ce733",
  accentBorder: "#6c5ce744",
  textPrimary: "#e0e0f0",
  textSecondary: "#7070a0",
  textMuted: "#4a4a6a",
  sectionLabel: "#3a3a5a",
  unreadDot: "#a78bfa",

  // icon backgrounds per type
  booking: { bg: "#6c5ce722", icon: "#a78bfa" },
  promo:   { bg: "#00cec922", icon: "#00cec9" },
  alert:   { bg: "#fd79a822", icon: "#f472b6" },
  update:  { bg: "#fdcb6e22", icon: "#fdcb6e" },
  default: { bg: "#ffffff11", icon: "#8888b0" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeConfig = (type) => {
  switch (type) {
    case "booking": return { ...THEME.booking, icon: "calendar-check-outline" };
    case "promo":   return { ...THEME.promo,   icon: "pricetag-outline" };
    case "alert":   return { ...THEME.alert,   icon: "notifications-outline" };
    case "update":  return { ...THEME.update,  icon: "refresh-outline" };
    default:        return { ...THEME.default, icon: "ellipse-outline" };
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1)  return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24)  return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// Group notifications into Today / Yesterday / Older
const groupNotifications = (list) => {
  const groups = {};
  const now = new Date();

  list.forEach((n) => {
    const d = new Date(n.createdAt);
    const diffDay = Math.floor((now - d) / 86400000);
    const key =
      diffDay === 0 ? "Today" :
      diffDay === 1 ? "Yesterday" : "Earlier";

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  const order = ["Today", "Yesterday", "Earlier"];
  const result = [];
  order.forEach((key) => {
    if (groups[key]) {
      result.push({ type: "label", key });
      groups[key].forEach((n) => result.push({ type: "item", ...n }));
    }
  });
  return result;
};

// ─── NotificationItem ─────────────────────────────────────────────────────────
const NotificationItem = ({ item, onPress }) => {
  const cfg = typeConfig(item.type);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        item.isRead ? styles.cardRead : styles.cardUnread,
      ]}
      onPress={() => onPress(item._id, item)}
      activeOpacity={0.75}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.icon} />
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {typeof item.title === "string" ? item.title : ""}
          </Text>
          <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
        </View>

        <Text style={styles.cardMsg} numberOfLines={2}>
          {typeof item.message === "string" ? item.message : ""}
        </Text>

        {item.type === "booking" && !item.isRead && (
          <View style={styles.pill}>
            <Ionicons name="arrow-forward" size={10} color={THEME.accent} />
            <Text style={styles.pillText}>View booking</Text>
          </View>
        )}
      </View>

      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

// ─── NotificationScreen ───────────────────────────────────────────────────────
const NotificationScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  const fetchNotifications = async () => {
    try {
      if (!user?.userId) return;
      const res = await getNotifications(user.userId);
      if (res.success) setNotifications(res.data);
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
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (item.type === "booking") {
        navigation.navigate("BookingScreen");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const TABS = ["All", "Bookings", "Promos"];

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Bookings") return n.type === "booking";
    if (activeTab === "Promos") return n.type === "promo";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const listData = groupNotifications(filtered);

  const renderItem = ({ item }) => {
    if (item.type === "label") {
      return <Text style={styles.sectionLabel}>{item.key}</Text>;
    }
    return <NotificationItem item={item} onPress={handlePress} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={THEME.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setNotifications([])}>
          <Ionicons name="trash-outline" size={18} color={THEME.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List / Empty */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={56} color={THEME.sectionLabel} />
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyMsg}>No notifications here yet.</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, i) =>
            item.type === "label" ? `label-${item.key}` : item._id ?? String(i)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: THEME.textPrimary,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "#6c5ce7",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: THEME.accentDim,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: THEME.textMuted,
  },
  tabTextActive: {
    color: THEME.accent,
  },

  // Feed
  feedContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.sectionLabel,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    position: "relative",
  },
  cardRead: {
    backgroundColor: THEME.surface,
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  cardUnread: {
    backgroundColor: THEME.surfaceAlt,
    borderWidth: 0.5,
    borderColor: THEME.accentBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textPrimary,
    flex: 1,
  },
  cardTime: {
    fontSize: 10,
    color: THEME.textMuted,
    flexShrink: 0,
    marginTop: 2,
  },
  cardMsg: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18,
    marginTop: 3,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: THEME.accentDim,
    borderWidth: 0.5,
    borderColor: THEME.accentBorder,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 10,
    color: THEME.accent,
    fontWeight: "500",
  },

  // Unread dot
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.unreadDot,
    position: "absolute",
    top: 14,
    right: 14,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: THEME.textMuted,
    marginTop: 4,
  },
  emptyMsg: {
    fontSize: 13,
    color: THEME.sectionLabel,
  },
});