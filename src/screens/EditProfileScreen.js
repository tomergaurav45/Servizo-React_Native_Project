import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [role] = useState(user?.role || "");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>Edit Profile</Text>

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

        {/* Servizo Calendar */}
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

<ServizoInput
          label="Role"
          icon="briefcase-outline"
          value={role}
          editable={false}
        />
        
        <ServizoMultiSelectDropdown
  label="Skills"
  icon="build-outline"
  data={[
    "Plumbing",
    "Electrician",
    "Cleaning",
    "AC Repair",
    "Painter",
    "Carpentry",
    "Appliance Repair",
    "Home Services",
    "Barber",
    "Tutor",
    "Fitness Trainer",
    "Delivery Helper",
    "General Services",
    "Driver",
    "Mechanic",
    "Gardner",
    "Security Guard",
    "RO / Water Purifier Repair",


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

        <ServizoInput
          label="Availability"
          placeholder="Availability"
          icon="calendar-outline"
          value={availability}
          onChangeText={setAvailability}
        />

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
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
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.primary,
  },
  title2: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.primary,
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
});