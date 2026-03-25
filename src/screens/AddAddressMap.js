import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { saveAddress } from "../apis/authApi";
import ServizoDropdown from "../components/ServizoDropdown";
import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

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
            alert("Location permission denied");
            return;
        }

        const loc = await Location.getCurrentPositionAsync({});

        const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        };

        setLocation(coords);
        getAddressFromCoords(coords);

        mapRef.current?.animateToRegion({
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    if (Platform.OS === "web") {
        return (
            <View style={styles.webContainer}>
                <Text>Map not supported on web </Text>
            </View>
        );
    }

    const Maps = require("react-native-maps");
    const MapView = Maps.default;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                
                <View style={styles.mapContainer}>

                    <TouchableOpacity style={styles.logoBtn}>
                        <Image
                            source={require("../../assets/images/icon1.png")} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>



                    
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.currentLocationBtn}
                        onPress={getCurrentLocation}
                    >
                        <Text style={styles.currentLocationText}>📍 Use Current Location</Text>
                    </TouchableOpacity>

                    
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: location?.latitude || 28.6139,
                            longitude: location?.longitude || 77.2090,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onRegionChangeComplete={(region) => {
                            const coords = {
                                latitude: region.latitude,
                                longitude: region.longitude,
                            };

                            setLocation(coords);
                            getAddressFromCoords(coords);
                        }}
                    />

                    
                    <View style={styles.markerFixed}>
                        <Text style={{ fontSize: 30 }}>📍</Text>
                    </View>

                </View>

                
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={styles.formCard}>

                            <Text style={styles.title}>Selected Location</Text>

                            <Text style={styles.address}>
                                {loading ? "Fetching..." : address}
                            </Text>

                            <ServizoInput
                                label="House / Flat Number"
                                placeholder="Enter house number"
                                icon="home-outline"
                                value={house}
                                onChangeText={setHouse}
                            />

                            <ServizoInput
                                label="Landmark"
                                placeholder="Enter landmark"
                                icon="location-outline"
                                value={landmark}
                                onChangeText={setLandmark}
                            />

                            <ServizoDropdown
                                label="Save as"
                                icon="bookmark-outline"
                                data={["Home", "Other"]}
                                value={tag}
                                onSelect={(value) => {
                                    setTag(value);

                                    if (value !== "Other") {
                                        setCustomTag(""); 
                                    }
                                }}
                            />

                            {tag === "Other" && (
                                <ServizoInput
                                    label="Enter Place Name"
                                    placeholder="e.g. Office, Gym, Friend's Home"
                                    icon="create-outline"
                                    value={customTag}
                                    onChangeText={setCustomTag}
                                />
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.saveBtn,
                                    { opacity: house ? 1 : 0.5 }
                                ]}
                                disabled={!house}
                               onPress={async () => {

  if (!house) return;
if (tag === "Other" && !customTag.trim()) {
  Toast.show({
    type: "info",
    text1: "Missing Field",
    text2: "Please enter place name",
  });
  return;
}

  const payload = {
    userId: user?.userId,
    fullAddress: address,
    landmark,
    type: tag === "Other" ? "Other" : tag,
    flatNumber:house,
    other:customTag,
    city: "",
    state: "",
    pincode: "",
    latitude: location?.latitude,
    longitude: location?.longitude,
    isDefault: false,
  };

  const res = await saveAddress(payload);

  if (!res.success) {
    Toast.show({
  type: "error",
  text1: "Save Failed",
  text2: res.message || "Something went wrong",
});
    return;
  }

 Toast.show({
  type: "success",
  text1: "Address Saved",
  text2: "Your address has been added successfully",
});

  navigation.goBack();
}}
                            >
                                <Text style={{ color: "#fff" }}>Save Address</Text>
                            </TouchableOpacity>

                        </View>

                    </ScrollView>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    map: { flex: 1 },
    searchContainer: {
        position: "absolute",
        top: 40,
        left: 10,
        right: 10,
        zIndex: 999,
        elevation: 5,
    },

    webContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },


    listView: {
        backgroundColor: "#fff",
        position: "absolute",
        top: 50,
        zIndex: 999,
        elevation: 5,
    },

    addressBox: {
        position: "absolute",
        top: 100,
        left: 10,
        right: 10,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
    },

    addressText: {
        fontSize: 14,
    },

    currentBtn: {
        position: "absolute",
        bottom: 90,
        alignSelf: "center",
        backgroundColor: "#2F80ED",
        padding: 12,
        borderRadius: 8,
    },

    confirmBtn: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
    },

    btnText: {
        color: "#fff",
        fontWeight: "bold",
    },

    markerFixed: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -15,
        marginTop: -30,
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
    },

    address: {
        color: "#555",
        marginVertical: 8,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },

    label: {
        marginTop: 10,
        fontWeight: "bold",
    },

    tagContainer: {
        flexDirection: "row",
        marginTop: 10,
    },

    tag: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },

    tagActive: {
        borderWidth: 1,
        borderColor: "#000",
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },

    saveBtn: {
        marginTop: 15,
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },

    formCard: {
        backgroundColor: COLORS.background2,
        borderRadius: 20,
        padding: 20,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },

    closeBtn: {
        position: "absolute",
        top: 10,
        right: 20,
        zIndex: 9999,
        elevation: 10,

        backgroundColor: "rgba(0, 0, 0, 0.25)", // 👈 glass effect
        width: 42,
        height: 42,
        borderRadius: 21,

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 5,
        borderColor: "rgba(0, 0, 0, 0.4)",

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },

    closeText: {
        fontSize: 23,
        fontWeight: "bold",
        color: "#0f1010", 
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#fff", 
    },

    container: {
        flex: 1,
    },

    mapContainer: {
        flex: 7, 
    },

    formContainer: {
        flex: 4, 
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
    },

    currentLocationBtn: {
        position: "absolute",
        top: 60,
        alignSelf: "center",
        zIndex: 9999,
        elevation: 10,

        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,

        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },

    currentLocationText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },

    map: {
        flex: 1,
    },

    searchWrapper: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        zIndex: 9999,
        elevation: 10,
    },

    logoBtn: {
        position: "absolute",
        top: 10,
        left: 20,
        zIndex: 9999,
        elevation: 10,

        backgroundColor: "rgba(255,255,255,0.25)",
        width: 42,
        height: 42,
        borderRadius: 21,

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },

    logo: {
        width: 40,
        height: 40,
    },
});