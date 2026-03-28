import { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ServizoBackButton />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Activity</Text>
          <Text style={styles.subtitle}>
            Track your {isSeeker ? "service requests" : "job activities"}
          </Text>
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

       
        <View style={styles.contentCard}>{renderContent()}</View>
      </ScrollView>

     
      <Modal transparent animationType="slide" visible={showModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              {selectedJob?.service} • {selectedJob?.jobType}
            </Text>

            <Text style={styles.modalPrice}>₹{selectedJob?.price}</Text>

            <Text style={styles.modalText}>📍 {selectedJob?.location}</Text>
            <Text style={styles.modalText}>📅 {selectedJob?.date}</Text>

            <Text style={styles.modalText}>👤 {selectedJob?.userName}</Text>
            <Text style={styles.modalText}>📞 {selectedJob?.phone}</Text>

            <Text style={styles.modalText}>🛠 {selectedJob?.description}</Text>

            <Text style={styles.modalStatus}>
              Status: {selectedJob?.status}
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
  container: { padding: 20, paddingBottom: 60 },

  header: { marginBottom: 20 },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  tabContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
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
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalPrice: {
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 13,
    marginBottom: 6,
    color: "#555",
  },

  modalStatus: {
    marginTop: 10,
    fontWeight: "600",
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