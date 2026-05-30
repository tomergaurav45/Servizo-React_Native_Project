import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
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
import Toast from "react-native-toast-message";
import { acceptBooking, addReview, completeBooking, getProviderRequests, getUserBookings } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import { useAuth } from "../context/AuthContext";
import { useSocketEvents } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const getStatusConfig = (colors) => ({
  Pending: { color: colors.warning, bg: colors.warning + "1F", label: "Pending" },
  "In Progress": { color: colors.info, bg: colors.info + "1F", label: "In Progress" },
  Done: { color: colors.success, bg: colors.success + "1F", label: "Completed" },
  Accepted: { color: colors.accent, bg: colors.accent + "22", label: "Accepted" },
  Waiting: { color: colors.warning, bg: colors.warning + "1F", label: "Waiting" },
});


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

export default function BookingScreen() {
  const route = useRoute();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = theme.colors;
  const statusConfig = useMemo(() => getStatusConfig(colors), [colors]);
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
  const [actionLoading, setActionLoading] = useState(false);
  const requestedTab = route?.params?.initialTab;
  const statusFilter = route?.params?.statusFilter;

  useFocusEffect(
    useCallback(() => {
      const nextTab =
        requestedTab ||
        (statusFilter === "COMPLETED"
          ? "completed"
          : statusFilter === "OPEN"
            ? isSeeker ? "requests" : "pending"
            : isSeeker ? "requests" : "pending");

      setActiveTab(nextTab);
    }, [isSeeker, requestedTab, statusFilter])
  );

  const fetchJobs = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);

    const res = isSeeker
      ? await getUserBookings(user.userId)
      : await getProviderRequests(user.userId);

    if (res.success) {
      setJobs(res.data || []);
    } else {
      setJobs([]);
    }

    setLoading(false);
  }, [isSeeker, user?.userId]);

  useFocusEffect(
    useCallback(() => {
      const fetchJobs = async () => {
        setLoading(true);

        let res;

        if (isSeeker) {
          res = await getUserBookings(user?.userId);
        } else {
          res = await getProviderRequests(user?.userId);
        }

        if (res.success) {
          setJobs(res.data || []);
        } else {
          setJobs([]);
        }

        setLoading(false);
      };

      fetchJobs();


    }, [isSeeker, user])
  );

  useSocketEvents(
    [
      "bookingCreated",
      "booking:new",
      "newBooking",
      "bookingUpdated",
      "booking:update",
      "bookingAccepted",
      "bookingCompleted",
      "bookingStatusChanged",
      "notification",
      "newNotification",
    ],
    fetchJobs
  );

  const refreshJobs = useCallback(async () => {
    const res = isSeeker
      ? await getUserBookings(user?.userId)
      : await getProviderRequests(user?.userId);

    if (res.success) {
      setJobs(res.data || []);
    }
  }, [isSeeker, user?.userId]);

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const renderContent = () => {
    if (loading) return <Text style={{ color: colors.text }}>Loading...</Text>;

    const safeJobs = Array.isArray(jobs) ? jobs.filter(Boolean) : [];
    let filteredJobs = safeJobs;


    if (isSeeker) {
      if (activeTab === "requests") {
        filteredJobs = safeJobs.filter(j => j?.status === "OPEN");
      }
      if (activeTab === "ongoing") {
        filteredJobs = safeJobs.filter(
          j =>
            j?.status === "ASSIGNED" ||
            j?.status === "COMPLETION_REQUESTED"
        );
      }
      if (activeTab === "completed") {
        filteredJobs = safeJobs.filter(j => j?.status === "COMPLETED");
      }
    }


    if (!isSeeker) {
      if (activeTab === "pending") {
        filteredJobs = safeJobs.filter(j => j?.status === "OPEN");
      }
      if (activeTab === "accepted") {
        filteredJobs = safeJobs.filter(
          j =>
            j?.status === "ASSIGNED" ||
            j?.status === "COMPLETION_REQUESTED"
        );
      }
      if (activeTab === "completed") {
        filteredJobs = safeJobs.filter(j => j?.status === "COMPLETED");
      }
    }

    if (filteredJobs.length === 0) {
      return (
        <Text style={{ color: colors.text, textAlign: "center", marginTop: 20 }}>
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
        onViewProvider={(provider) => {
          navigation.navigate("ProviderDetailsScreen", {
            provider,
          });
        }}
        styles={styles}
        statusConfig={statusConfig}
      />
    ));
  };

  const mapStatus = (status) => {
    if (!status) return "Pending";

    if (status === "OPEN") return "Waiting";

    if (status === "ASSIGNED") return "Accepted";
    if (status === "COMPLETION_REQUESTED") return "In Progress";

    if (status === "COMPLETED") return "Done";

    return "Pending";
  };

  const selectedStatus = selectedJob?.status ? mapStatus(selectedJob.status) : null;

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


      <Modal transparent animationType="slide" visible={showModal && !!selectedJob}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
          
            <View style={styles.dragHandle} />

            
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

           
            {selectedJob?.status && (() => {
              const cfg = statusConfig[selectedStatus];
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
              styles={styles}
              icon="📍"
              label="Location"
              value={selectedJob?.address?.fullAddress}
            />

            <InfoRow
              styles={styles}
              icon="📅"
              label="Date"
              value={selectedJob?.createdAt ? new Date(selectedJob.createdAt).toLocaleString() : ""}
            />

            <InfoRow
              styles={styles}
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
              styles={styles}
              icon="📞"
              label="Contact"
              value={
                isSeeker
                  ? selectedJob?.participants?.provider?.phone || "Not Available"
                  : selectedJob?.status === "ASSIGNED" ||
                    selectedJob?.status === "COMPLETION_REQUESTED" ||
                    selectedJob?.status === "COMPLETED"
                    ? selectedJob?.participants?.user?.phone
                    : "Accept request to view contact"
              }
            />


            <View style={styles.modalActions}>
              {selectedJob?.status === "ASSIGNED" && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: colors.info }]}
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
              {!isSeeker && selectedStatus === "Waiting" && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                  onPress={async () => {
                    if (actionLoading) return;
                    setActionLoading(true);
                    const acceptRes = await acceptBooking({
                      bookingId: selectedJob.bookingId,
                      providerId: user.userId,
                    });

                    if (!acceptRes?.success) {
                      Toast.show({ type: "error", text1: acceptRes?.message || "Failed to accept job" });
                      setActionLoading(false);
                      return;
                    }

                    setShowModal(false);
                    await refreshJobs();
                    setActionLoading(false);
                  }}
                >
                  <Text style={styles.acceptBtnText}>{actionLoading ? "Please wait..." : "Accept Job"}</Text>
                </TouchableOpacity>

              )}
              {isSeeker &&
                selectedJob?.status === "COMPLETION_REQUESTED" && (
                  <TouchableOpacity
                    style={[
                      styles.acceptBtn,
                      actionLoading && styles.disabledBtn,
                      { backgroundColor: colors.success },
                    ]}
                    disabled={actionLoading}
                    onPress={async () => {
                      if (actionLoading) return;
                      setActionLoading(true);

                      const completeRes = await completeBooking({
                        bookingId: selectedJob.bookingId,
                        userId: user.userId,
                        action: "CONFIRM_COMPLETION",
                      });

                      if (!completeRes?.success) {
                        Toast.show({ type: "error", text1: completeRes?.message || "Failed" });
                        setActionLoading(false);
                        return;
                      }

                      setSelectedJob(completeRes.data);

                      setShowModal(false);

                      setShowReviewModal(true);
                      await refreshJobs();
                      setActionLoading(false);
                    }}
                  >
                    <Text style={styles.acceptBtnText}>
                      {actionLoading ? "Please wait..." : "Confirm Completion"}
                    </Text>
                  </TouchableOpacity>
                )}
              {!isSeeker && selectedJob?.status === "ASSIGNED" && (
                <TouchableOpacity
                  style={[styles.acceptBtn, actionLoading && styles.disabledBtn, { backgroundColor: colors.success }]}
                  disabled={actionLoading}
                  onPress={async () => {
                    if (actionLoading) return;
                    setActionLoading(true);
                    const completeRes = await completeBooking({
                      bookingId: selectedJob.bookingId,
                      providerId: user.userId,
                      action: "REQUEST_COMPLETION",
                    });

                    if (!completeRes?.success) {
                      Toast.show({ type: "error", text1: completeRes?.message || "Failed" });
                      setActionLoading(false);
                      return;
                    }

                    setSelectedJob(completeRes.data);

                    setShowModal(false);
                    await refreshJobs();
                    setActionLoading(false);
                  }}
                >
                  <Text style={styles.acceptBtnText}>
                    {actionLoading ? "Please wait..." : "Request Completion"}
                  </Text>
                </TouchableOpacity>
              )}
              {isSeeker && selectedStatus === "Done" && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: colors.info }]}
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

            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 15 }}>
              Rate Provider
            </Text>


            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={{ fontSize: 32 }}>
                    {star <= rating ? "⭐" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>


            <TextInput
              placeholder="Write your review..."
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                borderRadius: 10,
                color: colors.text,
                marginBottom: 20,
              }}
            />


            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, actionLoading && styles.disabledBtn, { backgroundColor: colors.success }]}
                disabled={actionLoading}
                onPress={async () => {
                  const providerId = selectedJob?.participants?.provider?.providerId;
                  if (!selectedJob?.bookingId || !providerId || actionLoading) return;

                  setActionLoading(true);
                  const res = await addReview({
                    bookingId: selectedJob.bookingId,
                    providerId,
                    userId: user.userId,
                    rating,
                    comment,
                  });

                  setActionLoading(false);

                  if (!res?.success) {
                    Toast.show({ type: "error", text1: res?.message || "Review submit failed" });
                    return;
                  }

                  setShowReviewModal(false);
                  setRating(0);
                  setComment("");

                  Toast.show({ type: "success", text1: "Review submitted" });
                }}
              >
                <Text style={styles.acceptBtnText}>{actionLoading ? "Submitting..." : "Submit"}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const InfoRow = ({ icon, label, value, styles }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);


