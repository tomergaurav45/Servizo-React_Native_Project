import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ServiceListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { service } = route.params || {};


    const services = [
        { id: "1", name: "Basic Cleaning", price: "₹499" },
        { id: "2", name: "Deep Cleaning", price: "₹999" },
        { id: "3", name: "Premium Cleaning", price: "₹1499" },
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate("FinalScreen", {
                    serviceName: service,
                    subService: item.name,
                })
            }
        >
            <View>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{service}</Text>

                <View style={{ width: 22 }} />
            </View>

            {/* List */}
            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
            />
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
        fontSize: 18,
        fontWeight: "bold",
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

    title: {
        fontWeight: "bold",
        fontSize: 15,
    },

    price: {
        color: "#666",
        marginTop: 4,
    },
});