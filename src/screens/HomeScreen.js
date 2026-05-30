import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getNotifications, getProviderRequests, getProviderReviews, getServices, getUserBookings, registerUser, updateOnlineStatus } from "../apis/authApi";
import { ServizoAlert } from "../components/ServizoAlert";
import { useAuth } from "../context/AuthContext";
import { useSocketEvents } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const categories = [
  {
    id: 1,
    name: "Home Cleaning",
    icon: "🧹",

  },
  {
    id: 2,
    name: "Electrician",
    icon: "⚡",
  },
  {
    id: 3,
    name: "Plumber",
    icon: "🚿",
  },
  {
    id: 4,
    name: "AC Repair",
    icon: "❄️",
  },
  {
    id: 5,
    name: "Salon at Home",
    icon: "✂️",
  },
  {
    id: 6,
    name: "Pc & Laptop Services",
    icon: "🔧",
  },

  {
    id: 7,
    name: "Carpenter",
    icon: "🪚",
  },
  {
    id: 8,
    name: "Home Renovation",
    icon: "🏠",
  },
];

const videos = [
  { id: "1", title: "Home Cleaning", source: require("../../assets/videos/cleaning.mp4") },
  { id: "2", title: "Electrician", source: require("../../assets/videos/electrician.mp4") },
  { id: "3", title: "Plumber", source: require("../../assets/videos/plumber.mp4") },
  { id: "4", title: "AC Repair", source: require("../../assets/videos/ac.mp4") },
  { id: "5", title: "Carpenter", source: require("../../assets/videos/carpenter.mp4") },
  { id: "6", title: "Car Wash", source: require("../../assets/videos/carwashing.mp4") },
  { id: "7", title: "Home Renovation", source: require("../../assets/videos/civil.mp4") },
  { id: "8", title: "Packers & Movers", source: require("../../assets/videos/delivery.mp4") },
  { id: "9", title: "Painter", source: require("../../assets/videos/paint.mp4") },
  { id: "10", title: "Pet Grooming", source: require("../../assets/videos/pet.mp4") },
  { id: "11", title: "TV Installation", source: require("../../assets/videos/television.mp4") },
  { id: "12", title: "Home tutor", source: require("../../assets/videos/tutor.mp4") },
  { id: "13", title: "Washing Machine Repair", source: require("../../assets/videos/washing.mp4") },
];

const getNotificationId = (item) => item?._id || item?.id || item?.notificationId;
const getNotificationUserId = (item) =>
  item?.userId || item?.receiverId || item?.recipientId || item?.to;
const isForCurrentUser = (item, userId) => {
  const notificationUserId = getNotificationUserId(item);
  return !notificationUserId || String(notificationUserId) === String(userId);
};

const getServiceIcon = (serviceName, fallback) => {
  const matched = categories.find(
    (item) => item.name.toLowerCase() === serviceName?.toLowerCase()
  );
  return matched?.icon || fallback || "🔧";
};

