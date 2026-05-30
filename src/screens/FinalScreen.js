import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { acceptBooking, createBooking, createNotification } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const SERVICE_EMOJIS = {
    "Home Cleaning": "🧹",
    "Bathroom Cleaning": "🚿",
    "Kitchen Cleaning": "🍽️",
    "Electrician": "⚡",
    "Plumber": "🚿",
    "AC Repair": "❄️",
    "AC Installation": "❄️",
    "Geyser Repair": "🔥",
    "Washing Machine Repair": "🧺",
    "Refrigerator Repair": "🧊",
    "RO Service": "💧",
    "Carpenter": "🪚",
    "Painter": "🎨",
    "Home Renovation": "🏠",
    "Salon at Home": "✂️",
    "Haircut & Styling": "✂️",
    "Laptop Repair": "💻",
    "Computer Repair": "🖥️",
    "WiFi Setup": "📶",
    "TV Installation": "📺",
    "Pet Grooming": "🐾",
    "Photographer": "📷",
    "Packers & Movers": "🚚",
    "Local Delivery": "🚴",
    "Bike Delivery": "🏍️",
    "Parcel Pickup & Drop": "📦",
    "Furniture Shifting": "🚚",
    "Gardening": "🌿",
    "Car Wash": "🚗",
    "Bike Repair": "🏍️",
    "Maid Service": "🧹",
    "Cook / Chef": "👨‍🍳",
    "Home Tutor": "📚",
    "Fitness Trainer": "🏋️",
    "Security Guard": "🛡️",
    "Doctor Home Visit": "🩺",
    "Medicine Delivery": "💊",
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
    "tv-outline": "📺",
    "paw-outline": "🐾",
    "camera-outline": "📷",
    "bicycle-outline": "🏍️",
    "car-outline": "🚗",
    "leaf-outline": "🌿",
    "shield-outline": "🛡️",
    "medkit-outline": "🩺",
};

const getServiceEmoji = (serviceName, iconName) =>
    SERVICE_EMOJIS[serviceName] || ICON_EMOJIS[iconName] || "🔧";

