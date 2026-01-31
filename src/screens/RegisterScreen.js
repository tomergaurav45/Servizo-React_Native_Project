import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser, sendEmailOtp, verifyEmailOtp } from "../apis/authApi";
import ServizoInput from "../components/ServizoInput";
import { COLORS } from "../utils/constants";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOTP = async () => {
  if (!email.includes("@")) {
    Alert.alert("Invalid Email", "Please enter a valid email address.");
    return;
  }

  try {
    const response = await sendEmailOtp(email);

    if (response.success) {
      setOtpSent(true);
      Alert.alert("OTP Sent", "OTP has been sent to your email.");
    } else {
      Alert.alert("Error", response.message || "Failed to send OTP");
    }
  } catch (error) {
    Alert.alert("Server Error", "Unable to send OTP. Try again later.");
  }
};


 const handleRegister = async () => {
  try {
    const otpResponse = await verifyEmailOtp(email, otp);

    if (!otpResponse.success) {
      Alert.alert("OTP Error", otpResponse.message);
      return;
    }

    // ✅ OTP verified
    const registerResponse = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    if (!registerResponse.success) {
      Alert.alert("Register Error", registerResponse.message);
      return;
    }

    Alert.alert("Success", "Account created successfully!");
    navigation.replace("LoginScreen");

  } catch (error) {
    Alert.alert("Error", "Something went wrong");
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require("../../assets/images/loginbg.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {/* Logo */}
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/icon1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>Create your Servizo account</Text>

            {/* Name */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 5 }}>
                <ServizoInput
                  label="First Name"
                  placeholder="Enter first name"
                  icon="person-outline"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 5 }}>
                <ServizoInput
                  label="Last Name"
                  placeholder="Enter last name"
                  icon="person-outline"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Email */}
            <ServizoInput
              label="Email"
              placeholder="Enter your email"
              icon="mail-outline"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Email OTP */}
            {!otpSent ? (
              <TouchableOpacity
  style={[
    styles.otpButton,
    otpSent && { backgroundColor: "#aaa" },
  ]}
  onPress={handleSendOTP}
  disabled={otpSent}
>
  <Text style={styles.otpText}>
    {otpSent ? "OTP Sent" : "Send OTP"}
  </Text>
</TouchableOpacity>

            ) : (
              <ServizoInput
                label="OTP"
                placeholder="Enter OTP"
                icon="key-outline"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
              />
            )}

            {/* Password */}
            <ServizoInput
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <ServizoInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon="lock-closed-outline"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Register */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>

            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 24,
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 450,
    elevation: 5,
  },
  brandRow: {
    alignItems: "center",
    marginVertical: 5,
  },
  logo: {
    width: 220,
    height: 140,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
  },
  otpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  otpText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  loginText: {
    color: COLORS.textDark,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});
