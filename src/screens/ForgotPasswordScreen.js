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
import {
  resetPassword,
  sendForgotOtp,
  verifyEmailOtp
} from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoInput from "../components/ServizoInput";
import { COLORS } from "../utils/constants";

const { height } = Dimensions.get("window");

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showError = (msg) =>
    Toast.show({ type: "error", text1: msg });

  const handleSendOtp = async () => {
    const res = await sendForgotOtp(email);
    if (!res.success) return showError(res.message);
    setOtpSent(true);
    Toast.show({ type: "info", text1: "OTP sent" });
  };

  const handleVerifyOtp = async () => {
    const res = await verifyEmailOtp(email, otp);
    if (!res.success) return showError(res.message);
    setOtpVerified(true);
    Toast.show({ type: "success", text1: "OTP verified" });
  };

  const handleResetPassword = async () => {
    if (!otpVerified) {
      return showError("Please verify OTP first");
    }

    if (!password || !confirmPassword) {
      return showError("Password fields cannot be empty");
    }

    if (password !== confirmPassword) {
      return showError("Passwords do not match");
    }

    const res = await resetPassword(email, password);
    if (!res.success) return showError(res.message);

    Toast.show({ type: "success", text1: "Password updated successfully" });
    navigation.replace("LoginScreen");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={require("../../assets/images/icon2.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {/* Back Button */}
            <ServizoBackButton to="LoginScreen" />
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/icon1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Forgot Password</Text>

            <ServizoInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              editable={!otpSent}
            />
            {!otpSent && (
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={!email}
              >
                <Text style={styles.btn}>Send OTP</Text>
              </TouchableOpacity>
            )}

            {otpSent && !otpVerified && (
              <>
                <ServizoInput
                  label="OTP"
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                />
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={!otp}
                >
                  <Text style={styles.btn}>Verify OTP</Text>
                </TouchableOpacity>
              </>
            )}

            {otpVerified && (
              <>
                <ServizoInput
                  label="New Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <ServizoInput
                  label="Confirm Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={handleResetPassword}>
                  <Text style={styles.btn}>Reset Password</Text>
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 450,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.textDark,
  },
  btn: {
    backgroundColor: COLORS.primary,
    color: "white",
    padding: 12,
    textAlign: "center",
    borderRadius: 8,
    marginTop: 12,
    fontWeight: "600",
  },
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 1,
  },
  logo: {
    width: 300,
    height: 200,
  },
});