export default function FinalScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        serviceName,
        serviceItem,
        subService,
        serviceCategory,
        providerId,
        price,
        presetAddress,
        initialDescription,
        initialNotes,
    } = route.params || {};

    const [selectedAddress, setSelectedAddress] = useState(presetAddress || null);
    const [description, setDescription] = useState(initialDescription || "");
    const [notes, setNotes] = useState(initialNotes || "");
    const [descFocused, setDescFocused] = useState(false);
    const [notesFocused, setNotesFocused] = useState(false);

    const btnAnim = useRef(new Animated.Value(1)).current;

    const isFormValid = description.trim() && selectedAddress && !isSubmitting;
    const selectedServiceName = serviceItem?.name || serviceName;
    const serviceEmoji = getServiceEmoji(selectedServiceName, serviceItem?.icon);

    const showError = (text1, text2) => Toast.show({ type: "error", text1, text2 });

    const goToBookings = () => navigation.navigate("MainTabs", { screen: "Bookings" });

    const handleBtnPressIn = () =>
        Animated.spring(btnAnim, { toValue: 0.97, friction: 8, useNativeDriver: true }).start();

    const handleBtnPressOut = () =>
        Animated.spring(btnAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

    const handleBooking = async () => {
        if (!description.trim()) {
            showError("Description Required", "Please describe your requirement.");
            return;
        }
        if (!selectedAddress) {
            showError("Address Required", "Please select an address.");
            return;
        }

        setIsSubmitting(true);

        try {
            const normalizedCategory = serviceCategory?.toLowerCase().includes("clean")
                ? "Cleaning"
                : serviceCategory;

            const payload = {
                userId: user?.userId,
                serviceName,
                serviceCategory: normalizedCategory,
                subService,
                description: description.trim(),
                notes,
                addressId: selectedAddress?.id,
                price,
            };

            const res = await createBooking(payload);

            if (!res.success) {
                showError("Booking Failed", res.message || "Please try again.");
                return;
            }

            const createdBooking = res.data || res.booking || res.result || {};
            const createdBookingId =
                createdBooking.bookingId || createdBooking._id || res.bookingId;

            const customerNotification = await createNotification({
                userId: user?.userId,
                type: "booking",
                title: "Booking Request Sent",
                message:
                    "Your booking request has been sent to providers. Once a provider accepts it, we will notify you.",
                bookingId: createdBookingId,
            });

            if (!customerNotification?.success) {
                console.log("Customer notification failed:", customerNotification?.message);
            }

            if (providerId) {
                if (!createdBookingId) {
                    Toast.show({
                        type: "info",
                        text1: "Booking Created",
                        text2: "Provider assignment could not be completed.",
                    });
                    goToBookings();
                    return;
                }

                const providerRes = await acceptBooking({ bookingId: createdBookingId, providerId });

                if (!providerRes.success) {
                    Toast.show({
                        type: "info",
                        text1: "Booking Created",
                        text2: providerRes.message || "Provider request failed.",
                    });
                    goToBookings();
                    return;
                }

                const providerNotification = await createNotification({
                    userId: providerId,
                    type: "booking",
                    title: "New Booking Request",
                    message: `${user?.name || "A customer"} sent you a service request.`,
                    bookingId: createdBookingId,
                });

                if (!providerNotification?.success) {
                    console.log("Provider notification failed:", providerNotification?.message);
                }
            }

            Toast.show({
                type: "success",
                text1: "Booking Confirmed",
                text2: providerId
                    ? "Your request was sent to the provider."
                    : "Your service booking was created.",
            });

            goToBookings();
        } catch (error) {
            showError("Booking Failed", error?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            
            <View style={styles.bgAccent} />

           
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={18} color="#16161E" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerEyebrow}>Confirm</Text>
                    <Text style={styles.headerTitle}>Book Service</Text>
                </View>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
               
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconBox}>
                        <Text style={styles.serviceEmoji}>{serviceEmoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryLabel}>Selected Service</Text>
                        <Text style={styles.summaryValue}>
                            {serviceName} — {subService}
                        </Text>
                    </View>
                    <View style={styles.priceTag}>
                        <Text style={styles.priceTagText}>₹{price || 0}</Text>
                    </View>
                </View>

              
                <View style={[styles.card, descFocused && styles.cardFocused]}>
                    <View style={styles.cardLabelRow}>
                        <View style={styles.cardPill} />
                        <Text style={styles.label}>Describe your requirement <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                        placeholder="e.g. Fan not working properly..."
                        placeholderTextColor="#ABABBB"
                        value={description}
                        onChangeText={setDescription}
                        onFocus={() => setDescFocused(true)}
                        onBlur={() => setDescFocused(false)}
                        multiline
                        style={styles.input}
                    />
                </View>

               
                <TouchableOpacity
                    style={styles.card}
                    onPress={() =>
                        navigation.navigate("ManageAddressScreen", {
                            onSelectAddress: (address) => setSelectedAddress(address),
                        })
                    }
                    activeOpacity={0.85}
                >
                    <View style={styles.cardLabelRow}>
                        <View style={styles.cardPill} />
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.cardChevron}>
                            <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
                        </View>
                    </View>

                    {selectedAddress ? (
                        <View style={styles.addressRow}>
                            <View style={styles.addressIconBox}>
                                <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                            </View>
                            <Text style={styles.addressText}>
                                {selectedAddress.title}, {selectedAddress.fullAddress}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.addressRow}>
                            <View style={styles.addressIconBox}>
                                <Ionicons name="add-outline" size={16} color="#ABABBB" />
                            </View>
                            <Text style={styles.placeholderText}>Select or change your address</Text>
                        </View>
                    )}
                </TouchableOpacity>

              
                <View style={[styles.card, notesFocused && styles.cardFocused]}>
                    <View style={styles.cardLabelRow}>
                        <View style={styles.cardPill} />
                        <Text style={styles.label}>Additional Notes</Text>
                        <Text style={styles.optionalBadge}>Optional</Text>
                    </View>
                    <TextInput
                        placeholder="Optional instructions..."
                        placeholderTextColor="#ABABBB"
                        value={notes}
                        onChangeText={setNotes}
                        onFocus={() => setNotesFocused(true)}
                        onBlur={() => setNotesFocused(false)}
                        multiline
                        style={styles.input}
                    />
                </View>
            </ScrollView>

          
            <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
                <Animated.View style={{ transform: [{ scale: btnAnim }] }}>
                    <TouchableOpacity
                        style={[styles.button, !isFormValid && styles.buttonDisabled]}
                        onPress={handleBooking}
                        onPressIn={handleBtnPressIn}
                        onPressOut={handleBtnPressOut}
                        disabled={!isFormValid}
                        activeOpacity={1}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnInner}>
                                <Text style={styles.buttonText}>Confirm Booking</Text>
                                <View style={styles.btnArrow}>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F7F7FA",
    },

    bgAccent: {
        position: "absolute",
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: COLORS.primary + "0D",
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
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
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
        color: COLORS.primary,
        textTransform: "uppercase",
        marginBottom: 1,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#16161E",
        letterSpacing: -0.3,
    },

   
    container: {
        paddingHorizontal: 18,
        paddingTop: 4,
        paddingBottom: 120,
    },

    /* Summary card */
    summaryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
        gap: 12,
    },

    summaryIconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: COLORS.primary + "12",
        alignItems: "center",
        justifyContent: "center",
    },

    serviceEmoji: {
        fontSize: 24,
        lineHeight: 29,
    },

    summaryLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#ABABBB",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        marginBottom: 3,
    },

    summaryValue: {
        fontSize: 13.5,
        fontWeight: "700",
        color: "#16161E",
        lineHeight: 18,
    },

    priceTag: {
        backgroundColor: COLORS.primary + "15",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },

    priceTagText: {
        fontSize: 14,
        fontWeight: "800",
        color: COLORS.primary,
        letterSpacing: -0.3,
    },

   
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: "transparent",
    },

    cardFocused: {
        borderColor: COLORS.primary + "40",
    },

    cardLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    cardPill: {
        width: 3,
        height: 13,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: 8,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#16161E",
        flex: 1,
    },

    required: {
        color: COLORS.primary,
    },

    cardChevron: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: COLORS.primary + "12",
        alignItems: "center",
        justifyContent: "center",
    },

    optionalBadge: {
        fontSize: 10,
        fontWeight: "600",
        color: "#ABABBB",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    input: {
        backgroundColor: "#F7F7FA",
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
        textAlignVertical: "top",
        fontSize: 13.5,
        color: "#16161E",
        fontWeight: "500",
        lineHeight: 20,
    },

    
    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },

    addressIconBox: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: COLORS.primary + "12",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },

    addressText: {
        flex: 1,
        color: "#3A3A45",
        fontSize: 13.5,
        fontWeight: "500",
        lineHeight: 20,
    },

    placeholderText: {
        flex: 1,
        color: "#ABABBB",
        fontSize: 13.5,
        fontWeight: "500",
        lineHeight: 20,
    },

  
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#F7F7FA",
        paddingHorizontal: 18,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: "#EBEBF0",
    },

    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },

    buttonDisabled: {
        backgroundColor: "#D8D8E0",
    },

    btnInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 0.2,
    },

    btnArrow: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
