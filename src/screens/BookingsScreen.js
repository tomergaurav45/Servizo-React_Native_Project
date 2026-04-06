import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
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


const T = {
  bg: "#0f0f10",
  card: "#1a1a1c",
  cardBorder: "#2a2a2e",
  surface: "#222226",
  accent: "#f5c842",
  accentSoft: "rgba(245,200,66,0.12)",
  accentBorder: "rgba(245,200,66,0.25)",
  textPrimary: "#f2f0eb",
  textSecondary: "#8a8880",
  textMuted: "#555450",
  danger: "#ff6b6b",
  success: "#4ade80",
  info: "#60a5fa",
  warning: "#fb923c",
};

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: { color: T.warning, bg: "rgba(251,146,60,0.12)", label: "Pending" },
  "In Progress": { color: T.info, bg: "rgba(96,165,250,0.12)", label: "In Progress" },
  Done: { color: T.success, bg: "rgba(74,222,128,0.12)", label: "Completed" },
  Accepted: { color: T.accent, bg: T.accentSoft, label: "Accepted" },
  Waiting: { color: T.warning, bg: "rgba(251,146,60,0.12)", label: "Waiting" },
};

// ─── Seeker / Provider tabs ───────────────────────────────────────────────
const SEEKER_TABS = [
  { key: "requests", label: "Requests" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];
const PROVIDER_TABS = [
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
];

const TAB_STATUS = {
  requests: "Pending",
  ongoing: "In Progress",
  completed: "Done",
  accepted: "Accepted",
  pending: "Waiting",
};

// ─── Mock job data ──────────────────────────────────────────────────────────
const MOCK_JOB = (isSeeker, status) => ({
  service: "Plumbing",
  jobType: "Repair",
  price: 500,
  location: "Sector 15, Noida",
  date: "29 Mar • 10:30 AM",
  userName: isSeeker ? "Ramesh Kumar" : "Priya Sharma",
  phone: "9528588923",
  description: "Pipe leakage in kitchen sink area — water seeping under cabinet.",
  status,
});

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function BookingScreen() {
  const { user } = useAuth();
  const isSeeker = user?.role === "customer";
  const tabs = isSeeker ? SEEKER_TABS : PROVIDER_TABS;

  const [activeTab, setActiveTab] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setActiveTab(isSeeker ? "requests" : "accepted");
    }, [user])
  );

  const openModal = (status) => {
    setSelectedJob(MOCK_JOB(isSeeker, status));
    setShowModal(true);
  };

  const renderContent = () => {
    const status = TAB_STATUS[activeTab];
    if (!status) return null;
    return (
      <ActivityCard
        status={status}
        isSeeker={isSeeker}
        onView={() => openModal(status)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <ServizoBackButton />

        {/* Page header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageEyebrow}>
              {isSeeker ? "Customer" : "Provider"} Dashboard
            </Text>
            <Text style={styles.pageTitle}>My Activity</Text>
          </View>
          {/* Decorative badge */}
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeNum}>3</Text>
            <Text style={styles.headerBadgeLabel}>Active</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        <View style={styles.contentArea}>{renderContent()}</View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal transparent animationType="slide" visible={showModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Modal header */}
            <View style={styles.modalHead}>
              <View style={styles.modalHeadLeft}>
                <Text style={styles.modalService}>
                  {selectedJob?.service}
                </Text>
                <Text style={styles.modalJobType}>{selectedJob?.jobType}</Text>
              </View>
              <View style={styles.modalPriceBox}>
                <Text style={styles.modalPriceLabel}>Total</Text>
                <Text style={styles.modalPrice}>₹{selectedJob?.price}</Text>
              </View>
            </View>

            {/* Status pill */}
            {selectedJob?.status && (() => {
              const cfg = STATUS_CONFIG[selectedJob.status] || STATUS_CONFIG.Pending;
              return (
                <View style={[styles.statusPill, { backgroundColor: cfg.bg, borderColor: cfg.color + "40" }]}>
                  <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.statusPillText, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </View>
              );
            })()}

            <View style={styles.modalDivider} />

            {/* Info rows */}
            <InfoRow icon="📍" label="Location" value={selectedJob?.location} />
            <InfoRow icon="📅" label="Scheduled" value={selectedJob?.date} />

            <View style={styles.modalDivider} />

            <InfoRow
              icon="👤"
              label={isSeeker ? "Provider" : "Customer"}
              value={selectedJob?.userName}
            />
            <InfoRow icon="📞" label="Phone" value={selectedJob?.phone} />

            <View style={styles.modalDivider} />

            <View style={styles.problemBox}>
              <Text style={styles.problemLabel}>Problem Description</Text>
              <Text style={styles.problemText}>{selectedJob?.description}</Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
              {!isSeeker && selectedJob?.status === "Waiting" && (
                <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
                  <Text style={styles.acceptBtnText}>Accept Job</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Info Row ───────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// ─── Activity Card ──────────────────────────────────────────────────────────
const ActivityCard = ({ status, isSeeker, onView }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  return (
    <View style={styles.card}>
      {/* Card top stripe */}
      <View style={[styles.cardStripe, { backgroundColor: cfg.color }]} />

      {/* Title row */}
      <View style={styles.cardHead}>
        <View>
          <Text style={styles.cardService}>Plumbing</Text>
          <Text style={styles.cardType}>Repair Service</Text>
        </View>
        <View style={[styles.cardBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + "50" }]}>
          <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.cardBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      {/* Meta info */}
      <View style={styles.cardMeta}>
        <View style={styles.cardMetaItem}>
          <Text style={styles.cardMetaIcon}>📍</Text>
          <Text style={styles.cardMetaText}>Sector 15, Noida</Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Text style={styles.cardMetaIcon}>📅</Text>
          <Text style={styles.cardMetaText}>29 Mar • 10:30 AM</Text>
        </View>
      </View>
      {/* User info */}
      <View style={styles.cardUser}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {isSeeker ? "RK" : "PS"}
          </Text>
        </View>
        <View>
          <Text style={styles.userNameText}>
            {isSeeker ? "Ramesh Kumar" : "Priya Sharma"}
          </Text>
          <Text style={styles.userRoleText}>
            {isSeeker ? "🛠 Plumber" : "📞 95XXXXXXX"}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagLabel}>Amount</Text>
          <Text style={styles.priceTagValue}>₹500</Text>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={onView}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Page header
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 24,
  },
  pageEyebrow: {
    fontSize: 12,
    color: T.accent,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: T.textPrimary,
    letterSpacing: -0.8,
  },
  headerBadge: {
    backgroundColor: T.accentSoft,
    borderWidth: 0.5,
    borderColor: T.accentBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  headerBadgeNum: {
    fontSize: 20,
    fontWeight: "800",
    color: T.accent,
    lineHeight: 22,
  },
  headerBadgeLabel: {
    fontSize: 10,
    color: T.accent,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // Tabs
  tabScroll: { marginBottom: 20 },
  tabRow: { gap: 8, paddingRight: 20 },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: T.surface,
    borderWidth: 0.5,
    borderColor: T.cardBorder,
  },
  tabActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
  },
  tabText: {
    fontSize: 13,
    color: T.textSecondary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#0f0f10",
    fontWeight: "700",
  },

  contentArea: { gap: 14 },

  // Activity Card
  card: {
    backgroundColor: T.card,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: T.cardBorder,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardStripe: {
    height: 3,
    width: "100%",
    opacity: 0.85,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  cardService: {
    fontSize: 18,
    fontWeight: "700",
    color: T.textPrimary,
    letterSpacing: -0.3,
  },
  cardType: {
    fontSize: 12,
    color: T.textSecondary,
    marginTop: 2,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardDivider: {
    height: 0.5,
    backgroundColor: T.cardBorder,
    marginHorizontal: 16,
  },
  cardMeta: {
    padding: 14,
    gap: 6,
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardMetaIcon: { fontSize: 13 },
  cardMetaText: {
    fontSize: 13,
    color: T.textSecondary,
  },
  cardUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 0.5,
    borderColor: T.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: T.textSecondary,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: T.textPrimary,
  },
  userRoleText: {
    fontSize: 12,
    color: T.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: T.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceTag: {},
  priceTagLabel: {
    fontSize: 10,
    color: T.textMuted,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  priceTagValue: {
    fontSize: 18,
    fontWeight: "800",
    color: T.accent,
    letterSpacing: -0.3,
  },
  viewBtn: {
    backgroundColor: T.accentSoft,
    borderWidth: 0.5,
    borderColor: T.accentBorder,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  viewBtnText: {
    fontSize: 13,
    color: T.accent,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: T.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 0.5,
    borderColor: T.cardBorder,
    paddingBottom: 36,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: T.cardBorder,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalHeadLeft: {},
  modalService: {
    fontSize: 24,
    fontWeight: "800",
    color: T.textPrimary,
    letterSpacing: -0.5,
  },
  modalJobType: {
    fontSize: 13,
    color: T.textSecondary,
    marginTop: 3,
  },
  modalPriceBox: {
    alignItems: "flex-end",
  },
  modalPriceLabel: {
    fontSize: 10,
    color: T.textMuted,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: T.accent,
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalDivider: {
    height: 0.5,
    backgroundColor: T.cardBorder,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  infoIcon: { fontSize: 16, marginTop: 1 },
  infoText: {},
  infoLabel: {
    fontSize: 11,
    color: T.textMuted,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    color: T.textPrimary,
    fontWeight: "500",
    marginTop: 2,
  },
  problemBox: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: T.cardBorder,
  },
  problemLabel: {
    fontSize: 11,
    color: T.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  problemText: {
    fontSize: 14,
    color: T.textSecondary,
    lineHeight: 21,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: T.surface,
    borderWidth: 0.5,
    borderColor: T.cardBorder,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  closeBtnText: {
    color: T.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: T.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  acceptBtnText: {
    color: "#0f0f10",
    fontWeight: "700",
    fontSize: 15,
  },
});
