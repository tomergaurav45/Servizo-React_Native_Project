import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

export default function EditProfileScreen() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [role] = useState(user?.role || "");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

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

        <ServizoInput
          label="Date of Birth"
          placeholder="DD/MM/YYYY"
          icon="calendar-outline"
          value={dob}
          onChangeText={setDob}
        />

        <ServizoInput
          label="Phone Number"
          placeholder="Enter phone number"
          icon="call-outline"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <ServizoInput
          label="Role"
          icon="briefcase-outline"
          value={role}
          editable={false}
        />

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

      </View>
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
  },
  title: {
    fontSize: 22,
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