import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { acceptBooking, addReview, completeBooking, createNotification, getProviderRequests, getUserBookings } from "../apis/authApi";
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


const STATUS_CONFIG = {
  Pending: { color: T.warning, bg: "rgba(251,146,60,0.12)", label: "Pending" },
  "In Progress": { color: T.info, bg: "rgba(96,165,250,0.12)", label: "In Progress" },
  Done: { color: T.success, bg: "rgba(74,222,128,0.12)", label: "Completed" },
  Accepted: { color: T.accent, bg: T.accentSoft, label: "Accepted" },
  Waiting: { color: T.warning, bg: "rgba(251,146,60,0.12)", label: "Waiting" },
};


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


export default function BookingScreen() {
  const { user } = useAuth();
  const isSeeker = user?.role === "customer";
  const tabs = isSeeker ? SEEKER_TABS : PROVIDER_TABS;

  const [activeTab, setActiveTab] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useFocusEffect(
    useCallback(() => {
      setActiveTab(isSeeker ? "requests" : "pending");
    }, [user])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchJobs = async () => {
        setLoading(true);

        let res;

        if (isSeeker) {
          res = await getUserBookings(user?.userId); // 👤 CUSTOMER
        } else {
          res = await getProviderRequests(user?.userId); // 🛠 PROVIDER
        }

        if (res.success) {
          setJobs(res.data || []);
        } else {
          setJobs([]);
        }

        setLoading(false);
      };

      fetchJobs();


    }, [user])
  );

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const renderContent = () => {
    if (loading) return <Text style={{ color: "#fff" }}>Loading...</Text>;

    let filteredJobs = jobs;


    if (isSeeker) {
      if (activeTab === "requests") {
        filteredJobs = jobs.filter(j => j.status === "OPEN");
      }
      if (activeTab === "ongoing") {
        filteredJobs = jobs.filter(j => j.status === "ASSIGNED");
      }
      if (activeTab === "completed") {
        filteredJobs = jobs.filter(j => j.status === "COMPLETED");
      }
    }


    if (!isSeeker) {
      if (activeTab === "pending") {
        filteredJobs = jobs.filter(j => j.status === "OPEN");
      }
      if (activeTab === "accepted") {
        filteredJobs = jobs.filter(j => j.status === "ASSIGNED");
      }
      if (activeTab === "completed") {
        filteredJobs = jobs.filter(j => j.status === "COMPLETED");
      }
    }

    if (filteredJobs.length === 0) {
      return (
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
          No jobs available
        </Text>
      );
    }

    return filteredJobs.map((job, index) => (
      <ActivityCard
        key={index}
        job={job}
        isSeeker={isSeeker}
        onView={() => openModal(job)}
      />
    ));
  };

  const mapStatus = (status) => {
    if (status === "OPEN") return "Waiting";
    if (status === "ASSIGNED") return "Accepted";
    if (status === "COMPLETED") return "Done"; // ✅ ADD THIS
    return "Pending";
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <ServizoBackButton />


        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageEyebrow}>
              {isSeeker ? "Customer" : "Provider"} Dashboard
            </Text>
            <Text style={styles.pageTitle}>My Activity</Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeNum}>
              {jobs.length}
            </Text>
            <Text style={styles.headerBadgeLabel}>Active</Text>
          </View>
        </View>


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


        <View style={styles.contentArea}>{renderContent()}</View>
      </ScrollView>


      <Modal transparent animationType="slide" visible={showModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Modal header */}
            <View style={styles.modalHead}>
              <View style={styles.modalHeadLeft}>
                <Text style={styles.modalService}>
                  {selectedJob?.serviceName}
                </Text>
                <Text style={styles.modalJobType}>
                  {selectedJob?.subService}
                </Text>
              </View>
              <View style={styles.modalPriceBox}>
                <Text style={styles.modalPriceLabel}>Total</Text>
                <Text style={styles.modalPrice}>
                  ₹{selectedJob?.price || 0}
                </Text>
              </View>
            </View>

            {/* Status pill */}
            {selectedJob?.status && (() => {
              const cfg = STATUS_CONFIG[mapStatus(selectedJob?.status)];
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
            <View style={styles.modalDivider} />

            <InfoRow
              icon="📍"
              label="Location"
              value={selectedJob?.address?.fullAddress}
            />

            <InfoRow
              icon="📅"
              label="Date"
              value={new Date(selectedJob?.createdAt).toLocaleString()}
            />

            <InfoRow
              icon="👤"
              label={isSeeker ? "Provider" : "Customer"}
              value={
                isSeeker
                  ? selectedJob?.participants?.provider?.name || "Not Assigned"
                  : selectedJob?.participants?.user?.name
              }
            />

            <View style={styles.problemBox}>
              <Text style={styles.problemLabel}>Problem Description</Text>
              <Text style={styles.problemText}>{selectedJob?.description}</Text>
            </View>

            <InfoRow
              icon="📞"
              label="Contact"
              value={
                isSeeker
                  ? selectedJob?.participants?.provider?.phone || "Not Available"
                  : selectedJob?.participants?.user?.phone
              }
            />


            <View style={styles.modalActions}>
              {selectedJob?.status === "ASSIGNED" && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: "#60a5fa" }]}
                  onPress={() => {
                    setShowModal(false);

                    navigation.navigate("MessageScreen", {
                      user: isSeeker
                        ? selectedJob?.participants?.provider
                        : selectedJob?.participants?.user,
                      bookingId: selectedJob?.bookingId,
                    });
                  }}
                >
                  <Text style={styles.acceptBtnText}>Chat</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
              {!isSeeker && mapStatus(selectedJob?.status) === "Waiting" && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  activeOpacity={0.85}
                  onPress={async () => {
                    const acceptRes = await acceptBooking({
                      bookingId: selectedJob.bookingId,
                      providerId: user.userId,
                    });

                    if (acceptRes?.success) {
                      const providerName = user?.name || "Provider";
                      const providerPhone = user?.phone || "Not available";
                      const customerId = selectedJob?.participants?.user?.userId;

                      if (customerId) {
                        await createNotification({
                          userId: customerId,
                          type: "booking",
                          title: "Provider Accepted Your Request",
                          message: `${providerName} accepted your ${selectedJob?.serviceName || "service"} request. Contact: ${providerPhone}`,
                          bookingId: selectedJob.bookingId,
                          data: {
                            providerId: user.userId,
                            providerName,
                            providerPhone,
                            serviceName: selectedJob?.serviceName,
                            subService: selectedJob?.subService,
                            price: selectedJob?.price,
                          },
                        });
                      }
                    }

                    setShowModal(false);

                    let res;

                    if (isSeeker) {
                      res = await getUserBookings(user?.userId);
                    } else {
                      res = await getProviderRequests(user?.userId);
                    }

                    if (res.success) {
                      setJobs(res.data || []);
                    }
                  }}
                >
                  <Text style={styles.acceptBtnText}>Accept Job</Text>
                </TouchableOpacity>

              )}
              {!isSeeker && mapStatus(selectedJob?.status) === "Accepted" && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: "#4ade80" }]}
                  onPress={async () => {
                    await completeBooking({
                      bookingId: selectedJob.bookingId,
                      providerId: user.userId,
                    });

                    setShowModal(false);

                    let res;

                    if (isSeeker) {
                      res = await getUserBookings(user?.userId);
                    } else {
                      res = await getProviderRequests(user?.userId);
                    }

                    if (res.success) {
                      setJobs(res.data || []);
                    }
                  }}
                >
                  <Text style={styles.acceptBtnText}>Mark as Completed</Text>
                </TouchableOpacity>
              )}
              {isSeeker && mapStatus(selectedJob?.status) === "Done" && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: "#60a5fa" }]}
                  onPress={() => {
                    setShowModal(false);
                    setShowModal(false);
                    setShowReviewModal(true);
                  }}
                >
                  <Text style={styles.acceptBtnText}>Give Review</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </Modal>
      <Modal transparent animationType="fade" visible={showReviewModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { padding: 20 }]}>

            <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 15 }}>
              Rate Provider
            </Text>

            {/* ⭐ Stars */}
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={{ fontSize: 32 }}>
                    {star <= rating ? "⭐" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment */}
            <TextInput
              placeholder="Write your review..."
              placeholderTextColor="#aaa"
              value={comment}
              onChangeText={setComment}
              style={{
                borderWidth: 1,
                borderColor: "#333",
                padding: 10,
                borderRadius: 10,
                color: "#fff",
                marginBottom: 20,
              }}
            />

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: "#4ade80" }]}
                onPress={async () => {
                  await addReview({
                    bookingId: selectedJob.bookingId,
                    providerId: selectedJob.participants.provider.providerId,
                    userId: user.userId,
                    rating,
                    comment,
                  });

                  setShowReviewModal(false);
                  setRating(0);
                  setComment("");

                  alert("Review submitted ✅");
                }}
              >
                <Text style={styles.acceptBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);


