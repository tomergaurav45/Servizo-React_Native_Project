import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { changePassword } from "../apis/authApi";
import { ServizoAlert } from "../components/ServizoAlert";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const navigation = useNavigation();
    const { user } = useAuth();

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Missing Fields",
                text2: "Please fill all required fields",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Password Mismatch",
                text2: "Passwords do not match",
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: "error",
                text1: "Weak Password",
                text2: "Minimum 6 characters required",
            });
            return;
        }


        setAlertMessage("Are you sure you want to update password?");
        setShowAlert(true);
    };

    const handleConfirm = async () => {
        setShowAlert(false);

        try {
            const response = await changePassword({
                userId: user?.userId,
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (!response.success) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: response.message,
                });
                return;
            }

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Password updated successfully",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigation.goBack();
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Network Error",
                text2: "Something went wrong. Try again.",
            });
        }
    };

    const handleCancel = () => {
        setShowAlert(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                        <Text style={styles.title}>Change Your Password</Text>
                    </View>
                </View>

                <ServizoInput
                    label="Current Password"
                    placeholder="Enter current password"
                    icon="lock-closed-outline"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                />

                <ServizoInput
                    label="New Password"
                    placeholder="Enter new password"
                    icon="lock-closed-outline"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />

                <ServizoInput
                    label="Confirm Password"
                    placeholder="Enter confirm password"
                    icon="lock-closed-outline"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword}>
                    <Text style={styles.saveText}>Update Password</Text>
                </TouchableOpacity>
            </View>
            <ServizoAlert
                visible={showAlert}
                title="Servizo"
                message={alertMessage}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </SafeAreaView>
    );
};

export default ChangePassword;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },

    formCard: {
        flex: 1,
        backgroundColor: COLORS.background2,
        borderRadius: 20,
        padding: 15,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.primary,
    },

    saveBtn: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
    },

    saveText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },

    icon: {
        width: 70,
        height: 70,
    },

    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginRight: 0,
    },
});