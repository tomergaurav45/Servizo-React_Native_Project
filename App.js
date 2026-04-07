import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { ServizoToast } from "./src/components/ServizoToast";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import BottomTabs from "./src/navigation/BottomTabs";
//import ActivityScreen from "./src/screens/ActivityScreen";
import AddAddressMap from "./src/screens/AddAddressMap";
import ChangePassword from "./src/screens/ChangePassword";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HelpSupportScreen from "./src/screens/HelpandSupport";
import LoginScreen from "./src/screens/LoginScreen";
import ManageAddressScreen from "./src/screens/ManageAddressScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ReviewScreen from "./src/screens/ReviewScreen";
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
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen
            name="ManageAddressScreen"
            component={ManageAddressScreen}
          />
          <Stack.Screen
            name="AddAddressMap"
            component={AddAddressMap}
          />
          <Stack.Screen
            name="ReviewScreen"
            component={ReviewScreen}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
          />
          <Stack.Screen
            name="HelpSupportScreen"
            component={HelpSupportScreen}
          />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
        </>
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
        <Toast config={toastConfig} position="top" topOffset={60} />
      </NavigationContainer>
    </AuthProvider>
  );
}