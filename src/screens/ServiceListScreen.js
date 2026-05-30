import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServices, getServiceVariants } from "../apis/authApi";
import { useTheme } from "../context/ThemeContext";

const ServiceListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const { service, serviceCategory, services: routeServices } = route.params || {};
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(!routeServices?.length);
    const [servicePrices, setServicePrices] = useState({});

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

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

    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
            ]).start();
        }
    }, [loading]);

    const services = useMemo(() => {
        if (routeServices?.length) return routeServices;

        const selectedService = service?.toLowerCase();
        const matchedSection = allServices.find(
            (section) => section.title?.toLowerCase() === selectedService
        );

        if (matchedSection) return matchedSection.data || [];

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

        if (services?.length) fetchVariants();
    }, [services]);

    const ServiceCard = ({ item, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 360,
                delay: index * 60,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () =>
            Animated.spring(pressAnim, { toValue: 0.97, friction: 8, useNativeDriver: true }).start();

        const handlePressOut = () =>
            Animated.spring(pressAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

        const price = servicePrices[item.name];

        return (
            <Animated.View
                style={{
                    opacity: cardAnim,
                    transform: [
                        {
                            translateY: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [16, 0],
                            }),
                        },
                        { scale: pressAnim },
                    ],
                }}
            >
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
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
                                color={colors.primary}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.name}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Starts at </Text>
                                <Text style={styles.priceValue}>
                                    ₹{price !== undefined ? price : "—"}
                                </Text>
                                {price === undefined && (
                                    <ActivityIndicator
                                        size={10}
                                        color={colors.primary}
                                        style={{ marginLeft: 4 }}
                                    />
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.arrowBox}>
                        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
           
            <View style={styles.bgAccent} />

           
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={18} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerEyebrow}>Services</Text>
                    <Text style={styles.headerTitle}>{service}</Text>
                </View>

                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <Animated.View
                    style={[
                        styles.listWrapper,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <FlatList
                        data={services}
                        keyExtractor={(item) => item._id || item.id || item.name}
                        renderItem={({ item, index }) => (
                            <ServiceCard item={item} index={index} />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyWrap}>
                                <View style={styles.emptyIcon}>
                                    <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
                                </View>
                                <Text style={styles.emptyText}>No services found</Text>
                            </View>
                        }
                    />
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

export default ServiceListScreen;

const createStyles = (theme) => {
    const c = theme.colors;
    const shadowColor = c.text;

    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.bg,
    },

    bgAccent: {
        position: "absolute",
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: c.primary + "0D",
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
        backgroundColor: c.surface,
        alignItems: "center",
        justifyContent: "center",
        shadowColor,
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
        color: c.primary,
        textTransform: "uppercase",
        marginBottom: 1,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: c.text,
        letterSpacing: -0.3,
    },

    
    listWrapper: {
        flex: 1,
    },

    listContent: {
        paddingHorizontal: 18,
        paddingTop: 6,
        paddingBottom: 32,
    },

   
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        backgroundColor: c.surface,
        borderRadius: 18,
        marginBottom: 12,
        shadowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },

    cardLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },

    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: c.primary + "12",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    title: {
        fontWeight: "700",
        fontSize: 14.5,
        color: c.text,
        marginBottom: 4,
    },

    priceRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    priceLabel: {
        fontSize: 12,
        color: c.textMuted,
        fontWeight: "500",
    },

    priceValue: {
        fontSize: 12,
        color: c.primary,
        fontWeight: "700",
    },

    arrowBox: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: c.primary + "12",
        alignItems: "center",
        justifyContent: "center",
    },


    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

   
    emptyWrap: {
        alignItems: "center",
        marginTop: 60,
    },

    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: c.surfaceAlt,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    emptyText: {
        color: c.textMuted,
        fontSize: 14,
        fontWeight: "600",
    },
    });
};
