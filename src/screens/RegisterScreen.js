import { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import ServizoInput from "../components/ServizoInput";
import { COLORS } from "../utils/constants";

import {
  registerUser,
  sendEmailOtp,
  sendWelcomeMail,
  verifyEmailOtp
} from "../apis/authApi";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showError = (title, message) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
    });
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showError("Email Required", "Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      showError("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      const response = await sendEmailOtp(email);

      console.log("SEND OTP RESPONSE ", response);

      if (!response.success) {

        showError("Registration Error", response.message);
        return;
      }

      setOtpSent(true);

      Toast.show({
        type: "info",
        text1: "OTP Sent",
        text2: "Check your email for OTP",
      });
    } catch (error) {
      console.log("SEND OTP ERROR ", error);
      showError("Server Error", "Unable to send OTP");
    }
  };

  const handleRegister = async () => {

    if (!firstName.trim()) {
      showError("First Name Required", "Please enter your first name");
      return;
    }

    if (!lastName.trim()) {
      showError("Last Name Required", "Please enter your last name");
      return;
    }

    if (!email.trim()) {
      showError("Email Required", "Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      showError("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!otp.trim()) {
      showError("OTP Required", "Please enter the OTP sent to your email");
      return;
    }

    if (!password) {
      showError("Password Required", "Please enter a password");
      return;
    }

    if (password.length < 6) {
      showError("Weak Password", "Password must be at least 6 characters");
      return;
    }

    if (!confirmPassword) {
      showError("Confirm Password", "Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      showError("Password Mismatch", "Passwords do not match");
      return;
    }

    try {

      const otpResponse = await verifyEmailOtp(email, otp);

      if (!otpResponse.success) {
        showError("OTP Error", otpResponse.message || "Invalid OTP");
        return;
      }


      const registerResponse = await registerUser({
        firstName,
        lastName,
        email,
        password,
      });

      if (!registerResponse.success) {
        showError("Registration Failed", registerResponse.message);
        return;
      }


      sendWelcomeMail(email, `${firstName} ${lastName}`);


      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You can now login to Servizo",
      });

      navigation.replace("LoginScreen");

    } catch (error) {
      showError("Server Error", "Something went wrong. Try again later.");
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
          source={require("../../assets/images/loginbg3.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>

            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/icon1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>Create your Servizo account</Text>


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


            <ServizoInput
              label="Email"
              placeholder="Enter your email"
              icon="mail-outline"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />


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


            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>


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
    width: "100%",
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
