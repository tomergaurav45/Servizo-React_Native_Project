import { useState } from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ServizoBackButton from "../components/ServizoBackButton";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

export default function ActivityScreen() {
    const { user } = useAuth();

    const role = user?.role;
    const isSeeker = role === "customer";

    const [activeTab, setActiveTab] = useState(
        isSeeker ? "requests" : "accepted"
    );

    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const seekerTabs = [
        { key: "requests", label: "My Requests" },
        { key: "ongoing", label: "Ongoing Jobs" },
        { key: "completed", label: "Completed Jobs" },
    ];

    const providerTabs = [
        { key: "accepted", label: "Accepted Jobs" },
        { key: "completed", label: "Completed Jobs" },
        { key: "pending", label: "Pending Requests" },
    ];

    const tabs = isSeeker ? seekerTabs : providerTabs;

    const openModal = (status) => {
        setSelectedJob({
            service: "Plumbing",
            jobType: "Repair",
            price: 500,
            location: "Sector 15, Noida",
            date: "29 Mar • 10:30 AM",
            userName: isSeeker ? "Provider Name" : "Customer Name",
            phone: "9528588923",
            description: "Pipe leakage in kitchen",
            status,
        });
        setShowModal(true);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "requests":
                return <ActivityCard status="Pending" isSeeker={isSeeker} onView={() => openModal("Pending")} />;
            case "ongoing":
                return <ActivityCard status="In Progress" isSeeker={isSeeker} onView={() => openModal("In Progress")} />;
            case "completed":
                return <ActivityCard status="Done" isSeeker={isSeeker} onView={() => openModal("Done")} />;
            case "accepted":
                return <ActivityCard status="Accepted" isSeeker={isSeeker} onView={() => openModal("Accepted")} />;
            case "pending":
                return <ActivityCard status="Waiting" isSeeker={isSeeker} onView={() => openModal("Waiting")} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formCard}>
                <ServizoBackButton />

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require("../../assets/images/icon1.png")}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>

                    <View>
                        <Text style={styles.title}>My Activity</Text>
                        <Text style={styles.subtitle}>
                            Track your {isSeeker ? "service requests" : "job activities"}
                        </Text>
                    </View>
                </View>

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


                <View style={styles}>{renderContent()}</View>



                <Modal transparent animationType="slide" visible={showModal}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>

                            <View style={styles.modalTopBar}>

                            
                                <View style={styles.dragBar} />

                              
                                <TouchableOpacity
                                    style={styles.topIcon}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Image
                                        source={require("../../assets/images/icon1.png")}
                                        style={styles.topIconImg}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>

                          
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {selectedJob?.service} • {selectedJob?.jobType}
                                </Text>
                                <Text style={styles.modalPrice}>₹{selectedJob?.price}</Text>
                            </View>

                        
                            <View style={styles.divider} />

                         
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Job Details</Text>

                                <Text style={styles.modalText}>📍 {selectedJob?.location}</Text>
                                <Text style={styles.modalText}>📅 {selectedJob?.date}</Text>
                            </View>

                         
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Contact</Text>

                                <Text style={styles.modalText}>👤 {selectedJob?.userName}</Text>
                                <Text style={styles.modalText}>📞 {selectedJob?.phone}</Text>
                            </View>

                         
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Problem</Text>

                                <Text style={styles.modalText}>{selectedJob?.description}</Text>
                            </View>

                         
                            <View style={styles.statusBox}>
                                <Text style={styles.modalStatus}>
                                    Status: {selectedJob?.status}
                                </Text>
                            </View>

                         
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

const ActivityCard = ({ status, isSeeker, onView }) => {
    return (
        <View style={styles.card}>

            <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Plumbing • Repair</Text>
                <Text style={styles.price}>₹500</Text>
            </View>

            <Text style={styles.cardSub}>📍 Sector 15, Noida</Text>
            <Text style={styles.cardSub}>📅 29 Mar • 10:30 AM</Text>

            <View style={{ marginVertical: 10 }}>
                {isSeeker ? (
                    <>
                        <Text style={styles.userText}>👤 Provider Name</Text>
                        <Text style={styles.userSub}>🛠 Plumbing</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.userText}>👤 Customer Name</Text>
                        <Text style={styles.userSub}>📞 95XXXXXXX</Text>
                    </>
                )}
            </View>

            <View style={styles.rowBetween}>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>

                <TouchableOpacity onPress={onView}>
                    <Text style={styles.viewText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    icon: {
        width: 70,
        height: 70,
    },

    modalTopBar: {
        position: "relative",
        marginBottom: 5,
    },

    topIcon: {
        position: "absolute",
        right: 0,
        top: -10,
        backgroundColor: "#fff",
        padding: 6,
        borderRadius: 12,

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
    },

    topIconImg: {
        width: 40,
        height: 40,
    },

    dragBar: {
        width: 40,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 10,
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
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },

    modalHeader: {
        marginBottom: 10,
    },

    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 10,
    },

    section: {
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#999",
        marginBottom: 5,
    },

    statusBox: {
        marginTop: 15,
        padding: 10,
        backgroundColor: "#EEF4FF",
        borderRadius: 12,
        alignItems: "center",
    },

    formCard: {
        flex: 1,
        backgroundColor: COLORS.background2,
        borderRadius: 20,
        padding: 16,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },

    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginRight: 12,
    },

    tabBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#eee",
    },

    activeTab: {
        backgroundColor: COLORS.primary,
    },

    tabText: { fontSize: 13, color: "#333" },

    activeTabText: {
        color: "#fff",
        fontWeight: "600",
    },

    contentCard: {
        backgroundColor: COLORS.background2,
        borderRadius: 20,
        padding: 15,
        elevation: 3,
    },

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

    price: {
        fontWeight: "700",
        color: COLORS.primary,
    },

    cardTitle: { fontSize: 16, fontWeight: "600" },

    cardSub: {
        fontSize: 12,
        color: "#777",
        marginTop: 4,
    },

    userText: { fontWeight: "600" },
    userSub: { fontSize: 12, color: "#777" },

    statusBadge: {
        backgroundColor: "#EEF4FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },

    statusText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: "600",
    },

    viewText: {
        color: COLORS.primary,
        fontWeight: "600",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        width: "92%",
        backgroundColor: "#fff",
        borderRadius: 25,
        padding: 20,

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 8,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
    },

    modalPrice: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: "700",
    },

    modalText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
    },

    modalStatus: {
        fontWeight: "600",
        color: COLORS.primary,
    },

    closeBtn: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    closeText: {
        color: "#fff",
        fontWeight: "600",
    },
});