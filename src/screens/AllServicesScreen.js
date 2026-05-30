import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServices } from "../apis/authApi";
import ServizoLoader from "../components/ServizoLoader";
import { useTheme } from "../context/ThemeContext";

const SERVICE_EMOJIS = {
    "Home Cleaning": "🧹",
    "Bathroom Cleaning": "🚿",
    "Kitchen Cleaning": "🍽️",
    "Sofa Cleaning": "🛋️",
    "Carpet Cleaning": "🧽",
    "Window Cleaning": "🪟",
    "Water Tank Cleaning": "💧",
    "Office Cleaning": "🏢",
    "Post-Construction Cleaning": "🏗️",
    "Electrician": "⚡",
    "Plumber": "🚿",
    "AC Repair": "❄️",
    "AC Installation": "❄️",
    "AC Rental": "❄️",
    "Geyser Repair": "🔥",
    "Washing Machine Repair": "🧺",
    "Washing Machine Rental": "🧺",
    "Refrigerator Repair": "🧊",
    "Fridge Rental": "🧊",
    "RO Service": "💧",
    "RO Installation": "💧",
    "Microwave Repair": "📡",
    "Chimney Repair": "💨",
    "Dishwasher Repair": "🍽️",
    "Carpenter": "🪚",
    "Painter": "🎨",
    "Home Renovation": "🏠",
    "Tile Work": "◻️",
    "Furniture Repair": "🪑",
    "Furniture Assembly": "🪑",
    "Furniture Rental": "🛋️",
    "Furniture Shifting": "🚚",
    "Modular Kitchen Setup": "🍳",
    "Curtain Rod Installation": "🪟",
    "Wall Drilling": "🔨",
    "Mirror Hanging": "🪞",
    "Shelf Installation": "🧰",
    "Minor Repairs": "🔧",
    "Salon at Home": "✂️",
    "Haircut & Styling": "✂️",
    "Facial & Cleanup": "✨",
    "Makeup Artist": "💄",
    "Bridal Makeup": "✨",
    "Men Grooming": "🧔",
    "Massage Therapy": "💆",
    "Laptop Repair": "💻",
    "Computer Repair": "🖥️",
    "WiFi Setup": "📶",
    "CCTV Setup": "📹",
    "CCTV Installation": "📹",
    "Printer Repair": "🖨️",
    "TV Installation": "📺",
    "Fan Installation": "🌀",
    "Light Installation": "💡",
    "Inverter Installation": "🔋",
    "Doorbell Installation": "🔔",
    "Smart Home Setup": "🏠",
    "Smart Lock Installation": "🔐",
    "Alexa / Google Setup": "🎙️",
    "Home Automation Setup": "🏠",
    "Smart Lighting Setup": "💡",
    "Pet Grooming": "🐾",
    "Pet Walking": "🚶",
    "Pet Sitting": "🏠",
    "Vet Home Visit": "🩺",
    "Photographer": "📷",
    "Videographer": "🎥",
    "DJ Service": "🎵",
    "Event Decoration": "🎉",
    "Catering Service": "🍽️",
    "Graphic Designer": "🎨",
    "Video Editor": "🎬",
    "Product Photography": "📷",
    "Real Estate Photography": "🏠",
    "Drone Photography": "✈️",
    "Portfolio Shoot": "👤",
    "Packers & Movers": "🚚",
    "Local Delivery": "🚴",
    "Bike Delivery": "🏍️",
    "Mini Truck Booking": "🚚",
    "Parcel Pickup & Drop": "📦",
    "Office Shifting": "🏢",
    Gardening: "🌿",
    "Lawn Mowing": "🌱",
    "Plant Care": "🪴",
    "Pressure Washing": "💦",
    "Car Wash": "🚗",
    "Bike Repair": "🏍️",
    "Car Servicing": "🚗",
    "Car Detailing": "✨",
    "Battery Jumpstart": "🔋",
    "Tyre Repair": "🛞",
    "Maid Service": "🧹",
    "Cook / Chef": "👨‍🍳",
    Babysitting: "👶",
    "Elder Care": "👥",
    "Patient Care": "🩺",
    "Home Tutor": "📚",
    "Online Tutor": "💻",
    "Music Teacher": "🎵",
    "Fitness Trainer": "🏋️",
    "Yoga Instructor": "🧘",
    "Scrap Pickup": "🗑️",
    "Laundry Pickup": "👕",
    "Ironing Service": "🔥",
    "Key Maker": "🔑",
    Locksmith: "🔓",
    "On-demand Driver": "🚗",
    "Security Guard": "🛡️",
    "Night Guard": "🌙",
    "Event Security": "👥",
    "Home Security Setup": "🔒",
    "Doctor Home Visit": "🩺",
    "Nurse Care": "❤️",
    Physiotherapy: "🧘",
    "Medicine Delivery": "💊",
    "Lawyer Consultation": "📄",
    "Notary Services": "✍️",
    "GST Filing": "🧮",
    "Passport Assistance": "🪪",
    "Tent & Furniture Rental": "⛺",
    "Sound System Rental": "🎵",
    "Birthday Setup": "🎈",
    "Wedding Decoration Rental": "✨",
    "Personal Trainer": "🏋️",
    "Cricket Coach": "🏏",
    "Football Coach": "⚽",
    "Home Workout Trainer": "💪",
};

