import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { createIssue } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const HelpSupportScreen = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How to book a service?",
      answer: "Go to home → select service → choose provider → confirm booking.",
    },
    {
      question: "How to cancel a request?",
      answer: "Go to My Activity → open your request → click cancel.",
    },
    {
      question: "How to contact provider?",
      answer: "Open your booking → use call or chat option.",
    },
  ];

  const filteredFaqs = faqs.filter(item =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  const { user } = useAuth();


  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required to access gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueType || !subject || !description) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        userId: user?.userId, // fallback for testing
        issueType,
        subject,
        description,
        url: image || "", // from image picker
      };

      const res = await createIssue(payload);

      console.log("Issue Created:", res);

      Toast.show({
        type: "success",
        text1: "Issue Submitted",
        text2: "Our team will resolve it soon 🚀",
      });

      // reset form
      setIssueType("");
      setSubject("");
      setDescription("");
      setImage(null);

      setShowModal(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error.message || "Something went wrong",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.subtitle}>How can we assist you today?</Text>
          </View>
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#777" />
          <TextInput
            placeholder="Search your problem..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>


          <Text style={styles.sectionTitle}>FAQs</Text>

          {filteredFaqs.map((item, index) => (
            <View key={index} style={styles.faqContainer}>

              <TouchableOpacity
                style={styles.faqItem}
                onPress={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <Text style={styles.faqText}>{item.question}</Text>
                <Ionicons
                  name={openIndex === index ? "chevron-up" : "chevron-forward"}
                  size={16}
                  color="#999"
                />
              </TouchableOpacity>

              {openIndex === index && (
                <View style={styles.faqAnswerBox}>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              )}

            </View>
          ))}

          {filteredFaqs.length === 0 && (
            <Text style={{ textAlign: "center", color: "#999", marginTop: 10 }}>
              No results found
            </Text>
          )}

          {/* CONTACT SUPPORT */}
          <Text style={styles.sectionTitle}>Contact Support</Text>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => Linking.openURL("mailto:support@servizo.com")}
          >
            <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            <Text style={styles.optionText}>Email Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => Linking.openURL("tel:1234567890")}
          >
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <Text style={styles.optionText}>Call Support</Text>
          </TouchableOpacity>

          {/* REPORT ISSUE */}
          <Text style={styles.sectionTitle}>Report Issue</Text>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setModalType("issue");
              setShowModal(true);
            }}
          >
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.optionText}>Submit Issue Form</Text>
          </TouchableOpacity>

          {/* APP INFO */}
          <Text style={styles.sectionTitle}>App Info</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoText}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setModalType("terms");
              setShowModal(true);
            }}
          >
            <Text style={styles.optionText}>TERMS & CONDITIONS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setModalType("privacy");
              setShowModal(true);
            }}
          >
            <Text style={styles.optionText}>PRIVACY POLICY</Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal transparent animationType="slide" visible={showModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>

              {/* Top Bar */}
              <View style={styles.modalTopBar}>

                <View style={styles.dragBar} />

                {/* Servizo Floating Icon */}
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

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalType === "terms"
                    ? "Terms & Conditions"
                    : modalType === "privacy"
                      ? "Privacy Policy"
                      : "Report an Issue"}
                </Text>

                <Text style={styles.modalSub}>
                  Powered by <Text style={{ color: COLORS.primary, fontWeight: "700" }}>Servizo</Text>
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {modalType === "terms" ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Agreement</Text>

                    <Text style={styles.modalText}>
                      • Provide accurate information during registration{"\n"}
                      • Use the app only for lawful purposes{"\n"}
                      • Do not misuse or harm the platform
                    </Text>

                    <Text style={styles.sectionTitle}>Platform Role</Text>
                    <Text style={styles.modalText}>
                      Servizo acts as a bridge between users and service providers. We are not responsible for disputes or service quality.
                    </Text>

                    <Text style={styles.sectionTitle}>Policy Updates</Text>
                    <Text style={styles.modalText}>
                      We may suspend accounts for violations and update terms anytime.
                    </Text>

                    <Text style={styles.sectionTitle}>Contact</Text>
                    <Text style={styles.modalText}>support@servizo.com</Text>
                  </View>
                ) : modalType === "privacy" ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Collection</Text>

                    <Text style={styles.modalText}>
                      We collect name, phone, email, and location to provide services.
                    </Text>

                    <Text style={styles.sectionTitle}>Usage</Text>
                    <Text style={styles.modalText}>
                      • Connect users with providers{"\n"}
                      • Improve app experience
                    </Text>

                    <Text style={styles.sectionTitle}>Privacy</Text>
                    <Text style={styles.modalText}>
                      We do not sell your data. Limited info may be shared to fulfill services.
                    </Text>

                    <Text style={styles.sectionTitle}>Control</Text>
                    <Text style={styles.modalText}>
                      You can update or delete your account anytime.
                    </Text>

                    <Text style={styles.sectionTitle}>Contact</Text>
                    <Text style={styles.modalText}>support@servizo.com</Text>
                  </View>
                ) : (

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Issue Type</Text>
                    <TextInput
                      placeholder="e.g. Payment Issue"
                      value={issueType}
                      onChangeText={setIssueType}
                      style={styles.input}
                    />

                    <Text style={styles.sectionTitle}>Subject</Text>
                    <TextInput
                      placeholder="Enter subject"
                      value={subject}
                      onChangeText={setSubject}
                      style={styles.input}
                    />

                    <Text style={styles.sectionTitle}>Description</Text>
                    <TextInput
                      placeholder="Describe your issue..."
                      value={description}
                      onChangeText={setDescription}
                      style={[styles.input, { height: 100 }]}
                      multiline
                    />
                    <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                      <Ionicons name="image-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.uploadText}>
                        {image ? "Change Screenshot" : "Upload Screenshot"}
                      </Text>
                    </TouchableOpacity>

                    {image && (
                      <Image
                        source={{ uri: image }}
                        style={styles.previewImage}
                      />
                    )}

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitIssue}>
                      <Text style={styles.submitText}>Submit Issue</Text>
                    </TouchableOpacity>
                  </View>
                )
                }
              </ScrollView>

              {/* Close Button */}
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
};



export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
  },

  iconContainer: {
    // backgroundColor: "#EEF4FF",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTopBar: {
    position: "relative",
    marginBottom: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  faqContainer: {
    marginBottom: 8,
  },

  faqAnswerBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },

  faqAnswer: {
    fontSize: 13,
    color: "#555",
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




  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
  },
  icon: {
    width: 70,
    height: 70
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginTop: 15,
    marginBottom: 8,
  },

  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
  },

  faqText: {
    fontSize: 14,
  },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  uploadText: {
    color: COLORS.primary,
    fontWeight: "500",
  },

  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },

  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    elevation: 2,
    gap: 10,
  },

  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },

  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  infoText: {
    color: "#777",
  },

  infoValue: {
    fontWeight: "600",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  formCard: {
    flex: 1,
    backgroundColor: COLORS.background2,
    borderRadius: 20,
    padding: 15,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  dragBar: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontWeight: "600",
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

  modalHeader: {
    marginBottom: 10,
  },

  modalSub: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
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
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  submitBtn: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
});