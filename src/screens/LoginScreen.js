import { useMemo, useState } from "react";
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
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { loginUser } from "../apis/authApi";

import ServizoButton from "../components/ServizoButton";
import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";


const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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


      await login(result.user);

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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

              <TouchableOpacity
                style={styles.rememberContainer}
                onPress={() => setRemember(!remember)}
              >
                <View
                  style={[
                    styles.checkbox,
                    remember && styles.checkboxActive,
                  ]}
                >
                  {remember && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>

                <Text style={styles.rememberText}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <Text
                style={styles.forgotText}
                onPress={() =>
                  navigation.navigate("ForgotPasswordScreen")
                }
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

const createStyles = (theme) => {
  const c = theme.colors;

  return StyleSheet.create({
    background: {
      flex: 1,
      width: "100%",
      height: height,
      justifyContent: "center",
      alignItems: "center",
    },
    overlay: {
      backgroundColor: c.surface + "D9",
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
      width: 170,
      height: 130,
    },
    subtitle: {
      fontSize: 16,
      color: c.textMuted,
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
      color: c.primary,
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
      color: c.text,
      fontSize: 14,
    },
    registerLink: {
      color: c.primary,
      fontSize: 15,
      fontWeight: "bold",
    },
    rememberContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    checkbox: {
      width: 18,
      height: 18,
      borderWidth: 1.5,
      borderColor: c.primary,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
      backgroundColor: c.surface,
    },

    checkboxActive: {
      backgroundColor: c.primary,
    },

    checkmark: {
      color: c.bg,
      fontSize: 12,
      fontWeight: "bold",
    },

    rememberText: {
      fontSize: 13,
      color: c.text,
    },
  });
};
