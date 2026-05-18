import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { registerUser } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoDatePicker from "../components/ServizoDatePicker";
import ServizoDropdown from "../components/ServizoDropdown";
import ServizoInput from "../components/ServizoInput";
import ServizoMultiSelectDropdown from "../components/ServizoMultiSelectDropdown";
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
  danger: "#E53935",
  dangerLight: "#FFF0F0",
  pill: "#F5F3EE",
  sectionBg: "#F0EDE7",
};


function SectionLabel({ icon, label }) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons name={icon} size={14} color={C.muted} />
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}


function FieldError({ error }) {
  if (!error) return null;
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle-outline" size={12} color={C.danger} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}


function RoleChangeModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalIconWrap}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#534AB7" />
          </View>
          <Text style={styles.modalTitle}>Change Role?</Text>
          <Text style={styles.modalBody}>
            Switching your role will reset your professional information. Are you sure?
          </Text>
          <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm}>
            <Text style={styles.btnConfirmText}>Yes, change it</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
            <Text style={styles.btnCancelText}>Keep current role</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}


function AvatarCircle({ firstName, lastName }) {
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}


export default function EditProfileScreen() {
  const { user, login } = useAuth();
  const navigation = useNavigation();

  const nameParts = user?.name?.split(" ") || [];
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [role, setRole] = useState(user?.role || "");
  const [roleEditable, setRoleEditable] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [dob, setDob] = useState(user?.dob || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [experience, setExperience] = useState(user?.experience || "");
  const [availability, setAvailability] = useState(user?.availability || "");

  const [phoneError, setPhoneError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [dobError, setDobError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    if (role !== "provider") {
      setSkills([]);
      setExperience("");
      setAvailability("");
    }
  }, [role]);

  useEffect(() => {
    if (!phone) setPhoneError("Phone number is missing");
    if (!gender) setGenderError("Gender is missing");
    if (!dob) setDobError("Date of Birth is missing");
    if (!skills || skills.length === 0) setSkillsError("Skills are missing");
    if (!experience) setExperienceError("Experience is missing");
    if (!availability) setAvailabilityError("Availability is missing");
  }, []);

  const handlePhoneChange = (value) => {
    const numeric = value.replace(/[^0-9]/g, "");
    if (numeric.length <= 10) setPhone(numeric);
    setPhoneError(
      numeric.length === 10 ? "" : "Phone number must be exactly 10 digits"
    );
  };

  const handleSaveChanges = async () => {
    if (!phone || phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }
    if (!gender) { setGenderError("Gender is missing"); return; }
    if (!dob) { setDobError("Date of Birth is missing"); return; }

    if (role === "provider") {
      if (!skills || skills.length === 0) { setSkillsError("Skills are missing"); return; }
      if (!experience) { setExperienceError("Experience is missing"); return; }
      if (!availability) { setAvailabilityError("Availability is missing"); return; }
    }

    try {
      const result = await registerUser({
        userId: user?.userId,
        firstName, lastName, role, dob, phone, gender,
        skills, experience, availability,
      });

      if (!result.success) {
        Toast.show({ type: "error", text1: "Update Failed", text2: result.message });
        return;
      }

      Toast.show({ type: "success", text1: "Profile Updated", text2: "Your details were saved" });
      login({ ...user, name: `${firstName} ${lastName}`, role, phone, gender, skills, experience, availability, dob });
      navigation.goBack();
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.topBar}>
          <ServizoBackButton />
        </View>


        <View style={styles.hero}>
          <AvatarCircle firstName={firstName} lastName={lastName} />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Account</Text>
            <Text style={styles.heroTitle}>
              Edit{" "}
              <Text style={styles.heroTitleItalic}>Profile</Text>
            </Text>
            <Text style={styles.heroSub}>Update your personal details</Text>
          </View>
        </View>

        <View style={styles.divider} />


        <View style={styles.card}>
          <SectionLabel icon="person-outline" label="Personal information" />

          <ServizoInput
            label="First Name"
            placeholder="Enter first name"
            icon="person-outline"
            value={firstName}
            onChangeText={setFirstName}
          />

          <ServizoInput
            label="Last Name"
            placeholder="Enter last name"
            icon="person-outline"
            value={lastName}
            onChangeText={setLastName}
          />

          <ServizoDatePicker
            label="Date of Birth"
            value={dob}
            onChange={(v) => { setDob(v); setDobError(""); }}
          />
          <FieldError error={dobError} />

          <ServizoInput
            label="Phone Number"
            placeholder="10-digit mobile number"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
          />
          <FieldError error={phoneError} />

          <ServizoDropdown
            label="Gender"
            icon="male-female-outline"
            data={["Male", "Female", "Other"]}
            value={gender}
            placeholder="Select Gender"
            onSelect={(v) => { setGender(v); setGenderError(""); }}
          />
          <FieldError error={genderError} />
        </View>


        <View style={[styles.card, { marginTop: 12 }]}>
          <SectionLabel icon="briefcase-outline" label="Professional information" />


          {roleEditable ? (
            <ServizoDropdown
              label="Role"
              icon="briefcase-outline"
              value={role}
              data={["provider", "customer"]}
              onSelect={setRole}
            />
          ) : (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowRoleModal(true)}>
              <View pointerEvents="none">
                <ServizoDropdown
                  label="Role"
                  icon="briefcase-outline"
                  value={role}
                  data={["provider", "customer"]}
                />
              </View>
              <View style={styles.roleLockBadge}>
                <Ionicons name="lock-closed-outline" size={11} color={C.muted} />
                <Text style={styles.roleLockText}>Tap to change</Text>
              </View>
            </TouchableOpacity>
          )}

          {role === "provider" && (
            <>
              <View style={styles.providerDivider} />

              <ServizoMultiSelectDropdown
                label="Skills"
                icon="build-outline"
                data={[
                  "Plumber",
                  "Electrician",
                  "Cleaner",
                  "AC Technician",
                  "Painter",
                  "Carpenter",
                  "Appliance Repair Technician",
                  "Mobile Repair Technician",
                  "CCTV Technician",
                  "Network Technician",
                  "Beautician",
                  "Hair Stylist",
                  "Makeup Artist",
                  "Massage Therapist",
                  "Nail Technician",
                  "Tutor",
                  "Music Teacher",
                  "Fitness Trainer",
                  "Yoga Instructor",
                  "Delivery Executive",
                  "Packers & Movers",
                  "Driver",
                  "Mechanic",
                  "Car Detailer",
                  "Tyre Specialist",
                  "Gardener",
                  "Security Guard",
                  "Locksmith",
                  "RO Technician",
                  "Nurse",
                  "Caregiver",
                  "Physiotherapist",
                  "Photographer",
                  "Videographer",
                  "DJ",
                  "Event Decorator",
                  "Caterer",
                  "Interior Designer",
                  "Mason",
                  "Tile Worker",
                  "Welder"
                ]}
                selectedValues={skills}
                placeholder="Select Skills"
                onChange={(v) => { setSkills(v); setSkillsError(""); }}
              />
              <FieldError error={skillsError} />

              <ServizoDropdown
                label="Experience"
                placeholder="Years of experience"
                icon="time-outline"
                data={["0-1 Year", "1-3 Years", "3-8 Years", "8+ Years"]}
                value={experience}
                onSelect={(v) => { setExperience(v); setExperienceError(""); }}
              />
              <FieldError error={experienceError} />

              <ServizoDropdown
                label="Availability"
                placeholder="Availability"
                icon="calendar-outline"
                data={["Part time", "Full Time", "Only Weekends"]}
                value={availability}
                onSelect={(v) => { setAvailability(v); setAvailabilityError(""); }}
              />
              <FieldError error={availabilityError} />
            </>
          )}
        </View>


        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>


      <RoleChangeModal
        visible={showRoleModal}
        onCancel={() => setShowRoleModal(false)}
        onConfirm={() => { setRoleEditable(true); setShowRoleModal(false); }}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingBottom: 60,
  },


  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },


  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  heroSub: {
    fontSize: 13,
    color: C.subtext,
    marginTop: 2,
  },


  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EEEDFE",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#534AB7",
    letterSpacing: 1,
  },


  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    marginBottom: 16,
  },


  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginHorizontal: 16,
    gap: 4,
  },


  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.muted,
  },


  providerDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },


  roleLockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  roleLockText: {
    fontSize: 11,
    color: C.muted,
  },


  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -2,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  errorText: {
    fontSize: 12,
    color: C.danger,
  },


  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 15,
    margin: 16,
    marginTop: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },


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
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0DDD6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: "#EEEDFE",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "300",
    color: C.primary,
    marginBottom: 6,
  },
  modalBody: {
    fontSize: 13,
    color: C.subtext,
    lineHeight: 20,
    marginBottom: 24,
  },
  btnConfirm: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  btnConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  btnCancel: {
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnCancelText: {
    color: "#4A4640",
    fontSize: 14,
  },
});