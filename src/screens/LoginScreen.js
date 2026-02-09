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
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { loginUser } from "../apis/authApi";

import ServizoButton from "../components/ServizoButton";
import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";


const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isLargeScreen = width > 768;

  const backgroundImage =
    isWeb || isLargeScreen
      ? require("../../assets/images/loginbg.png")
      : require("../../assets/images/loginbg2.jpg");

  
  const handleLogin = async () => {
  if (!email || !password) {
    Toast.show({
      type: "error",
      text1: "Missing details",
      text2: "Please fill in all fields",
    });
    return;
  }

  setLoading(true);

  try {
    const result = await loginUser(email, password);

    if (!result.success) {
     
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: result.message,
      });
      return;
    }

    
    Toast.show({
      type: "success",
      text1: "Login successful",
      text2: `Welcome ${result.user.name}`,
    });

    
    login(result.user);

  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Something went wrong",
    });
  } finally {
    setLoading(false);
  }
  
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={backgroundImage}
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

            <Text style={styles.subtitle}>Login to continue</Text>

           
            <ServizoInput
              label="Email"
              placeholder="Enter your email"
              icon="mail-outline"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <ServizoInput
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

           
            <View style={styles.row}>
             
              <Text
  style={styles.forgotText}
  onPress={() => navigation.navigate("ForgotPasswordScreen")}
>
  Forgot password?
</Text>
            </View>

            
            <ServizoButton
              title="LOGIN"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 10 }}
            />

           
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don’t have an account?{" "}
              </Text>
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate("RegisterScreen")}
              >
                Register
              </Text>
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
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 450,
    elevation: 5,
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
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: "bold", 
    fontSize: 13,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  registerText: {
    color: COLORS.textDark,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
});
