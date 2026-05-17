import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServices, getServiceVariants } from "../apis/authApi";
import { COLORS } from "../utils/constants";

const ServiceListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { service, serviceCategory, services: routeServices } = route.params || {};
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(!routeServices?.length);
    const [servicePrices, setServicePrices] = useState({});

    useEffect(() => {
        if (routeServices?.length) return;

        const fetchServices = async () => {
            const res = await getServices();

            if (res.success) {
                setAllServices(res.data || []);
            }

            setLoading(false);
        };

        fetchServices();
    }, [routeServices]);

    const services = useMemo(() => {
        if (routeServices?.length) {
            return routeServices;
        }

        const selectedService = service?.toLowerCase();

        const matchedSection = allServices.find(
            (section) => section.title?.toLowerCase() === selectedService
        );

        if (matchedSection) {
            return matchedSection.data || [];
        }

        return allServices
            .flatMap((section) => section.data || [])
            .filter((item) => item.name?.toLowerCase() === selectedService);
    }, [allServices, routeServices, service]);

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                const pricesMap = {};

                for (const item of services) {
                    const res = await getServiceVariants(item.name);

                    if (res?.success && res?.data?.length > 0) {
                        pricesMap[item.name] = res.data[0]?.price || 0;
                    }
                }

                setServicePrices(pricesMap);
            } catch (error) {
                console.log("Variants Error", error);
            }
        };

        if (services?.length) {
            fetchVariants();
        }
    }, [services]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate("VariantSelectionScreen", {
                    serviceCategory: serviceCategory || service,
                    serviceName: service,
                    serviceItem: item,
                })
            }
        >
            <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                    <Ionicons
                        name={item.icon || "construct-outline"}
                        size={20}
                        color={COLORS.primary}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.price}>
                        {`Starts at ₹${servicePrices[item.name] || 0}`}
                    </Text>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{service}</Text>

                <View style={{ width: 22 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item._id || item.id || item.name}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No services found</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default ServiceListScreen;

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

    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f9f9f9",
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

    title: {
        fontWeight: "bold",
        fontSize: 15,
    },

    price: {
        color: "#666",
        marginTop: 4,
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyText: {
        color: "#777",
        textAlign: "center",
        marginTop: 30,
    },
});
