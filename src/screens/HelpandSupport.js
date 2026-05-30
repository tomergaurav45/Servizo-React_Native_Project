import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { createIssue } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import { useAuth } from "../context/AuthContext";


const C = {
  bg: "#F7F5F0",
  card: "#FFFFFF",
  primary: "#1C1A17",
  accent: "#C4AA7A",
  muted: "#A89F8E",
  subtext: "#7A7263",
  body: "#5A5449",
  border: "#EAE7E0",
  pill: "#F0EDE7",
  inputBg: "#F7F5F0",
  danger: "#E53935",
  dangerLight: "#FFF0F0",
  success: "#0F6E56",
  successLight: "#E1F5EE",
};


function SectionLabel({ icon, label }) {
  return (
    <View style={styles.sectionLabel}>
      {icon && <Ionicons name={icon} size={13} color={C.muted} />}
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}


function FaqItem({ item, open, onToggle }) {
  return (
    <View style={styles.faqWrap}>
      <TouchableOpacity style={styles.faqRow} onPress={onToggle} activeOpacity={0.8}>
        <Ionicons
          name="help-circle-outline"
          size={16}
          color={open ? C.primary : C.muted}
        />
        <Text style={[styles.faqQuestion, open && { color: C.primary }]}>
          {item.question}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={C.muted}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}


function OptionRow({ icon, label, onPress, accent }) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} activeOpacity={0.8}>
      {icon && (
        <View style={[styles.optionIcon, accent && { backgroundColor: accent + "22" }]}>
          <Ionicons name={icon} size={16} color={accent || C.primary} />
        </View>
      )}
      <Text style={styles.optionText}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={C.muted} />
    </TouchableOpacity>
  );
}


function IssueForm({ issueType, setIssueType, subject, setSubject,
  description, setDescription, image, pickImage, onSubmit, submitting }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>Issue type</Text>
        <TextInput
          placeholder="e.g. Payment Issue"
          placeholderTextColor={C.muted}
          value={issueType}
          onChangeText={setIssueType}
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>Subject</Text>
        <TextInput
          placeholder="Brief subject line"
          placeholderTextColor={C.muted}
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          placeholder="Describe your issue in detail..."
          placeholderTextColor={C.muted}
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.inputMulti]}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Ionicons name="image-outline" size={16} color={C.primary} />
        <Text style={styles.uploadText}>
          {image ? "Change screenshot" : "Attach screenshot"}
        </Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.previewImg} />
      )}

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.disabledBtn]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="send-outline" size={15} color="#fff" />
            <Text style={styles.submitBtnText}>Submit Issue</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}


function PolicyContent({ type }) {
  const terms = [
    { heading: "Agreement", body: "Provide accurate information during registration. Use the app only for lawful purposes. Do not misuse or harm the platform." },
    { heading: "Platform role", body: "Servizo acts as a bridge between users and service providers. We are not responsible for disputes or service quality." },
    { heading: "Policy updates", body: "We may suspend accounts for violations and update terms anytime." },
    { heading: "Contact", body: "support@servizo.com" },
  ];
  const privacy = [
    { heading: "Data collection", body: "We collect name, phone, email, and location to provide services." },
    { heading: "Usage", body: "Data is used to connect users with providers and improve app experience." },
    { heading: "Privacy", body: "We do not sell your data. Limited info may be shared to fulfill services." },
    { heading: "Control", body: "You can update or delete your account anytime." },
    { heading: "Contact", body: "support@servizo.com" },
  ];
  const items = type === "terms" ? terms : privacy;
  return (
    <View style={{ gap: 14 }}>
      {items.map((item, i) => (
        <View key={i}>
          <Text style={styles.policyHeading}>{item.heading}</Text>
          <Text style={styles.policyBody}>{item.body}</Text>
        </View>
      ))}
    </View>
  );
}


