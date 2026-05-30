import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteAllNotifications, getNotifications, markNotificationRead } from "../apis/authApi";
import { ServizoAlert } from "../components/ServizoAlert";
import { useAuth } from "../context/AuthContext";
import { useSocketEvents } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const typeConfig = (type, colors) => {
  const configs = {
    booking: {
      bg: colors.accent + "22",
      iconColor: colors.accent,
      icon: "calendar-check-outline",
    },

    review: {
      bg: colors.warning + "22",
      iconColor: colors.warning,
      icon: "star-outline",
    },

    promo: {
      bg: colors.success + "22",
      iconColor: colors.success,
      icon: "pricetag-outline",
    },

    alert: {
      bg: colors.danger + "22",
      iconColor: colors.danger,
      icon: "notifications-outline",
    },

    update: {
      bg: colors.info + "22",
      iconColor: colors.info,
      icon: "refresh-outline",
    },

    default: {
      bg: colors.surfaceAlt,
      iconColor: colors.textMuted,
      icon: "ellipse-outline",
    },
  };

  switch (type) {
    case "booking":
      return configs.booking;

    case "review":
      return configs.review;

    case "promo":
      return configs.promo;

    case "alert":
      return configs.alert;

    case "update":
      return configs.update;

    default:
      return configs.default;
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

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};


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

const getNotificationId = (item) => item?._id || item?.id || item?.notificationId;
const getNotificationUserId = (item) =>
  item?.userId || item?.receiverId || item?.recipientId || item?.to;
const isForCurrentUser = (item, userId) => {
  const notificationUserId = getNotificationUserId(item);
  return !notificationUserId || String(notificationUserId) === String(userId);
};


const NotificationItem = ({ item, onPress, colors, styles }) => {
  const cfg = typeConfig(item.type, colors);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        item.isRead ? styles.cardRead : styles.cardUnread,
      ]}
      onPress={() => onPress(item._id, item)}
      activeOpacity={0.75}
    >

      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.iconColor} />
      </View>


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
            <Ionicons name="arrow-forward" size={10} color={colors.accent} />
            <Text style={styles.pillText}>View booking</Text>
          </View>
        )}
      </View>


      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};


const NotificationScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = theme.colors;
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user?.userId) return;
      const res = await getNotifications(user.userId);
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  useSocketEvents(
    [
      "notification",
      "newNotification",
      "bookingCreated",
      "bookingUpdated",
      "bookingAccepted",
      "bookingCompleted",
      "bookingStatusChanged",
    ],
    (payload) => {
      const notification = payload?.notification || payload;
      const notificationId = getNotificationId(notification);

      if (notificationId && isForCurrentUser(notification, user?.userId)) {
        setNotifications((prev) => {
          const exists = prev.some((item) => getNotificationId(item) === notificationId);

          if (exists) {
            return prev.map((item) =>
              getNotificationId(item) === notificationId ? { ...item, ...notification } : item
            );
          }

          return [{ isRead: false, createdAt: new Date().toISOString(), ...notification }, ...prev];
        });
      }

      fetchNotifications();
    }
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

      if (item.type === "review") {
        navigation.navigate("ReviewScreen", {
          bookingId: item.bookingId,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteAll = () => {
    if (!user?.userId || notifications.length === 0) return;

    setShowDeleteAlert(true);
  };

  const confirmDeleteAll = async () => {
    try {
      const res = await deleteAllNotifications(user.userId);

      if (res?.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setShowDeleteAlert(false);
    }
  };

  const cancelDeleteAll = () => {
    setShowDeleteAlert(false);
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
    return <NotificationItem item={item} onPress={handlePress} colors={colors} styles={styles} />;
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={handleDeleteAll}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>


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


      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} />
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
      <ServizoAlert
        visible={showDeleteAlert}
        title="Delete Notifications?"
        message="Are you sure you want to delete all notifications?"
        onConfirm={confirmDeleteAll}
        onCancel={cancelDeleteAll}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;


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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: c.border,
    },
    headerCenter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: c.text,
      letterSpacing: -0.3,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      backgroundColor: c.danger,
      borderRadius: 20,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    badgeText: {
      color: c.surface,
      fontSize: 11,
      fontWeight: "600",
    },


    tabRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: c.border,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tabActive: {
      backgroundColor: c.accent + "22",
    },
    tabText: {
      fontSize: 12,
      fontWeight: "500",
      color: c.textMuted,
    },
    tabTextActive: {
      color: c.accent,
    },


    feedContent: {
      padding: 16,
      paddingBottom: 32,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 4,
    },


    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      position: "relative",
    },
    cardRead: {
      backgroundColor: c.surface,
      borderWidth: 0.5,
      borderColor: c.border,
    },
    cardUnread: {
      backgroundColor: c.surfaceAlt,
      borderWidth: 0.5,
      borderColor: c.accent + "40",
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
      color: c.text,
      flex: 1,
    },
    cardTime: {
      fontSize: 10,
      color: c.textMuted,
      flexShrink: 0,
      marginTop: 2,
    },
    cardMsg: {
      fontSize: 12,
      color: c.textMuted,
      lineHeight: 18,
      marginTop: 3,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
      alignSelf: "flex-start",
      backgroundColor: c.accent + "22",
      borderWidth: 0.5,
      borderColor: c.accent + "40",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    pillText: {
      fontSize: 10,
      color: c.accent,
      fontWeight: "500",
    },


    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.accent,
      position: "absolute",
      top: 14,
      right: 14,
    },


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
      color: c.textMuted,
      marginTop: 4,
    },
    emptyMsg: {
      fontSize: 13,
      color: c.textMuted,
    },
  });
};

