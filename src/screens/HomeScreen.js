import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList, Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getNotifications, getProviderRequests, getProviderReviews, getServices, registerUser, updateOnlineStatus } from "../apis/authApi";
import { ServizoAlert } from "../components/ServizoAlert";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const categories = [
  { id: 1, name: "Home Cleaning", icon: "home-outline" },
  { id: 2, name: "Electrician", icon: "flash-outline" },
  { id: 3, name: "Plumber", icon: "water-outline" },
  { id: 4, name: "AC Repair", icon: "snow-outline" },
  { id: 5, name: "Salon", icon: "cut-outline" },
  { id: 6, name: "Appliance Repair", icon: "build-outline" },
  { id: 7, name: "Delivery", icon: "bicycle-outline" },
  { id: 8, name: "Carpenter", icon: "hammer-outline" },
];

const videos = [
  {
    id: "1",
    title: "Home Cleaning",
    source: require("../../assets/videos/cleaning.mp4"),
  },
  {
    id: "2",
    title: "Electrician",
    source: require("../../assets/videos/electrician.mp4"),
  },
  {
    id: "3",
    title: "Plumber",
    source: require("../../assets/videos/plumber.mp4"),
  },
  {
    id: "4",
    title: "AC Repair & Services",
    source: require("../../assets/videos/ac.mp4"),
  },
  {
    id: "5",
    title: "Carpenter",
    source: require("../../assets/videos/carpenter.mp4"),
  },
  {
    id: "6",
    title: "Car Washing",
    source: require("../../assets/videos/carwashing.mp4"),
  },
  {
    id: "7",
    title: "Renovation",
    source: require("../../assets/videos/civil.mp4"),
  },
  {
    id: "8",
    title: "Goods Transport",
    source: require("../../assets/videos/delivery.mp4"),
  },
  {
    id: "9",
    title: "Painter",
    source: require("../../assets/videos/paint.mp4"),
  },
  {
    id: "10",
    title: "Pet Caretaker",
    source: require("../../assets/videos/pet.mp4"),
  },
  {
    id: "11",
    title: "Appliance Repair",
    source: require("../../assets/videos/television.mp4"),
  },
  {
    id: "12",
    title: "Yoga & Home tutor",
    source: require("../../assets/videos/tutor.mp4"),
  },
  {
    id: "13",
    title: "Car Washing and Mechanics",
    source: require("../../assets/videos/washing.mp4"),
  }

];



