import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
    ActivityIndicator,
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

export default function FinalScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        serviceName,
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

    const isFormValid = description.trim() && selectedAddress && !isSubmitting;

    const showError = (text1, text2) => {
        Toast.show({ type: "error", text1, text2 });
    };

    const goToBookings = () => {
        navigation.navigate("MainTabs", { screen: "Bookings" });
    };

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

            await createNotification({
                userId: user?.userId,
                type: "booking",
                title: "Booking Request Sent",
                message:
                    "Your booking request has been sent to providers. Once a provider accepts it, we will notify you.",
                bookingId: createdBookingId,
            });

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

                const providerRes = await acceptBooking({
                    bookingId: createdBookingId,
                    providerId,
                });

                if (!providerRes.success) {
                    Toast.show({
                        type: "info",
                        text1: "Booking Created",
                        text2: providerRes.message || "Provider request failed.",
                    });
                    goToBookings();
                    return;
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
            showError(
                "Booking Failed",
                error?.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.label}>Service</Text>
                    <Text style={styles.serviceText}>
                        {serviceName} - {subService}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Describe your requirement *</Text>
                    <TextInput
                        placeholder="e.g. Fan not working properly..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        style={styles.input}
                    />
                </View>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() =>
                        navigation.navigate("ManageAddressScreen", {
                            onSelectAddress: (address) => {
                                setSelectedAddress(address);
                            },
                        })
                    }
                    activeOpacity={0.85}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.label}>Address</Text>
                        <Ionicons name="chevron-forward-outline" size={18} color="#999" />
                    </View>

                    <Text style={selectedAddress ? styles.addressText : styles.placeholderText}>
                        {selectedAddress
                            ? `${selectedAddress.title}, ${selectedAddress.fullAddress}`
                            : "Select or change your address"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <Text style={styles.label}>Additional Notes</Text>
                    <TextInput
                        placeholder="Optional instructions..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        style={styles.input}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Price</Text>
                    <Text style={styles.serviceText}>{`\u20B9${price || 0}`}</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
                <TouchableOpacity
                    style={[styles.button, !isFormValid && styles.buttonDisabled]}
                    onPress={handleBooking}
                    disabled={!isFormValid}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Book Service</Text>
                    )}
                </TouchableOpacity>
            </View>
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
        paddingBottom: 120,
    },
    card: {
        backgroundColor: "#f9f9f9",
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        color: COLORS.textDark,
    },
    serviceText: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        minHeight: 80,
        textAlignVertical: "top",
    },
    addressText: {
        color: "#666",
        lineHeight: 20,
    },
    placeholderText: {
        color: "#999",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
