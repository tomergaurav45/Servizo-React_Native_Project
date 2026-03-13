import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ServizoAlert } from "../components/ServizoAlert";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoDatePicker from "../components/ServizoDatePicker";
import ServizoDropdown from "../components/ServizoDropdown";
import ServizoInput from "../components/ServizoInput";
import ServizoMultiSelectDropdown from "../components/ServizoMultiSelectDropdown";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

export default function EditProfileScreen() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [role, setRole] = useState(user?.role || "");
const [roleEditable, setRoleEditable] = useState(false);
const [showRoleAlert, setShowRoleAlert] = useState(false);

const handleRolePress = () => {

  if (roleEditable) return;

  Toast.show({
    type: "info",
    text1: "Change Role",
    text2: "Confirm if you want to change your role",
  });

  setShowRoleAlert(true);
};

  return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

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
    <Text style={styles.title}>Edit Profile</Text>
    <Text style={styles.subtitle}>Update your personal details</Text>
  </View>
</View>

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
          onChange={setDob}
        />

        <ServizoInput
          label="Phone Number"
          placeholder="Enter phone number"
          icon="call-outline"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <ServizoDropdown
          label="Gender"
          icon="male-female-outline"
          data={["Male", "Female", "Other"]}
          value={gender}
          placeholder="Select Gender"
          onSelect={setGender}
        />

        <Text style={styles.title2}>Professional Information</Text>

      {roleEditable ? (
  <ServizoDropdown
    label="Role"
    icon="briefcase-outline"
    value={role}
    data={["provider", "customer"]}
    onSelect={setRole}
  />
) : (
  <TouchableOpacity activeOpacity={0.8} onPress={handleRolePress}>
    <View pointerEvents="none">
      <ServizoDropdown
        label="Role"
        icon="briefcase-outline"
        value={role}
        data={["provider", "customer"]}
      />
    </View>
  </TouchableOpacity>
)}

        <ServizoMultiSelectDropdown
          label="Skills"
          icon="build-outline"
          data={[
            "Plumbing","Electrician","Cleaning","AC Repair","Painter",
            "Carpentry","Appliance Repair","Home Services","Barber",
            "Tutor","Fitness Trainer","Delivery Helper","General Services",
            "Driver","Mechanic","Gardner","Security Guard",
            "RO / Water Purifier Repair"
          ]}
          selectedValues={skills}
          placeholder="Select Skills"
          onChange={setSkills}
        />

        <ServizoDropdown
          label="Experience"
          placeholder="Years of experience"
          icon="time-outline"
          data={["0-1 Year", "1-3 Years", "3-8 Year", "8+ Year"]}
          value={experience}
          onSelect={setExperience}
        />

        <ServizoDropdown
          label="Availability"
          placeholder="Availability"
          icon="calendar-outline"
          data={["Part time", "Full Time", "Only Weekends"]}
          value={availability}
          onSelect={setAvailability}
        />

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
    <ServizoAlert
  visible={showRoleAlert}
  title="Change Role"
  message="Are you sure you want to change your role?"
  onCancel={() => setShowRoleAlert(false)}
  onConfirm={() => {
    setRoleEditable(true);
    setShowRoleAlert(false);
  }}
/>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    padding: 20,
    paddingBottom: 60,
  },

 title: {
  fontSize: 22,
  fontWeight: "700",
  color: COLORS.primary,
},
  title2: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.primary,
  },
    header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 25,
},

  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
   icon: {
    width: 50,
    height: 50,
    marginRight: 5,
  },
  formCard: {
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 20,

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 5,
  elevation: 3,
},
iconContainer: {
 // backgroundColor: "#EEF4FF",
  padding: 10,
  borderRadius: 12,
  marginRight: 12,
},
subtitle: {
  fontSize: 13,
  color: "#777",
  marginTop: 2,
},
});