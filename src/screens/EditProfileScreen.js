import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
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
import { registerUser } from "../apis/authApi";
import { ServizoAlert } from "../components/ServizoAlert";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoDatePicker from "../components/ServizoDatePicker";
import ServizoDropdown from "../components/ServizoDropdown";
import ServizoInput from "../components/ServizoInput";
import ServizoMultiSelectDropdown from "../components/ServizoMultiSelectDropdown";
import { useAuth } from "../context/AuthContext";

import { COLORS } from "../utils/constants";

export default function EditProfileScreen() {
  const { user, login } = useAuth();
  const navigation = useNavigation();

  const nameParts = user?.name?.split(" ") || [];

  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");

  useEffect(() => {
  if (role !== "provider") {
    setSkills([]);
    setExperience("");
    setAvailability("");
  }
}, [role]);

  //const [role, setRole] = useState(user?.role || "");

  const [roleEditable, setRoleEditable] = useState(false);
  const [showRoleAlert, setShowRoleAlert] = useState(false);

  const [dob, setDob] = useState(user?.dob || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [gender, setGender] = useState(user?.gender || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [experience, setExperience] = useState(user?.experience || "");
  const [availability, setAvailability] = useState(user?.availability || "");
  const [role, setRole] = useState(user?.role || "");
  //const [phoneError, setPhoneError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [dobError, setdobError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");


  const handleRolePress = () => {

    if (roleEditable) return;

    Toast.show({
      type: "info",
      text1: "Change Role",
      text2: "Confirm if you want to change your role",
    });



    setShowRoleAlert(true);
  };

  const handleSaveChanges = async () => {

    if (!phone || phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    if (!gender) {
      setGenderError("Gender is missing");
      return;
    }
    if (!dob) {
      setdobError("Date of Birth is missing");
      return;
    }

    if (!skills || skills.length === 0) {
      setSkillsError("Skills are missing");
      return;
    }

    if (!experience) {
      setExperienceError("Experience is missing");
      return;
    }

    if (!availability) {
      setAvailabilityError("Availability is missing");
      return;
    }
    try {

      const result = await registerUser({
        userId: user?.userId,
        firstName,
        lastName,
        role,
        dob,
        phone,
        gender,
        skills,
        experience,
        availability
      });

      if (!result.success) {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: result.message,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your details were updated successfully",
      });

      login({
        ...user,
        name: `${firstName} ${lastName}`,
        role,
        phone,
        gender,
        skills,
        experience,
        availability,
        dob
      });

      navigation.goBack();

    } catch (error) {

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
      });

    }

  };

  const handlePhoneChange = (value) => {

    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length <= 10) {
      setPhone(numericValue);
    }

    if (numericValue.length === 10) {
      setPhoneError("");
    } else {
      setPhoneError("Phone number must be exactly 10 digits");
    }
  };

  useEffect(() => {

    if (!phone) setPhoneError("Phone number is missing");
    if (!gender) setGenderError("Gender is missing");
    if (!dob) setdobError("Date of Birth is missing");
    if (!skills || skills.length === 0) setSkillsError("Skills are missing");
    if (!experience) setExperienceError("Experience is missing");
    if (!availability) setAvailabilityError("Availability is missing");

  }, []);

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
            onSelect={(value) => {
              setDob(value);
              setdobError("");
            }}
          />
          {dobError ? (
            <Text style={styles.errorText}>{dobError}</Text>
          ) : null}


          <ServizoInput
            label="Phone Number"
            placeholder="Enter phone number"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
          />
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}

          <ServizoDropdown
            label="Gender"
            icon="male-female-outline"
            data={["Male", "Female", "Other"]}
            value={gender}
            placeholder="Select Gender"
            onSelect={(value) => {
              setGender(value);
              setGenderError("");
            }}
          />
          {genderError ? (
            <Text style={styles.errorText}>{genderError}</Text>
          ) : null}

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

        {role === "provider" && (
  <>
    <ServizoMultiSelectDropdown
      label="Skills"
      icon="build-outline"
      data={[
        "Plumbing", "Electrician", "Cleaning", "AC Repair", "Painter",
        "Carpentry", "Appliance Repair", "Home Services", "Barber",
        "Tutor", "Fitness Trainer", "Delivery Helper", "General Services",
        "Driver", "Mechanic", "Gardner", "Security Guard",
        "RO / Water Purifier Repair"
      ]}
      selectedValues={skills}
      placeholder="Select Skills"
      onChange={(value) => {
        setSkills(value);
        setSkillsError("");
      }}
    />
    {skillsError ? (
      <Text style={styles.errorText}>{skillsError}</Text>
    ) : null}

    <ServizoDropdown
      label="Experience"
      placeholder="Years of experience"
      icon="time-outline"
      data={["0-1 Year", "1-3 Years", "3-8 Year", "8+ Year"]}
      value={experience}
      onSelect={(value) => {
        setExperience(value);
        setExperienceError("");
      }}
    />
    {experienceError ? (
      <Text style={styles.errorText}>{experienceError}</Text>
    ) : null}

    <ServizoDropdown
      label="Availability"
      placeholder="Availability"
      icon="calendar-outline"
      data={["Part time", "Full Time", "Only Weekends"]}
      value={availability}
      onSelect={(value) => {
        setAvailability(value);
        setAvailabilityError("");
      }}
    />
    {availabilityError ? (
      <Text style={styles.errorText}>{availabilityError}</Text>
    ) : null}
  </>
)}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
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
    width: 70,
    height: 70
  },
  formCard: {
    backgroundColor: COLORS.background2,
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10
  },
});