export default function HomeScreen() {
  const { user, updateRole } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = theme.colors;
  const isProvider = user?.role === "provider";
  const navigation = useNavigation();

  const [address, setAddress] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [visibleVideoId, setVisibleVideoId] = useState("1");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allServicesFlat, setAllServicesFlat] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [loading, setLoading] = useState(false);
  const [newRequests, setNewRequests] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [recentServices, setRecentServices] = useState([]);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ongoingJobs, setOngoingJobs] = useState([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 70 });
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setVisibleVideoId(viewableItems[0].item.id);
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 440, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const toggleStatus = async (value) => {
    if (loading || !user?.userId) return;
    const previousStatus = isOnline;
    setIsOnline(value);
    setLoading(true);
    try {
      const data = await updateOnlineStatus(user.userId, value);
      if (data?.success) {
        setIsOnline(typeof data.isOnline === "boolean" ? data.isOnline : value);
      } else throw new Error(data?.message || "Failed to update status");
    } catch (_err) {
      setIsOnline(previousStatus);
      Toast.show({ type: "error", text1: "Failed to update status" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      if (!user?.userId) return;
      const res = await getProviderRequests(user.userId);
      if (res.success) {
        const newReq = res.data.filter((item) => item.status === "OPEN");
        const ongoing = res.data.filter(
          (item) =>
            item.status === "ASSIGNED" ||
            item.status === "COMPLETION_REQUESTED"
        );
        const today = new Date().toDateString();
        const completedToday = res.data.filter(
          (item) => item.status === "COMPLETED" && new Date(item.updatedAt).toDateString() === today
        );
        const total = completedToday.reduce(
          (sum, item) =>
            sum + Number(item.price || 0),
          0
        );
        setNewRequests(newReq);
        setOngoingJobs(ongoing);
        setTodayEarnings(total);
      }
    } catch (err) { console.log(err); }
  }, [user?.userId]);

  const fetchCustomerActivity = useCallback(async () => {
    try {
      if (!user?.userId || isProvider) return;

      const res = await getUserBookings(user.userId);
      if (!res.success) return;

      const bookings = res.data || [];
      const seen = new Set();
      const recent = [];

      bookings.forEach((booking) => {
        const name = booking?.serviceName;
        if (!name || seen.has(name)) return;

        seen.add(name);
        recent.push({
          name,
          icon: getServiceIcon(name),
          serviceCategory: booking?.serviceCategory,
        });
      });

      setRecentServices(recent.slice(0, 6));
      setOngoingJobs(
        bookings.filter((booking) =>
          ["ASSIGNED", "COMPLETION_REQUESTED"].includes(booking?.status)
        )
      );
    } catch (err) {
      console.log(err);
    }
  }, [isProvider, user?.userId]);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user?.userId) return;
      const res = await getNotifications(user.userId);
      if (res.success) setNotifications(res.data);
    } catch (err) { console.log(err); }
  }, [user?.userId]);

  useFocusEffect(useCallback(() => { fetchNotifications(); }, [fetchNotifications]));

  useSocketEvents(
    [
      "notification",
      "newNotification",
      "bookingCreated",
      "booking:new",
      "newBooking",
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
      if (isProvider) fetchRequests();
      if (!isProvider) fetchCustomerActivity();
    }
  );

  useEffect(() => { if (user?.isOnline !== undefined) setIsOnline(user.isOnline); }, [user]);

  const fetchRating = useCallback(async () => {
    try {
      if (!user?.userId) return;
      const res = await getProviderReviews(user.userId);
      if (res.success && res.data) {
        setRating(res.data.avgRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      } else { setRating(0); setTotalReviews(0); }
    } catch (err) { console.log(err); }
  }, [user?.userId]);

  useEffect(() => { if (isProvider && user?.userId) fetchRating(); }, [fetchRating, isProvider, user?.userId]);
  useEffect(() => { if (isProvider) fetchRequests(); }, [fetchRequests, isProvider]);
  useFocusEffect(useCallback(() => { fetchCustomerActivity(); }, [fetchCustomerActivity]));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { alert("Permission to access location was denied"); return; }
      let loc = await Location.getCurrentPositionAsync({});
      const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (addr.length > 0) setAddress(`${addr[0].city}, ${addr[0].region}`);
    })();
  }, []);

  useEffect(() => {
    if (user && !user.role) setShowRoleModal(true);
    else setShowRoleModal(false);
  }, [user]);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const res = await getServices();
    if (res.success) {
      setAllServicesFlat(
        (res.data || []).flatMap((section) =>
          (section.data || []).map((item) => ({
            ...item,
            serviceCategory: section.title,
          }))
        )
      );
    }
  };

  const openServiceVariants = useCallback(
    (serviceName, fallback = {}) => {
      const matchedService = allServicesFlat.find(
        (item) => item?.name?.toLowerCase() === serviceName?.toLowerCase()
      );

      const serviceItem = matchedService || {
        name: serviceName,
        icon: fallback.icon || "construct-outline",
      };

      navigation.navigate("VariantSelectionScreen", {
        serviceCategory: matchedService?.serviceCategory || fallback.serviceCategory || serviceName,
        serviceName: matchedService?.name || serviceName,
        serviceItem,
      });
    },
    [allServicesFlat, navigation]
  );

  const confirmOffline = () => { setShowAlert(false); toggleStatus(false); };
  const cancelOffline = () => { setShowAlert(false); };

  const handleSearch = (text) => {
    setSearchText(text);

    if (!text?.length) {
      setSuggestions([]);
      return;
    }

    const filtered = allServicesFlat.filter(
      (item) =>
        item?.name &&
        item.name
          .toLowerCase()
          .includes(text.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
  };

  const selectRole = async (role) => {
    try {
      const response = await registerUser({ userId: user.userId, role });
      if (response.success) {
        updateRole(role);
        setShowRoleModal(false);
        Toast.show({
          type: "success",
          text1: "Congratulations ",
          text2: role === "customer"
            ? "You can now find trusted services on Servizo"
            : "You can now offer services and earn with Servizo",
        });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: response.message || "Role update failed" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Server Error", text2: "Unable to update role" });
    }
  };


  if (isProvider) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.bgAccent} />
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.locationBar} onPress={() => navigation.navigate("ManageAddressScreen")}>
            <View style={styles.locationIconBox}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.locationLabel}>Your Location</Text>
              <Text style={styles.locationText}>{address || "Detecting location..."}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>


          <View style={styles.headerRow}>
            <View>
              <Text style={styles.eyebrow}>Welcome back</Text>
              <Text style={styles.greeting}>Hi, {user?.name} 👋</Text>
              <Text style={styles.subText}>Ready to earn today?</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => navigation.navigate("NotificationScreen")}
            >
              <Text style={{ fontSize: 20 }}>🔔</Text>

              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.statusCard,]}>
            <View style={styles.statusDot(isOnline)} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>{isOnline ? "You are Online" : "You are Offline"}</Text>
              <Text style={styles.statusSub}>
                {isOnline ? "You will receive new job requests" : "You will not receive new jobs"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: isOnline ? colors.danger : colors.success, opacity: loading ? 0.7 : 1 }]}
              disabled={loading}
              onPress={() => toggleStatus(!isOnline)}
            >
              <Text style={styles.statusBtnText}>{isOnline ? "Go Offline" : "Go Online"}</Text>
            </TouchableOpacity>
          </View>


          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{todayEarnings}</Text>
              <Text style={styles.statLabel}>Today Earnings</Text>
            </View>
            <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate("ReviewScreen")}>
              <Text style={styles.statValue}>⭐ {rating}/5</Text>
              <Text style={styles.statLabel}>{totalReviews} reviews</Text>
            </TouchableOpacity>
          </View>


          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionPill} />
            <Text style={styles.sectionTitle}>New Requests</Text>
          </View>

          {newRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="clipboard-outline" size={22} color={colors.textMuted} />
              <Text style={styles.emptyCardText}>No new requests</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.jobCard}
                onPress={() => navigation.navigate("BookingScreen")}
              >
                <View style={styles.jobIconBox}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{newRequests[0].serviceName}</Text>
                  <Text style={styles.jobStatus}>{newRequests[0].address?.city} • ₹{newRequests[0].price || 500}</Text>
                </View>
                <View style={styles.arrowBox}>
                  <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("BookingScreen")}>
                <Text style={styles.viewAllText}>View All Requests →</Text>
              </TouchableOpacity>
            </>
          )}


          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionPill} />
            <Text style={styles.sectionTitle}>Ongoing Jobs</Text>
          </View>

          {ongoingJobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="hourglass-outline" size={22} color={colors.textMuted} />
              <Text style={styles.emptyCardText}>No ongoing jobs</Text>
            </View>
          ) : (
            ongoingJobs.map((job, index) => (
              <TouchableOpacity
                key={index}
                style={styles.jobCard}
                onPress={() => navigation.navigate("BookingScreen")}
              >
                <View style={styles.jobIconBox}>
                  <Ionicons name="construct-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{job.serviceName}</Text>
                  <Text style={styles.jobStatus}>{job.status} • {job.address?.city}</Text>
                </View>
                <View style={styles.arrowBox}>
                  <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))
          )}


          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionPill} />
            <Text style={styles.sectionTitle}>My Skills</Text>
          </View>
          <View style={styles.categoryGrid}>
            {user?.skills?.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgAccent} />


      <Modal visible={showRoleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Image source={require("../../assets/images/icon1.png")} style={styles.modalIcon} />
              <Text style={styles.greeting}>Hi {user?.name || "User"}</Text>
            </View>
            <Text style={styles.modalSubtitle}>How would you like to use Servizo?</Text>

            <TouchableOpacity style={styles.roleCard} onPress={() => selectRole("customer")}>
              <View style={styles.roleIconBox}>
                <Ionicons name="search-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.roleTitle}>Find Services</Text>
                <Text style={styles.roleSubtitle}>Book trusted professionals</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleCard} onPress={() => selectRole("provider")}>
              <View style={styles.roleIconBox}>
                <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.roleTitle}>Offer Services</Text>
                <Text style={styles.roleSubtitle}>Earn money with your skills</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>


        <TouchableOpacity style={styles.locationBar} onPress={() => navigation.navigate("ManageAddressScreen")}>
          <View style={styles.locationIconBox}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.locationText}>{address || "Detecting location..."}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>


        <Animated.View style={[styles.headerRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.eyebrow}>Good to see you</Text>
            <Text style={styles.greeting}>Hey, {user?.name || "User"} </Text>
            <Text style={styles.subText}>What service do you need today?</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate("NotificationScreen")}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>


        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search for services..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText("");
                  setSuggestions([]);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          {suggestions.length > 0 && (
            <View style={styles.dropdown}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, index === suggestions.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setSearchText(item.name);
                    setSuggestions([]);
                    openServiceVariants(item.name, item);
                  }}
                >
                  <View style={styles.dropdownIconBox}>
                    <Ionicons name={item.icon} size={15} color={colors.primary} />
                  </View>
                  <Text style={styles.dropdownText}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>


        <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
          <Video
            source={require("../../assets/videos/add.mp4")}
            style={styles.bannerVideo}
            resizeMode="cover"
            shouldPlay
            isLooping
            isMuted
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTag}>Featured</Text>
          </View>
        </Animated.View>


        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionPill} />
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate("AllServicesScreen")}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={videos}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() => openServiceVariants(item.title)}
            >
              <Video
                source={item.source}
                style={styles.videoCardInner}
                resizeMode="cover"
                shouldPlay={visibleVideoId === item.id}
                isLooping
                isMuted
              />
              <View style={styles.videoOverlay}>
                <Text style={styles.videoTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          snapToInterval={232}
          decelerationRate="fast"
        />


        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionPill} />
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryCard}
              onPress={() => openServiceVariants(item.name, item)}
            >
              <View style={styles.categoryIconBox}>
                <Text style={{ fontSize: 24 }}>
                  {item.icon}
                </Text>
              </View>
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>


        {recentServices.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionPill} />
              <Text style={styles.sectionTitle}>Recently Used</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentServices.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentCard}
                  onPress={() => openServiceVariants(item.name, item)}
                >
                  <View style={styles.recentIconBox}>
                    <Text style={{ fontSize: 20 }}>
                      {item.icon}
                    </Text>
                  </View>
                  <Text style={styles.recentText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}


        {ongoingJobs.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionPill} />
              <Text style={styles.sectionTitle}>Ongoing Jobs</Text>
            </View>
            {ongoingJobs.map((job, index) => (
              <TouchableOpacity
                key={index}
                style={styles.jobCard}
                onPress={() => navigation.navigate("BookingScreen", { initialTab: "ongoing" })}
              >
                <View style={styles.jobIconBox}>
                  <Ionicons name="construct-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>
                    {job.serviceName}
                  </Text>
                  <Text style={styles.jobStatus}>{job.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}


        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionPill} />
          <Text style={styles.sectionTitle}>Popular Services</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.popularCard}
            onPress={() => openServiceVariants("Home Cleaning")}
          >
            <View style={styles.popularIconBox}>
              <Text style={{ fontSize: 20 }}>
                🧹
              </Text>
            </View>
            <Text style={styles.popularTitle}>Full Home Cleaning</Text>
            <Text style={styles.popularPrice}>Starting ₹999</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularCard}
            onPress={() => openServiceVariants("AC Repair")}
          >
            <View style={styles.popularIconBox}>
              <Text style={{ fontSize: 20 }}>
                ❄️
              </Text>
            </View>
            <Text style={styles.popularTitle}>AC Servicing</Text>
            <Text style={styles.popularPrice}>Starting ₹499</Text>
          </TouchableOpacity>
        </ScrollView>

      </ScrollView>

      <ServizoAlert
        visible={showAlert}
        title="Go Offline?"
        message="You will stop receiving new job requests. Do you want to continue?"
        onConfirm={confirmOffline}
        onCancel={cancelOffline}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) => {
  const c = theme.colors;
  const shadowColor = c.text;
  const mediaOverlay = c.bg + "73";
  const backdropOverlay = c.bg + "73";
  const onPrimarySoft = c.surface + "33";
  const onPrimaryMuted = c.surface + "BF";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.bg,
    },

    bgAccent: {
      position: "absolute",
      top: -60,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: c.primary + "0D",
    },

    container: {
      padding: 18,
      paddingBottom: 110,
    },


    locationBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      padding: 12,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },



    locationIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
    },

    locationLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: c.textMuted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    locationText: {
      fontSize: 13,
      fontWeight: "700",
      color: c.text,
      marginTop: 1,
    },


    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 18,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
      color: c.primary,
      textTransform: "uppercase",
      marginBottom: 2,
    },

    greeting: {
      fontSize: 20,
      fontWeight: "800",
      color: c.text,
      letterSpacing: -0.3,
    },

    subText: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 3,
      fontWeight: "500",
    },

    notificationBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },

    badge: {
      position: "absolute",
      top: -4,
      right: -4,
      backgroundColor: c.danger,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },

    badgeText: {
      color: c.surface,
      fontSize: 9,
      fontWeight: "700",
    },


    searchContainer: {
      position: "relative",
      marginBottom: 18,
      zIndex: 100,
    },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: 16,
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },

    searchInput: {
      marginLeft: 10,
      flex: 1,
      fontSize: 14,
      color: c.text,
      fontWeight: "500",
    },

    dropdown: {
      position: "absolute",
      top: 54,
      width: "100%",
      backgroundColor: c.surface,
      borderRadius: 16,
      elevation: 8,
      shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      zIndex: 1000,
      overflow: "hidden",
    },

    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 13,
      borderBottomWidth: 1,
      borderColor: c.border,
    },

    dropdownIconBox: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    dropdownText: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: "600",
      color: c.text,
    },


    bannerContainer: {
      height: 160,
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 22,
    },

    bannerVideo: {
      width: "100%",
      height: "100%",
    },

    bannerOverlay: {
      position: "absolute",
      top: 12,
      left: 12,
      backgroundColor: c.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },

    bannerTag: {
      color: c.surface,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },


    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },

    sectionPill: {
      width: 4,
      height: 16,
      borderRadius: 4,
      backgroundColor: c.primary,
      marginRight: 9,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: c.text,
      flex: 1,
      letterSpacing: 0.1,
    },

    viewAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },

    viewAllText: {
      color: c.primary,
      fontWeight: "700",
      fontSize: 13,
    },


    videoCard: {
      width: 220,
      height: 155,
      borderRadius: 16,
      overflow: "hidden",
      marginRight: 12,
      marginBottom: 20,
    },

    videoCardInner: {
      width: "100%",
      height: "100%",
    },

    videoOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 10,
      backgroundColor: mediaOverlay,
    },

    videoTitle: {
      color: c.text,
      fontWeight: "700",
      fontSize: 12,
    },


    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    categoryCard: {
      width: "48.5%",
      backgroundColor: c.surface,
      paddingVertical: 20,
      borderRadius: 24,
      alignItems: "center",
      marginBottom: 14,

      shadowColor,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    },

    categoryIconBox: {
      width: 35,
      height: 35,
      alignItems: "center",
      justifyContent: "center",
      // marginBottom: 12,
    },
    categoryText: {
      fontSize: 12.5,
      fontWeight: "700",
      textAlign: "center",
      color: c.text,
    },


    recentCard: {
      backgroundColor: c.surface,
      padding: 14,
      borderRadius: 16,
      marginRight: 10,
      alignItems: "center",
      width: 96,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      marginBottom: 20,
    },

    recentIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },

    recentText: {
      marginTop: 0,
      fontSize: 11.5,
      fontWeight: "700",
      textAlign: "center",
      color: c.text,
    },


    jobCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      padding: 14,
      borderRadius: 18,
      marginBottom: 10,
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      gap: 12,
    },

    jobIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
    },

    jobTitle: {
      fontWeight: "700",
      fontSize: 13.5,
      color: c.text,
    },

    jobStatus: {
      color: c.primary,
      marginTop: 2,
      fontSize: 12,
      fontWeight: "600",
    },

    arrowBox: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
    },

    popularCard: {
      backgroundColor: c.primary,
      padding: 18,
      borderRadius: 18,
      marginRight: 12,
      width: 200,
      marginBottom: 8,
    },

    popularIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: onPrimarySoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    popularTitle: {
      color: c.surface,
      fontSize: 14.5,
      fontWeight: "800",
    },

    popularPrice: {
      color: onPrimaryMuted,
      marginTop: 4,
      fontSize: 12.5,
      fontWeight: "600",
    },


    statusCard: {
      padding: 14,
      //borderRadius: 18,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor,
      //shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
      backgroundColor: "transparent",
    },

    statusDot: (isOnline) => ({
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isOnline ? c.success : c.danger,
    }),

    statusTitle: {
      fontWeight: "700",
      fontSize: 14,
      color: c.text,
    },

    statusSub: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "500",
      marginTop: 2,
    },

    statusBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },

    statusBtnText: {
      color: c.surface,
      fontWeight: "700",
      fontSize: 12.5,
    },


    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },

    statCard: {
      flex: 1,
      backgroundColor: c.surface,
      padding: 14,
      borderRadius: 18,
      alignItems: "center",
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },

    statValue: {
      fontSize: 18,
      fontWeight: "800",
      color: c.text,
      letterSpacing: -0.3,
    },

    statLabel: {
      fontSize: 11.5,
      color: c.textMuted,
      fontWeight: "600",
      marginTop: 3,
    },


    skillChip: {
      backgroundColor: c.primary + "15",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },

    skillChipText: {
      color: c.primary,
      fontWeight: "700",
      fontSize: 12.5,
    },


    emptyCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.surface,
      padding: 14,
      borderRadius: 16,
      marginBottom: 12,
    },

    emptyCardText: {
      color: c.textMuted,
      fontSize: 13.5,
      fontWeight: "600",
    },


    modalOverlay: {
      flex: 1,
      backgroundColor: backdropOverlay,
      justifyContent: "center",
      alignItems: "center",
    },

    modalCard: {
      width: "88%",
      backgroundColor: c.surface,
      borderRadius: 24,
      padding: 22,
      shadowColor,
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 24,
      elevation: 10,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
      gap: 10,
    },

    modalIcon: {
      width: 52,
      height: 52,
    },

    modalSubtitle: {
      textAlign: "center",
      marginBottom: 20,
      color: c.textMuted,
      fontWeight: "600",
      fontSize: 13,
    },

    roleCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bg,
      padding: 14,
      borderRadius: 16,
      marginBottom: 12,
    },

    roleIconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
    },

    roleTitle: {
      fontSize: 14.5,
      fontWeight: "700",
      color: c.text,
    },

    roleSubtitle: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: "500",
      marginTop: 2,
    },
  });
};

