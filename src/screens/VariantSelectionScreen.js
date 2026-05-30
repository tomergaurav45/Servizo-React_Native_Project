import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServiceVariants } from "../apis/authApi";
import { useTheme } from "../context/ThemeContext";

const isDeliveryFlowService = (serviceName, serviceCategory) => {
  const value = `${serviceName || ""} ${serviceCategory || ""}`.toLowerCase();
  return (
    value.includes("delivery") ||
    value.includes("pickup") ||
    value.includes("parcel") ||
    value.includes("mover") ||
    value.includes("moving") ||
    value.includes("shifting") ||
    value.includes("transport") ||
    value.includes("truck")
  );
};

const getPerKmRate = (serviceName, variantName) => {
  const value = `${serviceName || ""} ${variantName || ""}`.toLowerCase();
  if (value.includes("truck")) return 45;
  if (value.includes("mover") || value.includes("shifting") || value.includes("furniture")) return 35;
  if (value.includes("large") || value.includes("bulk")) return 28;
  if (value.includes("medium")) return 20;
  if (value.includes("document") || value.includes("small")) return 12;
  return 15;
};

const SERVICE_EMOJIS = {
  "Home Cleaning": "🧹",
  "Bathroom Cleaning": "🚿",
  "Kitchen Cleaning": "🍽️",
  Electrician: "⚡",
  Plumber: "🚿",
  "AC Repair": "❄️",
  "AC Installation": "❄️",
  "Geyser Repair": "🔥",
  "Washing Machine Repair": "🧺",
  "Refrigerator Repair": "🧊",
  "RO Service": "💧",
  Carpenter: "🪚",
  Painter: "🎨",
  "Home Renovation": "🏠",
  "Salon at Home": "✂️",
  "Haircut & Styling": "✂️",
  "Laptop Repair": "💻",
  "Computer Repair": "🖥️",
  "WiFi Setup": "📶",
  "TV Installation": "📺",
  "Pet Grooming": "🐾",
  Photographer: "📷",
  Videographer: "🎥",
  "DJ Service": "🎵",
  "Event Decoration": "🎉",
  "Packers & Movers": "🚚",
  "Local Delivery": "🚴",
  "Bike Delivery": "🏍️",
  "Parcel Pickup & Drop": "📦",
  "Furniture Shifting": "🚚",
  Gardening: "🌿",
  "Car Wash": "🚗",
  "Bike Repair": "🏍️",
  "Maid Service": "🧹",
  "Cook / Chef": "👨‍🍳",
  "Home Tutor": "📚",
  "Fitness Trainer": "🏋️",
  "Scrap Pickup": "🗑️",
  "Laundry Pickup": "👕",
  Locksmith: "🔓",
  "Security Guard": "🛡️",
  "Doctor Home Visit": "🩺",
  "Medicine Delivery": "💊",
  "Lawyer Consultation": "📄",
};

const ICON_EMOJIS = {
  "flash-outline": "⚡",
  "water-outline": "💧",
  "snow-outline": "❄️",
  "flame-outline": "🔥",
  "sync-outline": "🧺",
  "cube-outline": "📦",
  "hammer-outline": "🔨",
  "build-outline": "🔧",
  "construct-outline": "🔧",
  "home-outline": "🏠",
  "cut-outline": "✂️",
  "laptop-outline": "💻",
  "desktop-outline": "🖥️",
  "wifi-outline": "📶",
  "videocam-outline": "📹",
  "tv-outline": "📺",
  "paw-outline": "🐾",
  "camera-outline": "📷",
  "musical-notes-outline": "🎵",
  "restaurant-outline": "🍽️",
  "bicycle-outline": "🏍️",
  "car-outline": "🚗",
  "leaf-outline": "🌿",
  "trash-outline": "🗑️",
  "shirt-outline": "👕",
  "key-outline": "🔑",
  "shield-outline": "🛡️",
  "medkit-outline": "🩺",
  "document-text-outline": "📄",
};

const getServiceEmoji = (serviceName, iconName) =>
  SERVICE_EMOJIS[serviceName] || ICON_EMOJIS[iconName] || "🔧";

const VariantSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = theme.colors;
  const { serviceCategory, serviceName, serviceItem } = route.params || {};
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getServiceVariants(serviceItem?.name || serviceName);
      if (res?.success) setVariants(res.data || []);
    } catch (error) {
      console.log("Variants Error", error);
    } finally {
      setLoading(false);
    }
  }, [serviceItem?.name, serviceName]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]).start();
    }
  }, [fadeAnim, loading, slideAnim]);

  const selectedServiceName = serviceItem?.name || serviceName;
  const isDeliveryFlow = isDeliveryFlowService(selectedServiceName, serviceCategory);
  const serviceEmoji = getServiceEmoji(selectedServiceName, serviceItem?.icon);

  const handleVariantPress = (item) => {
    if (isDeliveryFlow) {
      navigation.navigate("DeliveryBookingScreen", {
        serviceCategory: serviceCategory || serviceName,
        serviceName,
        serviceItem,
        parcelType: {
          ...item,
          perKm: item.perKm || getPerKmRate(selectedServiceName, item.name),
        },
      });
      return;
    }
    navigation.navigate("FinalScreen", {
      serviceCategory: serviceCategory || serviceName,
      serviceName,
      serviceItem,
      subService: `${selectedServiceName} - ${item.name}`,
      price: item.price,
    });
  };

  const VariantCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 360,
        delay: index * 60,
        useNativeDriver: true,
      }).start();
    }, [cardAnim, index]);

    const handlePressIn = () =>
      Animated.spring(pressAnim, { toValue: 0.97, friction: 8, useNativeDriver: true }).start();

    const handlePressOut = () =>
      Animated.spring(pressAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
            { scale: pressAnim },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handleVariantPress(item)}
        >
          <View style={styles.cardLeft}>
            <View style={styles.iconBox}>
              <Text style={styles.serviceEmoji}>{serviceEmoji}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.subtitle}>{selectedServiceName}</Text>
            </View>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>₹{item.price}</Text>
            <View style={styles.arrowBox}>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.bgAccent} />


      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>Packages</Text>
          <Text style={styles.headerTitle}>{serviceItem?.name || serviceName}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.listWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <FlatList
            data={variants}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <VariantCard item={item} index={index} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionPill} />
                <Text style={styles.sectionTitle}>Select Package</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyText}>No packages found</Text>
              </View>
            }
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default VariantSelectionScreen;

const createStyles = (theme) => {
  const c = theme.colors;
  const shadowColor = c.text;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },

    bgAccent: {
      position: "absolute",
      top: -50,
      right: -50,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: c.primary + "0D",
    },


    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 16,
    },

    backBtn: {
      width: 40,
      height: 40,
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

    headerCenter: {
      alignItems: "center",
    },

    headerEyebrow: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2.5,
      color: c.primary,
      textTransform: "uppercase",
      marginBottom: 1,
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: c.text,
      letterSpacing: -0.3,
    },


    listWrapper: {
      flex: 1,
    },

    listContent: {
      paddingHorizontal: 18,
      paddingTop: 4,
      paddingBottom: 32,
    },


    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },

    sectionPill: {
      width: 4,
      height: 16,
      borderRadius: 4,
      backgroundColor: c.primary,
      marginRight: 9,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: c.text,
      letterSpacing: 0.2,
    },


    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.surface,
      padding: 14,
      borderRadius: 18,
      marginBottom: 12,
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    },

    cardLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },

    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },

    serviceEmoji: {
      fontSize: 24,
      lineHeight: 29,
    },

    title: {
      fontSize: 14.5,
      fontWeight: "700",
      color: c.text,
      marginBottom: 3,
    },

    subtitle: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "500",
    },

    priceBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    price: {
      color: c.primary,
      fontWeight: "800",
      fontSize: 15,
      letterSpacing: -0.3,
    },

    arrowBox: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: c.primary + "12",
      alignItems: "center",
      justifyContent: "center",
    },


    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },


    emptyWrap: {
      alignItems: "center",
      marginTop: 60,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: c.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },

    emptyText: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: "600",
    },
  });
};
