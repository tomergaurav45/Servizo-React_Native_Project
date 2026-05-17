import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServiceVariants } from "../apis/authApi";
import { COLORS } from "../utils/constants";

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

const VariantSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceCategory, serviceName, serviceItem } = route.params || {};
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariants();
  }, [serviceItem, serviceName]);

  const fetchVariants = async () => {
    try {
      setLoading(true);

      const res = await getServiceVariants(
        serviceItem?.name || serviceName
      );

      if (res?.success) {
        setVariants(res.data || []);
      }

    } catch (error) {
      console.log("Variants Error", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceName = serviceItem?.name || serviceName;
  const isDeliveryFlow = isDeliveryFlowService(selectedServiceName, serviceCategory);

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
      subService: `${selectedServiceName} - ${item.name}`,
      price: item.price,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVariantPress(item)}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Ionicons
            name={serviceItem?.icon || "construct-outline"}
            size={20}
            color={COLORS.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{selectedServiceName}</Text>
        </View>
      </View>

      <View style={styles.priceBox}>
        <Text style={styles.price}>{`\u20B9${item.price}`}</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{serviceItem?.name || serviceName}</Text>

        <View style={{ width: 22 }} />
      </View>

      {
        loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>
        ) : (
          <FlatList
            data={variants}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>
                Select Package
              </Text>
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No packages found
              </Text>
            }
          />
        )
      }
    </SafeAreaView>
  );
};

export default VariantSelectionScreen;

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
  list: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 8,
  },
});
