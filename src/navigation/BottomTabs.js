import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAddresses, getNotifications, getProviderRequests, getUserBookings } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { useSocketEvents } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import BookingsScreen from "../screens/BookingsScreen";
import HomeScreen from "../screens/HomeScreen";
import MessageListScreen from "../screens/MessagesListScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const getParticipantId = (participant) =>
  participant?.userId || participant?.providerId || participant?.id || participant?._id;

const getBookingId = (booking) => booking?.bookingId || booking?._id || booking?.id;

const getOtherParticipant = (booking, isCustomer) =>
  isCustomer ? booking?.participants?.provider : booking?.participants?.user;

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const getIcon = (routeName) => {
    switch (routeName) {
      case "Home":
        return { active: "home", inactive: "home-outline" };
      case "Bookings":
        return { active: "calendar", inactive: "calendar-outline" };
      case "Message":
        return { active: "chatbubble-ellipses", inactive: "chatbubble-ellipses-outline" };
      case "Profile":
        return { active: "person", inactive: "person-outline" };
      default:
        return { active: "ellipse", inactive: "ellipse-outline" };
    }
  };

  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.userId) return;

      const res = await getAddresses(user.userId);
      if (res.success) {
        setAddresses(res.data || []);
      }
    };

    fetchAddresses();
  }, [user]);

  const fetchTabCounts = useCallback(async () => {
    if (!user?.userId) {
      setBookingCount(0);
      setMessageCount(0);
      setNotificationCount(0);
      return;
    }

    const isCustomer = user?.role === "customer";
    const [res, notificationRes] = await Promise.all([
      isCustomer
        ? getUserBookings(user.userId)
        : getProviderRequests(user.userId),
      getNotifications(user.userId),
    ]);

    if (!res?.success) {
      setBookingCount(0);
      setMessageCount(0);
    } else {
      const bookings = res.data || [];
      const activeBookings = bookings.filter((booking) => {
        if (isCustomer) {
          return ["ASSIGNED", "COMPLETION_REQUESTED", "ACCEPTED", "IN_PROGRESS"].includes(
            booking?.status
          );
        }

        return booking?.status === "OPEN";
      });
      const conversations = new Set();

      bookings.forEach((booking) => {
        const otherParticipant = getOtherParticipant(booking, isCustomer);
        const otherId = getParticipantId(otherParticipant);
        const bookingId = getBookingId(booking);

        if (otherId && bookingId) {
          conversations.add(`${otherId}-${bookingId}`);
        }
      });

      setBookingCount(activeBookings.length);
      setMessageCount(conversations.size);
    }

    if (notificationRes?.success) {
      setNotificationCount((notificationRes.data || []).filter((item) => !item.isRead).length);
    } else {
      setNotificationCount(0);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTabCounts();
    }, [fetchTabCounts])
  );

  useSocketEvents(
    [
      "newMessage",
      "message:new",
      "messageSent",
      "messageDeleted",
      "message:deleted",
      "bookingCreated",
      "booking:new",
      "newBooking",
      "bookingUpdated",
      "bookingAccepted",
      "bookingCompleted",
      "bookingStatusChanged",
      "notification",
      "newNotification",
    ],
    fetchTabCounts
  );


  const isProfileIncomplete = () => {
    if (!user?.phone || user.phone.length !== 10) return true;
    if (!user?.gender) return true;
    if (!user?.dob) return true;

    if (user?.role === "provider") {
      if (!user?.skills || user.skills.length === 0) return true;
      if (!user?.experience) return true;
      if (!user?.availability) return true;
    }

    return false;
  };


  const isAddressMissing = () => {
    return !addresses || addresses.length === 0;
  };


  const showProfileWarning = isProfileIncomplete() || isAddressMissing();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ focused }) => {
          const iconName = getIcon(route.name);
          const iconColor = focused ? theme.colors.primary : theme.colors.tabInactive;
          const activeBg = theme.mode === "dark" ? theme.colors.surfaceAlt : theme.colors.primary + "10";
          const tabCount = route.name === "Message"
            ? messageCount
            : route.name === "Bookings"
              ? bookingCount
              : route.name === "Home"
                ? notificationCount
                : 0;

          if (route.name === "Profile") {
            return (
              <View style={styles.iconOuter}>
                <View style={[styles.iconPill, focused && { backgroundColor: activeBg }]}>
                  <Ionicons
                    name={focused ? iconName.active : iconName.inactive}
                    size={21}
                    color={iconColor}
                  />
                </View>
                <Text style={[styles.tabLabel, { color: iconColor }]}>Profile</Text>
                {showProfileWarning && (
                  <View style={[styles.warningDot, { backgroundColor: theme.colors.danger, borderColor: theme.colors.surface }]} />
                )}
              </View>
            );
          }

          return (
            <View style={styles.iconOuter}>
              <View style={[styles.iconPill, focused && { backgroundColor: activeBg }]}>
                <Ionicons
                  name={focused ? iconName.active : iconName.inactive}
                  size={21}
                  color={iconColor}
                />
              </View>
              <Text style={[styles.tabLabel, { color: iconColor }]}>{route.name}</Text>
              {tabCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.danger, borderColor: theme.colors.surface }]}>
                  <Text style={styles.countText}>{tabCount > 99 ? "99+" : tabCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Message" component={MessageListScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    height: 54,
  },
  iconOuter: {
    width: 72,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPill: {
    width: 42,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  countBadge: {
    position: "absolute",
    top: -2,
    right: 14,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  countText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  warningDot: {
    position: "absolute",
    top: 0,
    right: 18,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
