import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAddresses } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import BookingsScreen from "../screens/BookingsScreen";
import HomeScreen from "../screens/HomeScreen";
import MessageListScreen from "../screens/MessagesListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { COLORS } from "../utils/constants";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const insets = useSafeAreaInsets();

  const getIcon = (routeName) => {
    switch (routeName) {
      case "Home":
        return "home-outline";
      case "Bookings":
        return "calendar-outline";
      case "Message":
        return "chatbubble-ellipses-outline";
      case "Profile":
        return "person-outline";
      default:
        return "ellipse-outline";
    }
  };

  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = getIcon(route.name);

          if (route.name === "Profile") {
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />

             
                {showProfileWarning && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "red",
                    }}
                  />
                )}
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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