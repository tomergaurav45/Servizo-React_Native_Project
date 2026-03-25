import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SafeAreaView } from "react-native-safe-area-context";
import ServizoDropdown from "../components/ServizoDropdown";
import ServizoInput from "../components/ServizoInput";

import { COLORS } from "../utils/constants";

export default function AddAddressMap({ navigation }) {
    const mapRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [house, setHouse] = useState("");
    const [landmark, setLandmark] = useState("");
    const [tag, setTag] = useState("Home");

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

      {/* 🔴 MAP SECTION (75%) */}
      <View style={styles.mapContainer}>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <GooglePlacesAutocomplete
            placeholder="Search location"
            fetchDetails={true}
            enablePoweredByContainer={false}
            keyboardShouldPersistTaps="handled"
            onPress={(data, details = null) => {
              if (!details) return;

              const loc = details.geometry.location;

              const coords = {
                latitude: loc.lat,
                longitude: loc.lng,
              };

              setLocation(coords);
              setAddress(details.formatted_address);

              mapRef.current?.animateToRegion({
                ...coords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }}
            query={{
              key: "YOUR_API_KEY",
              language: "en",
            }}
            styles={{
              textInput: {
                height: 45,
                borderRadius: 8,
                paddingHorizontal: 10,
                backgroundColor: "#fff",
              },
              listView: {
                backgroundColor: "#fff",
                position: "absolute",
                top: 50,
                zIndex: 9999,
                elevation: 10,
              },
            }}
          />
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Map */}
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

        {/* Marker */}
        <View style={styles.markerFixed}>
          <Text style={{ fontSize: 30 }}>📍</Text>
        </View>

      </View>

      {/* 🟢 FORM SECTION (25%) */}
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
              onSelect={setTag}
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { opacity: house ? 1 : 0.5 }
              ]}
              disabled={!house}
              onPress={() => {
                navigation.navigate("EditProfile", {
                  selectedAddress: address,
                  coordinates: location,
                  house,
                  landmark,
                  tag,
                });
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
  top: 10, // earlier was 50 → now reduce
  right: 20,
  zIndex: 9999,
  elevation: 10,
  backgroundColor: "#fff",
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},

closeText: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#333",
},
safeArea: {
  flex: 1,
  backgroundColor: "#fff", // match your app background
},

container: {
  flex: 1,
},

mapContainer: {
  flex: 3, // 75%
},

formContainer: {
  flex: 1, // 25%
  backgroundColor: "#fff",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 15,
  paddingTop: 10,
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
});