function BottomModal({ visible, onClose, type, issueProps }) {
  const titles = {
    issue: "Report an issue",
    terms: "Terms & conditions",
    privacy: "Privacy policy",
  };
  const icons = {
    issue: { name: "alert-circle-outline", bg: "#FAECE7", color: "#993C1D" },
    terms: { name: "document-text-outline", bg: "#EEEDFE", color: "#534AB7" },
    privacy: { name: "shield-outline", bg: C.successLight, color: C.success },
  };
  const ico = icons[type] || icons.issue;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeaderRow}>
            <View style={[styles.modalHeaderIcon, { backgroundColor: ico.bg }]}>
              <Ionicons name={ico.name} size={20} color={ico.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{titles[type]}</Text>
              <Text style={styles.modalSub}>
                Powered by <Text style={{ color: C.primary, fontWeight: "600" }}>Servizo</Text>
              </Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {type === "issue" ? (
              <IssueForm {...issueProps} />
            ) : (
              <PolicyContent type={type} />
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}


const FAQS = [
  { question: "How to book a service?", answer: "Go to home → select service → choose provider → confirm booking." },
  { question: "How to cancel a request?", answer: "Go to My Activity → open your request → click cancel." },
  { question: "How to contact provider?", answer: "Open your booking → use call or chat option." },
];

const PROVIDER_FAQS = [
  { question: "How do I receive jobs?", answer: "Complete your profile, add skills, set a default address, and switch your status online from Home." },
  { question: "How do I accept a request?", answer: "Open Bookings, go to Pending, view a request, and tap Accept Job." },
  { question: "How do I request completion?", answer: "Open an accepted job in Bookings and tap Request Completion after finishing the service." },
];

const HelpSupportScreen = () => {
  const { user } = useAuth();
  const isProvider = user?.role === "provider";
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const filtered = (isProvider ? PROVIDER_FAQS : FAQS).filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (type) => { setModalType(type); setShowModal(true); };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { alert("Permission required to access gallery"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmitIssue = async () => {
    if (submittingIssue) return;

    if (!issueType || !subject || !description) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill all fields" });
      return;
    }
    try {
      setSubmittingIssue(true);
      await createIssue({ userId: user?.userId, issueType, subject, description, url: image || "" });
      Toast.show({ type: "success", text1: "Issue Submitted", text2: "Our team will resolve it soon" });
      setIssueType(""); setSubject(""); setDescription(""); setImage(null);
      setShowModal(false);
    } catch (e) {
      Toast.show({ type: "error", text1: "Submission Failed", text2: e.message || "Something went wrong" });
    } finally {
      setSubmittingIssue(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.topBar}>
        <ServizoBackButton />
      </View>


      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="headset-outline" size={26} color="#185FA5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>Support</Text>
          <Text style={styles.heroTitle}>
            Help &{" "}
            <Text style={styles.heroTitleItalic}>Support</Text>
          </Text>
          <Text style={styles.heroSub}>
            {isProvider ? "Support for jobs, earnings, and requests." : "How can we assist you today?"}
          </Text>
        </View>
      </View>


      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={C.muted} />
        <TextInput
          placeholder="Search your problem..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        <SectionLabel icon="help-circle-outline" label="Frequently asked questions" />
        <View style={styles.card}>
          {filtered.length > 0 ? filtered.map((item, i) => (
            <View key={i}>
              <FaqItem
                item={item}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
              {i < filtered.length - 1 && <View style={styles.itemDivider} />}
            </View>
          )) : (
            <Text style={styles.emptyText}>No results found</Text>
          )}
        </View>


        <SectionLabel icon="call-outline" label="Contact support" />
        <View style={styles.card}>
          <OptionRow
            icon="mail-outline"
            label="Email support"
            accent="#185FA5"
            onPress={() => Linking.openURL("mailto:support@servizo.com")}
          />
          <View style={styles.itemDivider} />
          <OptionRow
            icon="call-outline"
            label="Call support"
            accent="#0F6E56"
            onPress={() => Linking.openURL("tel:1234567890")}
          />
        </View>


        <SectionLabel icon="alert-circle-outline" label="Report an issue" />
        <View style={styles.card}>
          <OptionRow
            icon="bug-outline"
            label="Submit issue form"
            accent="#993C1D"
            onPress={() => openModal("issue")}
          />
        </View>


        <SectionLabel icon="information-circle-outline" label="App info" />
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
          <View style={styles.itemDivider} />
          <OptionRow
            icon="document-text-outline"
            label="Terms & conditions"
            accent="#534AB7"
            onPress={() => openModal("terms")}
          />
          <View style={styles.itemDivider} />
          <OptionRow
            icon="shield-outline"
            label="Privacy policy"
            accent={C.success}
            onPress={() => openModal("privacy")}
          />
        </View>
      </ScrollView>

      <BottomModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        issueProps={{ issueType, setIssueType, subject, setSubject, description, setDescription, image, pickImage, onSubmit: handleSubmitIssue, submitting: submittingIssue }}
      />
    </SafeAreaView>
  );
};

export default HelpSupportScreen;


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 8 },


  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#E6F1FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: C.primary,
    lineHeight: 32,
  },
  heroTitleItalic: {
    fontStyle: "italic",
    fontWeight: "400",
    color: "#6B5E3F",
  },
  heroSub: { fontSize: 13, color: C.subtext, marginTop: 2 },


  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.primary,
  },


  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },


  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.muted,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },

  itemDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },


  faqWrap: {},
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    color: C.body,
    fontWeight: "400",
  },
  faqAnswer: {
    backgroundColor: C.bg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  faqAnswerText: { fontSize: 13, color: C.subtext, lineHeight: 19 },
  emptyText: { textAlign: "center", color: C.muted, padding: 20, fontSize: 13 },


  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: { flex: 1, fontSize: 14, color: C.primary, fontWeight: "400" },


  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  infoLabel: { fontSize: 14, color: C.body },
  versionPill: {
    backgroundColor: C.pill,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  versionText: { fontSize: 12, color: C.subtext, fontWeight: "500" },


  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28,26,23,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "82%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0DDD6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  modalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalTitle: { fontSize: 18, fontWeight: "500", color: C.primary },
  modalSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  modalDivider: { height: 1, backgroundColor: C.border, marginBottom: 16 },


  policyHeading: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 4,
  },
  policyBody: { fontSize: 14, color: C.body, lineHeight: 21 },


  inputWrap: { gap: 5 },
  inputLabel: { fontSize: 11, fontWeight: "500", letterSpacing: 0.6, textTransform: "uppercase", color: C.muted },
  input: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
    fontSize: 14,
    color: C.primary,
  },
  inputMulti: { height: 100 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 13,
  },
  uploadText: { fontSize: 13, color: C.primary, fontWeight: "500" },
  previewImg: { width: "100%", height: 150, borderRadius: 12 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  disabledBtn: { opacity: 0.65 },


  closeBtn: {
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  closeBtnText: { color: C.body, fontSize: 14 },
});
