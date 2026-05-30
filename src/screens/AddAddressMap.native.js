import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { saveAddress } from "../apis/authApi";
import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";


const TOKEN = {
    green: "#2d6a4f",
    greenLight: "#e8f0ec",
    greenMid: "#52b788",
    surface: "#f7f6f2",
    border: "#e2dfd4",
    cardBg: "#ffffff",
    text: "#1a1a1a",
    textMuted: "#888888",
    textHint: "#bbbbbb",
    radius: 12,
    radiusSm: 8,
};

export default function AddAddressMap({ navigation }) {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [house, setHouse] = useState("");
    const [landmark, setLandmark] = useState("");
    const [tag, setTag] = useState("Home");
    const [customTag, setCustomTag] = useState("");
    const { user } = useAuth();

    const getAddressFromCoords = async (coords) => {
        try {
            setLoading(true);
            const reverse = await Location.reverseGeocodeAsync(coords);
            if (reverse.length > 0) {
                const place = reverse[0];
                const fullAddress = [
                    place.name,
                    place.street,
                    place.city,
                    place.region,
                    place.country,
                ]
                    .filter(Boolean)
                    .join(", ");
                setAddress(fullAddress);
                setLocation({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    city: place.city || place.subregion || "",
                    state: place.region || "",
                    pincode: place.postalCode || "",
                });
            }
        } catch (err) {
            console.log("Geocode Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Toast.show({ type: "error", text1: "Permission Denied", text2: "Location access is required." });
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocation(coords);
        getAddressFromCoords(coords);
        if (Platform.OS !== "web" && mapRef.current) {
            mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        }
    };

    useEffect(() => { getCurrentLocation(); }, []);

    if (Platform.OS === "web") {
        return (
            <View style={styles.webContainer}>
                <Text style={styles.webText}>Map is not supported on web.</Text>
            </View>
        );
    }

    const TAG_OPTIONS = ["Home", "Work", "Other"];

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={80}
            >
                <View style={styles.container}>

                    <View style={styles.mapContainer}>
                        {Platform.OS !== "web" && MapView && (
                            <MapView
                                ref={mapRef}
                                style={StyleSheet.absoluteFillObject}
                                initialRegion={{
                                    latitude: location?.latitude || 28.6139,
                                    longitude: location?.longitude || 77.209,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                onRegionChangeComplete={(region) => {
                                    const coords = { latitude: region.latitude, longitude: region.longitude };
                                    setLocation(coords);
                                    getAddressFromCoords(coords);
                                }}
                            >
                                {location && <Marker coordinate={location} />}
                            </MapView>
                        )}


                        <View style={styles.mapVignette} pointerEvents="none" />


                        <View style={styles.logoPill}>
                            <Image
                                source={require("../../assets/images/icon1.png")}
                                style={styles.logoImg}
                                resizeMode="contain"
                            />
                            <Text style={styles.logoText}>Servizo</Text>
                        </View>


                        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.curLocBtn} onPress={getCurrentLocation}>
                            <Text style={styles.curLocIcon}>◎</Text>
                            <Text style={styles.curLocText}>Use Current Location</Text>
                        </TouchableOpacity>


                        <View style={styles.pinWrapper} pointerEvents="none">
                            <View style={styles.pinShadow} />
                            <Text style={styles.pinEmoji}>📍</Text>
                        </View>
                    </View>


                    <View style={styles.sheet}>

                        <View style={styles.handle} />

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >

                            <View style={styles.addressRow}>
                                <View style={styles.addressIconWrap}>
                                    <Text style={styles.addressIcon}>📍</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.addressLabel}>SELECTED LOCATION</Text>
                                    <Text style={styles.addressText} numberOfLines={2}>
                                        {loading ? "Fetching address…" : address || "Move the map to pick a location"}
                                    </Text>
                                </View>
                            </View>


                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>HOUSE / FLAT NO.</Text>
                                <ServizoInput
                                    placeholder="e.g. B-204, Sunrise Apartments"
                                    icon="home-outline"
                                    value={house}
                                    onChangeText={setHouse}
                                    inputStyle={styles.inputOverride}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>LANDMARK</Text>
                                <ServizoInput
                                    placeholder="Near metro, market, school…"
                                    icon="location-outline"
                                    value={landmark}
                                    onChangeText={setLandmark}
                                    inputStyle={styles.inputOverride}
                                />
                            </View>


                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>SAVE AS</Text>
                                <View style={styles.tagRow}>
                                    {TAG_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[styles.tagChip, tag === opt && styles.tagChipActive]}
                                            onPress={() => { setTag(opt); if (opt !== "Other") setCustomTag(""); }}
                                        >
                                            <Text style={[styles.tagChipText, tag === opt && styles.tagChipTextActive]}>
                                                {opt === "Home" ? "🏠 " : opt === "Work" ? "💼 " : "📌 "}{opt}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {tag === "Other" && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>PLACE NAME</Text>
                                    <ServizoInput
                                        placeholder="e.g. Office, Gym, Friend's Home"
                                        icon="create-outline"
                                        value={customTag}
                                        onChangeText={setCustomTag}
                                        inputStyle={styles.inputOverride}
                                    />
                                </View>
                            )}


                            <TouchableOpacity
                                style={[styles.saveBtn, !house && styles.saveBtnDisabled]}
                                disabled={!house}
                                onPress={async () => {
                                    if (!house) return;
                                    if (tag === "Other" && !customTag.trim()) {
                                        Toast.show({ type: "info", text1: "Missing Field", text2: "Please enter a place name." });
                                        return;
                                    }
                                    const payload = {
                                        userId: user?.userId,
                                        fullAddress: address,
                                        landmark,
                                        type: tag === "Other" ? "Other" : tag,
                                        flatNumber: house,
                                        other: customTag,
                                        city: location?.city || "",
                                        state: location?.state || "",
                                        pincode: location?.pincode || "",
                                        latitude: location?.latitude,
                                        longitude: location?.longitude,
                                        isDefault: false,
                                    };
                                    const res = await saveAddress(payload);
                                    if (!res.success) {
                                        Toast.show({ type: "error", text1: "Save Failed", text2: res.message || "Something went wrong." });
                                        return;
                                    }
                                    Toast.show({ type: "success", text1: "Address Saved ✓", text2: "Your address has been added." });
                                    navigation.goBack();
                                }}
                            >
                                <Text style={styles.saveBtnText}>Save Address</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    safeArea: { flex: 1, backgroundColor: TOKEN.green },
    container: { flex: 1 },
    webContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: TOKEN.surface },
    webText: { fontSize: 15, color: TOKEN.textMuted },


    mapContainer: {
        flex: 1.1,
        backgroundColor: "#c8c4b4",
    },

    mapVignette: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",

    },

    logoPill: {
        position: "absolute",
        top: 14,
        left: 16,
        zIndex: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "rgba(255,255,255,0.88)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.6)",
    },

    logoImg: { width: 22, height: 22, borderRadius: 11 },
    logoText: { fontSize: 12, fontWeight: "600", color: TOKEN.text, letterSpacing: 0.3 },

    closeBtn: {
        position: "absolute",
        top: 14,
        right: 16,
        zIndex: 20,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.88)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.6)",
    },
    closeText: { fontSize: 14, fontWeight: "700", color: TOKEN.text, lineHeight: 16 },

    curLocBtn: {
        position: "absolute",
        bottom: 56,
        alignSelf: "center",
        zIndex: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: TOKEN.green,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 50,
        shadowColor: TOKEN.green,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 6,
    },
    curLocIcon: { fontSize: 13, color: "#fff" },
    curLocText: { fontSize: 12, fontWeight: "600", color: "#fff", letterSpacing: 0.2 },

    pinWrapper: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -34,
        marginLeft: -12,
        alignItems: "center",
        zIndex: 10,
    },
    pinEmoji: { fontSize: 28 },
    pinShadow: {
        width: 14,
        height: 5,
        backgroundColor: "rgba(0,0,0,0.18)",
        borderRadius: 7,
        marginTop: 2,
    },


    sheet: {
        flex: 1,
        backgroundColor: TOKEN.cardBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 10,
        marginTop: -20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        elevation: 10,
    },

    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#ddd",
        alignSelf: "center",
        marginBottom: 16,
    },

    scrollContent: { paddingBottom: 24 },


    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: TOKEN.surface,
        borderRadius: TOKEN.radius,
        padding: 12,
        marginBottom: 16,
        borderWidth: 0.5,
        borderColor: TOKEN.border,
    },
    addressIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: TOKEN.greenLight,
        justifyContent: "center",
        alignItems: "center",
    },
    addressIcon: { fontSize: 14 },
    addressLabel: { fontSize: 9, fontWeight: "600", color: TOKEN.green, letterSpacing: 1, marginBottom: 3 },
    addressText: { fontSize: 12, color: TOKEN.text, lineHeight: 17 },


    inputGroup: { marginBottom: 12 },
    inputLabel: { fontSize: 9, fontWeight: "600", color: TOKEN.textMuted, letterSpacing: 0.8, marginBottom: 5 },
    inputOverride: {
        backgroundColor: TOKEN.surface,
        borderRadius: TOKEN.radiusSm,
        borderWidth: 0.5,
        borderColor: TOKEN.border,
        fontSize: 13,
    },


    tagRow: { flexDirection: "row", gap: 8 },

    tagChip: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: TOKEN.radiusSm,
        backgroundColor: TOKEN.surface,
        borderWidth: 0.5,
        borderColor: TOKEN.border,
        alignItems: "center",
    },
    tagChipActive: {
        backgroundColor: TOKEN.green,
        borderColor: TOKEN.green,
    },
    tagChipText: {
        fontSize: 12,
        fontWeight: "500",
        color: TOKEN.textMuted,
    },
    tagChipTextActive: {
        color: "#fff",
    },


    saveBtn: {
        marginTop: 6,
        backgroundColor: TOKEN.green,
        paddingVertical: 15,
        borderRadius: TOKEN.radius,
        alignItems: "center",
        shadowColor: TOKEN.green,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    saveBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
    saveBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});