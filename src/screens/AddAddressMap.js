import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function AddAddressMap() {

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");

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

    // Reverse geocoding
    const reverse = await Location.reverseGeocodeAsync(coords);

    if (reverse.length > 0) {
      const place = reverse[0];

      const fullAddress = `
${place.name || ""}
${place.street || ""}
${place.city || ""}
${place.region || ""}
${place.postalCode || ""}
${place.country || ""}
`;

      setAddress(fullAddress);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>

      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} />
        </MapView>
      )}

      {/* Address Preview */}
      {address !== "" && (
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      )}

      {/* Use Current Location Button */}
      <TouchableOpacity
        style={styles.currentBtn}
        onPress={getCurrentLocation}
      >
        <Text style={styles.btnText}>Use Current Location</Text>
      </TouchableOpacity>

      {/* Confirm Address Button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={() => alert("Address Selected")}
      >
        <Text style={styles.btnText}>Confirm Address</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  addressBox: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 3,
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
    backgroundColor: "#27AE60",
    padding: 12,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

});