const ActivityCard = ({
  job,
  isSeeker,
  onView,
  onViewProvider,
  styles,
  statusConfig,
}) => {
  if (!job) return null;

  const mapStatus = (status) => {
    if (status === "OPEN") return "Waiting";
    if (status === "ASSIGNED") return "Accepted";
    if (status === "COMPLETION_REQUESTED") return "In Progress";
    if (status === "COMPLETED") return "Done";
    return "Pending";
  };

  const cfg = statusConfig[mapStatus(job?.status)] || statusConfig.Pending;

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
        <View style={styles.cardTitleCol}>
          <Text style={styles.cardService} numberOfLines={2}>{job?.serviceName}</Text>
          <Text style={styles.cardType}>{job?.subService}</Text>
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
            {job?.address?.fullAddress}
          </Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Text style={styles.cardMetaIcon}>📅</Text>
          <Text style={styles.cardMetaText}>
            {job?.createdAt ? new Date(job.createdAt).toLocaleString() : ""}
          </Text>
        </View>
      </View>

      <View style={styles.cardUser}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {initials}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            disabled={!isSeeker || !provider?.providerId}
            onPress={() => {
              onViewProvider?.(provider);
            }}
          >
            <Text style={styles.userNameText}>
              {isSeeker
                ? provider?.name || "Not Assigned"
                : user?.name}
            </Text>
          </TouchableOpacity>

          <Text style={styles.userRoleText}>
            {isSeeker
              ? provider?.phone || "Waiting for provider"
              : ["ASSIGNED", "COMPLETION_REQUESTED", "COMPLETED"].includes(job?.status)
                ? user?.phone
                : "Accept request to view contact"}
          </Text>
        </View>
      </View>


      <View style={styles.cardFooter}>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagLabel}>Amount</Text>
          <Text style={styles.priceTagValue}>
            ₹{(job?.price || 0).toLocaleString()}
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


