import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { ServizoToast } from "./src/components/ServizoToast";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

const Stack = createNativeStackNavigator();


const toastConfig = {
  success: (props) => <ServizoToast {...props} type="success" />,
  error: (props) => <ServizoToast {...props} type="error" />,
  info: (props) => <ServizoToast {...props} type="info" />,
};

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          
          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />

       
        <Toast
          config={toastConfig}
          position="top"
          topOffset={60}
          visibilityTime={2000}
        />
      </NavigationContainer>
    </AuthProvider>
  );
}