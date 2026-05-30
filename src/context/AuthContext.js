import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser =
        await AsyncStorage.getItem("servizoUser");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const login = async (userData) => {
    setUser(userData);

    await AsyncStorage.setItem(
      "servizoUser",
      JSON.stringify(userData)
    );
  };

  const logout = async () => {
    setUser(null);

    await AsyncStorage.removeItem("servizoUser");
  };

  const updateRole = async (role) => {

    const updatedUser = {
      ...user,
      role,
    };

    setUser(updatedUser);

    await AsyncStorage.setItem(
      "servizoUser",
      JSON.stringify(updatedUser)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};