import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getDistanceKm = (pickupAddress, dropAddress) => {
  const lat1 = toNumber(pickupAddress?.latitude);
  const lon1 = toNumber(pickupAddress?.longitude);
  const lat2 = toNumber(dropAddress?.latitude);
  const lon2 = toNumber(dropAddress?.longitude);

  if ([lat1, lon1, lat2, lon2].some((value) => value === null)) return null;

  const earthRadiusKm = 6371;
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(0.1, earthRadiusKm * c);
};

const AddressPickerCard = ({ label, address, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.cardHeader}>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </View>

    <Text style={address ? styles.addressText : styles.placeholderText}>
      {address ? `${address.title}, ${address.fullAddress}` : `Select ${label.toLowerCase()}`}
    </Text>
  </TouchableOpacity>
);

export default function DeliveryBookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    serviceCategory,
    serviceName,
    serviceItem,
    parcelType,
    variant,
  } = route.params || {};

  const [pickupAddress, setPickupAddress] = useState(null);
  const [dropAddress, setDropAddress] = useState(null);

  const distanceKm = useMemo(
    () => getDistanceKm(pickupAddress, dropAddress),
    [dropAddress, pickupAddress]
  );

  const finalPrice = useMemo(() => {
    const basePrice = parcelType?.price || variant?.price || 0;
    const perKm = parcelType?.perKm || 0;

    if (parcelType && perKm > 0) {
      return Math.round(basePrice + perKm * (distanceKm || 0));
    }

    return basePrice;
  }, [distanceKm, parcelType, variant]);

  const canContinue = pickupAddress && dropAddress && distanceKm !== null;

  const openAddressPicker = (type) => {
    navigation.navigate("ManageAddressScreen", {
      onSelectAddress: (address) => {
        if (type === "pickup") {
          setPickupAddress(address);
        } else {
          setDropAddress(address);
        }
      },
    });
  };

  const continueToBooking = () => {
    if (!canContinue) return;

    navigation.navigate("FinalScreen", {
      serviceCategory: serviceCategory || serviceName,
      serviceName,
      serviceItem,
      subService: `${serviceItem?.name || serviceName} - ${parcelType?.name || variant?.name
        }`,
      price: finalPrice,
      presetAddress: pickupAddress,
      initialDescription: `Delivery parcel type: ${parcelType?.name || variant?.name}`,
      initialNotes: `Pickup: ${pickupAddress.fullAddress}\nDrop: ${dropAddress.fullAddress}\nDistance: ${distanceKm.toFixed(1)} km`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Delivery Details</Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Parcel Type</Text>
          <Text style={styles.summaryTitle}>{parcelType?.name}</Text>
          <Text style={styles.summaryText}>
            {parcelType
              ? `Base fare ₹${parcelType?.price || 0} + ₹${parcelType?.perKm || 0}/km`
              : `Service Price ₹${variant?.price || 0}`}
          </Text>
        </View>

        <AddressPickerCard
          label="Pickup Address"
          address={pickupAddress}
          onPress={() => openAddressPicker("pickup")}
        />

        <AddressPickerCard
          label="Drop Address"
          address={dropAddress}
          onPress={() => openAddressPicker("drop")}
        />

        <View style={styles.priceCard}>
          <Text style={styles.label}>Distance Calculation</Text>
          <Text style={styles.distanceText}>
            {distanceKm === null
              ? "Select pickup and drop addresses with map location"
              : `${distanceKm.toFixed(1)} km`}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.finalLabel}>Final Price</Text>
            <Text style={styles.finalPrice}>{`\u20B9${finalPrice}`}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={continueToBooking}
          disabled={!canContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  summaryLabel: {
    color: "#777",
    fontSize: 12,
    marginBottom: 4,
  },
  summaryTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryText: {
    color: "#666",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
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
    color: COLORS.textDark,
  },
  addressText: {
    color: "#555",
    lineHeight: 20,
  },
  placeholderText: {
    color: "#999",
  },
  priceCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
  },
  distanceText: {
    color: "#666",
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 16,
    paddingTop: 16,
  },
  finalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  finalPrice: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "bold",
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
