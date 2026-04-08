import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";


const allServices = [
    {
        title: "Home Services",
        data: [
            { name: "Home Cleaning", icon: "home-outline" },
            { name: "Painting", icon: "color-palette-outline" },
            { name: "Renovation", icon: "hammer-outline" },
        ],
    },
    {
        title: "Repair Services",
        data: [
            { name: "Electrician", icon: "flash-outline" },
            { name: "Plumber", icon: "water-outline" },
            { name: "AC Repair", icon: "snow-outline" },
            { name: "Appliance Repair", icon: "construct-outline" },
        ],
    },
    {
        title: "Transport Services",
        data: [
            { name: "Goods Transport", icon: "cube-outline" },
            { name: "House Shifting", icon: "car-outline" },
        ],
    },
];

const AllServicesScreen = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState("");

    const filteredServices = allServices.map((section) => ({
        ...section,
        data: section.data.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        ),
    }));

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <Text style={styles.header}>All Services</Text>

            {/* Search */}
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#888" />
                <TextInput
                    placeholder="Search services..."
                    style={styles.input}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Sections */}
            <FlatList
                data={filteredServices}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.sectionTitle}>{item.title}</Text>

                        <View style={styles.grid}>
                            {item.data.map((service) => (
                                <TouchableOpacity
                                    key={service.name}
                                    style={styles.card}
                                    onPress={() =>
                                        navigation.navigate("ServiceList", {
                                            service: service.name,
                                        })
                                    }
                                >
                                    <View style={styles.iconBox}>
                                        <Ionicons
                                            name={service.icon}
                                            size={22}
                                            color={COLORS.primary}
                                        />
                                    </View>

                                    <Text style={styles.cardText}>{service.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default AllServicesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },

    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f1f1",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },

    input: {
        marginLeft: 10,
        flex: 1,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    card: {
        width: "48%",
        backgroundColor: "#fafafa",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        alignItems: "center",
        elevation: 2,
    },

    iconBox: {
        backgroundColor: "#f0f0f0",
        padding: 10,
        borderRadius: 30,
        marginBottom: 8,
    },

    cardText: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
});