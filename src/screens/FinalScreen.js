import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createBooking } from "../apis/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

export default function FinalScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const { user } = useAuth();

    const { serviceName, subService } = route.params || {};

    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const isFormValid = description.trim() && selectedAddress;

    const handleBooking = async () => {
        if (!description) {
            alert("Please describe your problem");
            return;
        }

        if (!selectedAddress) {
            alert("Please select address");
            return;
        }

        const payload = {
            userId: user?.userId,
            serviceName,
            subService,
            description,
            notes,
            address: selectedAddress,
            status: "OPEN",
        };

        const res = await createBooking(payload);

        if (!res.success) {
            alert(res.message);
            return;
        }

        alert("Booking Confirmed!");

        navigation.navigate("ActivityScreen");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>


                <View style={styles.card}>
                    <Text style={styles.label}>Service</Text>
                    <Text style={styles.serviceText}>
                        {serviceName} → {subService}
                    </Text>
                </View>


                <View style={styles.card}>
                    <Text style={styles.label}>Describe your problem *</Text>
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
                >
                    <Text style={styles.label}>Address</Text>
                    <Text style={styles.addressText}>
                        {selectedAddress
                            ? `${selectedAddress.title}, ${selectedAddress.fullAddress}`
                            : "Select or change your address"}
                    </Text>

                    <Ionicons
                        name="chevron-forward-outline"
                        size={18}
                        color="#999"
                        style={{ marginLeft: "auto" }}
                    />
                </TouchableOpacity>

                {/* 🔹 Notes */}
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

            </ScrollView>


            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        !isFormValid && { backgroundColor: "#ccc" } // disabled color
                    ]}
                    onPress={handleBooking}
                    disabled={!isFormValid}
                >
                    <Text style={styles.buttonText}>Book Service</Text>
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
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});