const ActivityCard = ({ job, isSeeker, onView }) => {

  const mapStatus = (status) => {
    if (status === "OPEN") return "Waiting";
    if (status === "ASSIGNED") return "Accepted";
    if (status === "COMPLETED") return "Done";
    return "Pending";
  };

  const cfg = STATUS_CONFIG[mapStatus(job.status)];

  const user = job?.participants?.user;
  const provider = job?.participants?.provider;

  const name = isSeeker
    ? provider?.name
    : user?.name;

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "--";


  return (
    <View style={styles.card}>
      {/* Card top stripe */}
      <View style={[styles.cardStripe, { backgroundColor: cfg.color }]} />

      {/* Title row */}
      <View style={styles.cardHead}>
        <View>
          <Text style={styles.cardService}>{job.serviceName}</Text>
          <Text style={styles.cardType}>{job.subService}</Text>
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
          <Text style={styles.cardMetaText}>
            {job.address?.fullAddress}
          </Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Text style={styles.cardMetaIcon}>📅</Text>
          <Text style={styles.cardMetaText}>{new Date(job.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      {/* User info */}
      <View style={styles.cardUser}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {initials}
          </Text>
        </View>
        <View>
          <Text style={styles.userNameText}>
            {isSeeker
              ? provider?.name || "Not Assigned"
              : user?.name}
          </Text>

          <Text style={styles.userRoleText}>
            {isSeeker
              ? provider?.phone || "Waiting for provider"
              : user?.phone}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagLabel}>Amount</Text>
          <Text style={styles.priceTagValue}>
            ₹{(job.price || 0).toLocaleString()}
          </Text>
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