export default function HomeScreen() {


  const toggleStatus = async (value) => {
    if (loading || !user?.userId) return;

    const previousStatus = isOnline;

    setIsOnline(value);
    setLoading(true);

    try {
      const data = await updateOnlineStatus(user.userId, value);

      if (data?.success) {
        setIsOnline(typeof data.isOnline === "boolean" ? data.isOnline : value);
      } else {
        throw new Error(data?.message || "Failed to update status");
      }
    } catch (err) {
      console.log("Online status update failed:", err);

      setIsOnline(previousStatus);

      Toast.show({
        type: "error",
        text1: "Failed to update status",
      });
    } finally {
      setLoading(false);
    }
  };

  const { user, updateRole, setUser } = useAuth();
  const isProvider = user?.role === "provider";

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigation = useNavigation();
  const [visibleVideoId, setVisibleVideoId] = useState("1");
  const route = useRoute();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allServicesFlat, setAllServicesFlat] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(route.params?.search || "");
  const [newRequests, setNewRequests] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [recentServices, setRecentServices] = useState([


    { name: "Plumber", icon: "water-outline" },
    { name: "AC Repair", icon: "snow-outline" }
  ]);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);


  const [ongoingJobs, setOngoingJobs] = useState([
    { name: "Home Cleaning", status: "In Progress" }
  ]);

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 70,
  });

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleVideoId(viewableItems[0].item.id);
    }
  });

  const fetchRequests = async () => {
    try {
      const res = await getProviderRequests(user.userId);

      if (res.success) {

        const newReq = res.data.filter(
          item => item.status === "OPEN"
        );

        const ongoing = res.data.filter(
          item =>
            item.status === "ACCEPTED" ||
            item.status === "IN_PROGRESS"
        );

        // 🔥 TODAY EARNINGS
        const today = new Date().toDateString();

        const completedToday = res.data.filter(item => {
          return (
            item.status === "COMPLETED" &&
            new Date(item.updatedAt).toDateString() === today
          );
        });

        const total = completedToday.reduce(
          (sum, item) => sum + (item.price || 0),
          0
        );

        setNewRequests(newReq);
        setOngoingJobs(ongoing);
        setTodayEarnings(total);

      }
    } catch (err) {
      console.log(err);
    }
  };


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

  useEffect(() => {
    if (user?.isOnline !== undefined) {
      setIsOnline(user.isOnline);
    }
  }, [user]);

  useEffect(() => {
    console.log("🟢 isOnline changed:", isOnline);
  }, [isOnline]);

  const fetchRating = async () => {
    try {
      if (!user?.userId) return;

      const res = await getProviderReviews(user.userId);

      console.log("REVIEW API:", res);

      if (res.success && res.data) {
        setRating(res.data.avgRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      } else {
        setRating(0);
        setTotalReviews(0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isProvider && user?.userId) {
      fetchRating();
    }
  }, [user]);

  useEffect(() => {
    if (isProvider) {
      fetchRequests();
    }
  }, []);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const addr = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addr.length > 0) {
        setAddress(`${addr[0].city}, ${addr[0].region}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (user && !user.role) {
      setShowRoleModal(true);
    } else {
      setShowRoleModal(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await getServices();

    if (res.success) {
      const flat = res.data.flatMap(section => section.data);
      setAllServicesFlat(flat);
    }
  };

  const confirmOffline = () => {
    setShowAlert(false);
    toggleStatus(false);
  };

  const cancelOffline = () => {
    setShowAlert(false);
    setPendingStatus(null);
  };

  const handleSearch = (text) => {
    setSearchText(text);

    if (text.length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = allServicesFlat.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );



    setSuggestions(filtered.slice(0, 5));
  };


  const selectRole = async (role) => {
    try {

      const response = await registerUser({
        userId: user.userId,
        role: role
      });

      if (response.success) {

        updateRole(role);

        setShowRoleModal(false);

        if (role === "customer") {
          Toast.show({
            type: "success",
            text1: "Congratulations 🎉",
            text2: "You can now find trusted services on Servizo",
          });
        }

        if (role === "provider") {
          Toast.show({
            type: "success",
            text1: "Congratulations 🎉",
            text2: "You can now offer services and earn with Servizo",
          });
        }

      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "Role update failed",
        });
      }

    } catch (error) {

      Toast.show({
        type: "error",
        text1: "Server Error",
        text2: "Unable to update role",
      });

    }
  };

  if (isProvider) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            style={styles.locationBar}
            onPress={() => navigation.navigate("ManageAddressScreen")}
          >
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />

            <View style={{ marginLeft: 8 }}>
              <Text style={styles.locationLabel}>Your Location</Text>
              <Text style={styles.locationText}>
                {address || "Detecting location..."}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>



          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>
                Hi {user?.name} 👋
              </Text>
              <Text style={styles.subText}>
                Ready to earn today?
              </Text>
            </View>

            {/* 🔔 Notification Icon */}
            <TouchableOpacity
              style={styles.notificationIcon}
              onPress={() => navigation.navigate("NotificationScreen")}
            >
              <View>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={COLORS.primary}
                />

                {/* 🔴 Badge */}
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: isOnline ? "#E8F5E9" : "#FFEBEE",
              padding: 15,
              borderRadius: 12,
              marginBottom: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {isOnline ? "You are Online 🟢" : "You are Offline 🔴"}
              </Text>

              <Text style={{ color: "#666", marginTop: 4 }}>
                {isOnline
                  ? "You will receive new job requests"
                  : "You will not receive new jobs"}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: isOnline ? "#E53935" : "#2E7D32",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 8,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
              onPress={() => toggleStatus(!isOnline)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {isOnline ? "Go Offline" : "Go Online"}
              </Text>
            </TouchableOpacity>
          </View>


          <Text style={styles.sectionTitle}>New Requests</Text>

          {newRequests.length === 0 ? (
            <Text style={{ color: "#888" }}>No new requests</Text>
          ) : (
            <>
              {/* 🔥 ONLY ONE REQUEST */}
              <TouchableOpacity
                style={styles.jobCard}
                onPress={() =>
                  navigation.navigate("BookingDetails", {
                    booking: newRequests[0],
                  })
                }
              >
                <Text style={styles.jobTitle}>
                  {newRequests[0].serviceName}
                </Text>

                <Text style={styles.jobStatus}>
                  {newRequests[0].address?.city} • ₹{newRequests[0].price || 500}
                </Text>
              </TouchableOpacity>

              {/* 🔥 VIEW ALL BUTTON */}
              <TouchableOpacity
                onPress={() => navigation.navigate("BookingScreen")}
              >
                <Text
                  style={{
                    color: COLORS.primary,
                    marginTop: 8,
                    fontWeight: "600",
                  }}
                >
                  View All Requests →
                </Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.sectionTitle}>Ongoing Jobs</Text>

          {ongoingJobs.length === 0 ? (
            <Text style={{ color: "#888" }}>No ongoing jobs</Text>
          ) : (
            ongoingJobs.map((job, index) => (
              <TouchableOpacity
                key={index}
                style={styles.jobCard}
                onPress={() =>
                  navigation.navigate("BookingDetails", { booking: job })
                }
              >
                <Text style={styles.jobTitle}>
                  {job.serviceName}
                </Text>

                <Text style={styles.jobStatus}>
                  {job.status} • {job.address?.city}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {/* 💰 Earnings */}
          <View style={{
            backgroundColor: "#E8F5E9",
            padding: 15,
            borderRadius: 12,
            marginBottom: 15
          }}>
            <Text style={{ fontWeight: "bold" }}>Today&apos;s Earnings</Text>
            <Text style={{ fontSize: 18, color: "green" }}>
              ₹{todayEarnings}
            </Text>
          </View>


          <View style={{
            backgroundColor: "#FFF3CD",
            padding: 15,
            borderRadius: 12,
            marginBottom: 15
          }}>
            <Text style={{ fontWeight: "bold" }}>⭐ Your Rating</Text>
            <Text style={{ fontSize: 16, marginTop: 4 }}>
              ⭐ {rating} / 5 ({totalReviews} reviews)
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("ReviewScreen")}
            >
              <Text style={{ color: COLORS.primary, marginTop: 6 }}>
                View Reviews →
              </Text>
            </TouchableOpacity>
          </View>

          {/* ⚡ Quick Actions */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>



          </View>

          {/* 🧰 My Skills */}
          <Text style={styles.sectionTitle}>My Skills</Text>

          <View style={styles.categoryGrid}>
            {user?.skills?.map((skill, index) => (
              <View key={index} style={styles.categoryCard}>
                <Text>{skill}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }


  return (

    <SafeAreaView style={styles.safeArea}>
      <Modal visible={showRoleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Image
                source={require("../../assets/images/icon1.png")}
                style={styles.modalIcon}
              />
              <Text style={styles.greeting}>
                Hi {user?.name || "User"}
              </Text>
            </View>

            <Text style={styles.subText}>
              What service do you need today?
            </Text>

            {/* Find Services */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => selectRole("customer")}
            >
              <Ionicons name="search-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.roleTitle}>Find Services</Text>
                <Text style={styles.roleSubtitle}>
                  Book trusted professionals
                </Text>
              </View>
            </TouchableOpacity>

            {/* Offer Services */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => selectRole("provider")}
            >
              <Ionicons name="briefcase-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.roleTitle}>Offer Services</Text>
                <Text style={styles.roleSubtitle}>
                  Earn money with your skills
                </Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.locationBar}
          onPress={() => navigation.navigate("ManageAddressScreen")}
        >
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />

          <View style={{ marginLeft: 8 }}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.locationText}>
              {address || "Detecting location..."}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color="#999"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>
              Hey!! {user?.name || "User"}
            </Text>
            <Text style={styles.subText}>
              What service do you need today?
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate("NotificationScreen")}
          >
            <View>
              <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />

              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>


        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#888" />

            <TextInput
              placeholder="Search for services"
              value={searchText}
              onChangeText={handleSearch} // ✅ IMPORTANT
              style={{ marginLeft: 10, flex: 1, paddingVertical: 0 }}
            />
          </View>

          {/* 🔥 DROPDOWN */}
          {suggestions.length > 0 && (
            <View style={styles.dropdown}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSearchText(item.name);
                    setSuggestions([]);

                    navigation.navigate("ServiceList", {
                      service: item.name,
                    });
                  }}
                >
                  <Ionicons name={item.icon} size={18} color="#555" />
                  <Text style={styles.dropdownText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.videoContainer}>
          <Video
            source={require("../../assets/videos/add.mp4")} // your video
            style={styles.video}
            resizeMode="cover"
            shouldPlay
            isLooping
            isMuted
          />
        </View>


        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.sectionTitle}>Featured Services</Text>

          <TouchableOpacity onPress={() => navigation.navigate("AllServicesScreen")}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={videos}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() =>
                navigation.navigate("ServiceList", { service: item.title })
              }
            >
              <Video
                source={item.source}
                style={styles.video}
                resizeMode="cover"
                shouldPlay={visibleVideoId === item.id} // 🔥 only visible plays
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
          snapToInterval={232} // 🔥 smooth snapping
          decelerationRate="fast"
        />


        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryCard}
              onPress={() =>
                navigation.navigate("ServiceList", { service: item.name })
              }
            >
              <Ionicons name={item.icon} size={28} color={COLORS.primary} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {recentServices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recently Used</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentServices.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentCard}
                  onPress={() =>
                    navigation.navigate("ServiceList", { service: item.name })
                  }
                >
                  <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                  <Text style={styles.recentText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {ongoingJobs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ongoing Jobs</Text>
            {ongoingJobs.map((job, index) => (
              <View key={index} style={styles.jobCard}>
                <Text style={styles.jobTitle}>{job.name}</Text>
                <Text style={styles.jobStatus}>{job.status}</Text>
              </View>
            ))}
          </>
        )}

        {/* Popular Services */}
        <Text style={styles.sectionTitle}>Popular Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.popularCard}>
            <Text style={styles.popularTitle}>Full Home Cleaning</Text>
            <Text style={styles.popularPrice}>Starting ₹999</Text>
          </View>

          <View style={styles.popularCard}>
            <Text style={styles.popularTitle}>AC Servicing</Text>
            <Text style={styles.popularPrice}>Starting ₹499</Text>
          </View>
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


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 15,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  subText: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchText: {
    marginLeft: 10,
    color: "#888",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.textDark,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  popularCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 14,
    marginRight: 12,
    width: 220,
  },
  popularTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  popularPrice: {
    color: "#fff",
    marginTop: 6,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  notificationIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },

  locationLabel: {
    fontSize: 12,
    color: "#777",
  },

  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 6,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  modalIcon: {
    width: 70,
    height: 70,
    marginRight: 8,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  modalSubtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
    fontWeight: "bold"
  },

  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  roleSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  videoContainer: {
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
  },

  video: {
    width: "100%",
    height: "100%",
  },
  videoCard: {
    width: 220,
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
    marginBottom: 12,
  },

  videoOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },

  videoTitle: {
    color: "#f4f0f0",
    fontWeight: "bold",
    backgroundColor: "#ab1212"
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
  },
  recentCard: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    width: 100
  },

  recentText: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center"
  },

  jobCard: {
    backgroundColor: "#E3F2FD",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  jobTitle: {
    fontWeight: "bold",
    fontSize: 14
  },

  jobStatus: {
    color: COLORS.primary,
    marginTop: 4,
    fontSize: 12
  },
  searchContainer: {
    position: "relative",
    marginBottom: 20,
  },

  dropdown: {
    position: "absolute",
    top: 55,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  dropdownText: {
    marginLeft: 10,
    fontSize: 14,
  },
});