const createStyles = (theme) => {
  const c = theme.colors;
  const modalOverlay = c.bg + "B3";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: { flex: 1 },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },


    pageHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 16,
      marginBottom: 24,
    },
    pageEyebrow: {
      fontSize: 12,
      color: c.accent,
      fontWeight: "600",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    pageTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: c.text,
      letterSpacing: -0.8,
    },
    headerBadge: {
      backgroundColor: c.accent + "22",
      borderWidth: 0.5,
      borderColor: c.accent + "40",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: "center",
    },
    headerBadgeNum: {
      fontSize: 20,
      fontWeight: "800",
      color: c.accent,
      lineHeight: 22,
    },
    headerBadgeLabel: {
      fontSize: 10,
      color: c.accent,
      fontWeight: "500",
      letterSpacing: 0.5,
    },

    tabScroll: { marginBottom: 20 },
    tabRow: { gap: 8, paddingRight: 20 },
    tab: {
      paddingVertical: 9,
      paddingHorizontal: 18,
      borderRadius: 24,
      backgroundColor: c.surfaceAlt,
      borderWidth: 0.5,
      borderColor: c.border,
    },
    tabActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    tabText: {
      fontSize: 13,
      color: c.textMuted,
      fontWeight: "500",
    },
    tabTextActive: {
      color: c.bg,
      fontWeight: "700",
    },

    contentArea: { gap: 14 },


    card: {
      backgroundColor: c.surface,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: c.border,
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
      gap: 10,
      padding: 16,
      paddingBottom: 12,
    },
    cardTitleCol: {
      flex: 1,
      minWidth: 0,
    },
    cardService: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
      letterSpacing: -0.3,
    },
    cardType: {
      fontSize: 12,
      color: c.textMuted,
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
      flexShrink: 0,
      maxWidth: 132,
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
      backgroundColor: c.border,
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
      color: c.textMuted,
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
      backgroundColor: c.surfaceAlt,
      borderWidth: 0.5,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    userAvatarText: {
      fontSize: 12,
      fontWeight: "700",
      color: c.textMuted,
    },
    userNameText: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
    userRoleText: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    priceTag: {},
    priceTagLabel: {
      fontSize: 10,
      color: c.textMuted,
      fontWeight: "500",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    priceTagValue: {
      fontSize: 18,
      fontWeight: "800",
      color: c.accent,
      letterSpacing: -0.3,
    },
    viewBtn: {
      backgroundColor: c.accent + "22",
      borderWidth: 0.5,
      borderColor: c.accent + "40",
      paddingVertical: 9,
      paddingHorizontal: 18,
      borderRadius: 12,
    },
    viewBtnText: {
      fontSize: 13,
      color: c.accent,
      fontWeight: "600",
    },


    modalOverlay: {
      flex: 1,
      backgroundColor: modalOverlay,
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      borderTopWidth: 0.5,
      borderColor: c.border,
      paddingBottom: 36,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: c.border,
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
      color: c.text,
      letterSpacing: -0.5,
    },
    modalJobType: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 3,
    },
    modalPriceBox: {
      alignItems: "flex-end",
    },
    modalPriceLabel: {
      fontSize: 10,
      color: c.textMuted,
      fontWeight: "500",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    modalPrice: {
      fontSize: 22,
      fontWeight: "800",
      color: c.accent,
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
      backgroundColor: c.border,
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
      color: c.textMuted,
      fontWeight: "500",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 14,
      color: c.text,
      fontWeight: "500",
      marginTop: 2,
    },
    problemBox: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 14,
      padding: 14,
      borderWidth: 0.5,
      borderColor: c.border,
    },
    problemLabel: {
      fontSize: 11,
      color: c.textMuted,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    problemText: {
      fontSize: 14,
      color: c.textMuted,
      lineHeight: 21,
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    closeBtn: {
      flex: 1,
      backgroundColor: c.surfaceAlt,
      borderWidth: 0.5,
      borderColor: c.border,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
    },
    closeBtnText: {
      color: c.textMuted,
      fontWeight: "600",
      fontSize: 15,
    },
    acceptBtn: {
      flex: 1,
      backgroundColor: c.accent,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    acceptBtnText: {
      color: c.bg,
      fontWeight: "700",
      fontSize: 13,
    },
    disabledBtn: {
      opacity: 0.65,
    },
  });
};


