import { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ServizoBackButton from "../components/ServizoBackButton";
import { COLORS } from "../utils/constants";

export default function ReviewScreen() {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedReview, setSelectedReview] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const tabs = [
        { key: "all", label: "All" },
        { key: "positive", label: "Positive" },
        { key: "negative", label: "Negative" },
    ];

    const reviews = [
        {
            id: "1",
            name: "Amit Sharma",
            rating: 5,
            comment: "Excellent service, very professional!",
            date: "2 days ago",
        },
        {
            id: "2",
            name: "Priya Verma",
            rating: 2,
            comment: "Service was late and not satisfactory.",
            date: "1 week ago",
        },
    ];

    const filteredReviews = reviews.filter((r) => {
        if (activeTab === "positive") return r.rating >= 4;
        if (activeTab === "negative") return r.rating <= 2;
        return true;
    });

    const openModal = (review) => {
        setSelectedReview(review);
        setShowModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formCard}>

                <ServizoBackButton />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require("../../assets/images/icon1.png")}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <View>
                        <Text style={styles.title}>My Reviews</Text>
                        <Text style={styles.subtitle}>
                            See what people say about you
                        </Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabBtn,
                                activeTab === tab.key && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.key && styles.activeTabText,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Review List */}
                <FlatList
                    data={filteredReviews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text>{"⭐".repeat(item.rating)}</Text>
                            </View>

                            <Text style={styles.comment}>{item.comment}</Text>
                            <Text style={styles.date}>{item.date}</Text>

                            <TouchableOpacity onPress={() => openModal(item)}>
                                <Text style={styles.viewText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                {/* Modal */}
                <Modal transparent visible={showModal} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>

                            <Text style={styles.modalTitle}>
                                {selectedReview?.name}
                            </Text>

                            <Text style={styles.modalRating}>
                                {"⭐".repeat(selectedReview?.rating || 0)}
                            </Text>

                            <Text style={styles.modalText}>
                                {selectedReview?.comment}
                            </Text>

                            <Text style={styles.modalDate}>
                                {selectedReview?.date}
                            </Text>

                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>


    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },

    formCard: {
        flex: 1,
        backgroundColor: COLORS.background2,
        borderRadius: 20,
        padding: 16,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.primary,
        // marginBottom: 15,
    },

    subtitle: {
        fontSize: 13,
        color: "#777",
        // marginTop: 2,
        //marginLeft: 10,
    },

    tabContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },

    tabBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#eee",
    },

    activeTab: { backgroundColor: COLORS.primary },

    tabText: { fontSize: 13 },

    activeTabText: { color: "#fff", fontWeight: "600" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    name: { fontWeight: "600" },

    comment: { marginVertical: 8 },

    date: { color: "#888", fontSize: 12 },

    viewText: {
        color: COLORS.primary,
        marginTop: 8,
        fontWeight: "600",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
    },

    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginRight: 7,
    },

    icon: {
        width: 70,
        height: 70,
    },


    modalTitle: { fontSize: 18, fontWeight: "700" },

    modalRating: { marginVertical: 10 },

    modalText: { fontSize: 14, color: "#555" },

    modalDate: { color: "#888", marginTop: 10 },

    closeBtn: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    closeText: { color: "#fff", fontWeight: "600" },
});