const SECTION_EMOJIS = {
    "Repair & Maintenance": "🔧",
    "Home Cleaning Services": "🧹",
    "Installation Services": "🛠️",
    "Construction & Renovation": "🏗️",
    "Salon & Personal Care": "✂️",
    "Tech Services": "💻",
    "Pet Services": "🐾",
    "Creative & Event Services": "🎉",
    "Moving & Delivery": "🚚",
    "Goods Transport & Delivery": "📦",
    "Outdoor Services": "🌿",
    "Automobile Services": "🚗",
    "Handyman Services": "🧰",
    "Daily Help Services": "👥",
    "Education & Training": "📚",
    "Utility Services": "🔑",
    "Security Services": "🛡️",
    "Health & Medical": "🩺",
    "Legal & Documentation": "📄",
    "Event Rentals": "🎪",
    "Rental Services": "🛋️",
    "Fitness & Sports": "🏋️",
    "Specialized Photography": "📷",
    "Smart Home Services": "🏠",
};

const getServiceEmoji = (serviceName, sectionTitle) =>
    SERVICE_EMOJIS[serviceName] || SECTION_EMOJIS[sectionTitle] || "🔧";

const AllServicesScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;
    const [search, setSearch] = useState("");
    const [servicesData, setServicesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const searchScale = useRef(new Animated.Value(1)).current;

    const filteredServices = servicesData
        .map((section) => ({
            ...section,
            data: (section?.data || []).filter((item) =>
                (item?.name || "")
                    .toLowerCase()
                    .includes((search || "").toLowerCase())
            ),
        }))
        .filter((section) => section.data.length > 0);

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 480,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 420,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [fadeAnim, loading, slideAnim]);

    const handleSearchFocus = (focused) => {
        setSearchFocused(focused);
        Animated.spring(searchScale, {
            toValue: focused ? 1.015 : 1,
            friction: 6,
            useNativeDriver: true,
        }).start();
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await getServices();
            if (res.success) {
                setServicesData(res.data);
            } else {
                console.log(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const ServiceCard = ({ service, sectionTitle, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 380,
                delay: index * 55,
                useNativeDriver: true,
            }).start();
        }, [cardAnim, index]);

        const handlePressIn = () => {
            Animated.spring(pressAnim, {
                toValue: 0.95,
                friction: 8,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(pressAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={[
                    styles.cardWrapper,
                    {
                        opacity: cardAnim,
                        transform: [
                            {
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [18, 0],
                                }),
                            },
                            { scale: pressAnim },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() =>
                        navigation.navigate("VariantSelectionScreen", {
                            serviceCategory: sectionTitle,
                            serviceName: service.name,
                            serviceItem: service,
                        })
                    }
                >
                    <View style={styles.iconBox}>
                        <Text style={styles.serviceEmoji}>
                            {getServiceEmoji(service.name, sectionTitle)}
                        </Text>
                    </View>
                    <Text style={styles.cardText}>{service.name}</Text>
                    <View style={styles.cardArrow}>
                        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.bgAccent} />

            <Animated.View
                style={[
                    styles.headerWrap,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <View>
                    <Text style={styles.headerEyebrow}>Explore</Text>
                    <Text style={styles.header}>All Services</Text>
                </View>
                <View style={styles.headerBadge}>
                    <Ionicons name="grid" size={18} color={colors.primary} />
                </View>
            </Animated.View>


            <Animated.View
                style={[
                    styles.searchBox,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: searchScale }],
                        borderColor: searchFocused ? colors.primary + "55" : "transparent",
                    },
                ]}
            >
                <Ionicons
                    name="search-outline"
                    size={18}
                    color={searchFocused ? colors.primary : colors.textMuted}
                />
                <TextInput
                    placeholder="Search services..."
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => handleSearchFocus(true)}
                    onBlur={() => handleSearchFocus(false)}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {loading ? (
                <View style={styles.loaderWrap}>
                    <ServizoLoader text="Fetching services" />
                </View>
            ) : (
                <>
                    <Animated.View
                        style={[
                            styles.listWrapper,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <FlatList
                            data={filteredServices}
                            keyExtractor={(item) => item.title}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeaderRow}>
                                        <View style={styles.sectionPill} />
                                        <Text style={styles.sectionTitle}>{item.title}</Text>
                                    </View>

                                    <View style={styles.grid}>
                                        {item.data.map((service, index) => (
                                            <ServiceCard
                                                key={`${item.title}-${service.name}-${index}`}
                                                service={service}
                                                sectionTitle={item.title}
                                                index={index}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        />
                    </Animated.View>
                </>
            )}
        </SafeAreaView>
    );
};

export default AllServicesScreen;

const createStyles = (theme) => {
    const c = theme.colors;
    const shadowColor = c.text;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: c.bg,
            paddingHorizontal: 18,
            paddingTop: 4,
        },

        bgAccent: {
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: c.primary + "0D",
        },


        headerWrap: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            marginBottom: 18,
        },

        headerEyebrow: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2.5,
            color: c.primary,
            textTransform: "uppercase",
            marginBottom: 2,
        },

        header: {
            fontSize: 28,
            fontWeight: "800",
            color: c.text,
            letterSpacing: -0.5,
        },

        headerBadge: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: c.primary + "15",
            alignItems: "center",
            justifyContent: "center",
        },


        searchBox: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: c.surface,
            paddingHorizontal: 14,
            paddingVertical: 13,
            borderRadius: 16,
            marginBottom: 22,
            borderWidth: 1.5,
            shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
        },

        input: {
            marginLeft: 10,
            flex: 1,
            fontSize: 14,
            color: c.text,
            fontWeight: "500",
        },

        loaderWrap: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },

        listWrapper: {
            flex: 1,
        },

        listContent: {
            paddingBottom: 32,
        },


        section: {
            marginBottom: 26,
        },

        sectionHeaderRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
        },

        sectionPill: {
            width: 4,
            height: 16,
            borderRadius: 4,
            backgroundColor: c.primary,
            marginRight: 9,
        },

        sectionTitle: {
            fontSize: 14,
            fontWeight: "700",
            color: c.text,
            letterSpacing: 0.2,
        },


        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
        },

        cardWrapper: {
            width: "48.5%",
            marginBottom: 12,
        },

        card: {
            backgroundColor: c.surface,
            padding: 16,
            borderRadius: 18,
            alignItems: "center",
            shadowColor,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
            position: "relative",
        },

        iconBox: {
            width: 50,
            height: 50,
            backgroundColor: c.primary + "12",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
        },

        serviceEmoji: {
            fontSize: 25,
            lineHeight: 30,
        },

        cardText: {
            fontSize: 12.5,
            fontWeight: "700",
            textAlign: "center",
            color: c.text,
            lineHeight: 17,
        },

        cardArrow: {
            position: "absolute",
            top: 12,
            right: 12,
        },
    });
};
