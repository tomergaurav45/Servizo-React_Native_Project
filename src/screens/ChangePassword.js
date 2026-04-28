import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { changePassword } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoInput from "../components/ServizoInput";
import { useAuth } from "../context/AuthContext";

const C = {
    bg: "#F7F5F0",
    card: "#FFFFFF",
    primary: "#1C1A17",
    accent: "#C4AA7A",
    muted: "#A89F8E",
    subtext: "#7A7263",
    body: "#5A5449",
    border: "#EAE7E0",
    danger: "#E53935",
    dangerLight: "#FFF0F0",
    success: "#0F6E56",
    successLight: "#E1F5EE",
};


function ConfirmModal({ visible, onCancel, onConfirm }) {
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
            <Pressable style={styles.modalBackdrop} onPress={onCancel}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalIconWrap}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={C.success} />
                    </View>
                    <Text style={styles.modalTitle}>Update password?</Text>
                    <Text style={styles.modalBody}>
                        Your current session will remain active. All other devices may need to log in again.
                    </Text>
                    <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.btnConfirmText}>Yes, update it</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                        <Text style={styles.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}


function StrengthBar({ password }) {
    const len = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = (len >= 6 ? 1 : 0) + (len >= 10 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0);

    if (!password) return null;

    const levels = [
        { label: "Weak", color: C.danger, bars: 1 },
        { label: "Fair", color: "#C4AA7A", bars: 2 },
        { label: "Good", color: "#1D9E75", bars: 3 },
        { label: "Strong", color: C.success, bars: 4 },
    ];
    const level = score <= 1 ? 0 : score <= 2 ? 1 : score <= 3 ? 2 : 3;
    const { label, color, bars } = levels[level];

    return (
        <View style={styles.strengthWrap}>
            <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.strengthBar,
                            { backgroundColor: i <= bars ? color : C.border },
                        ]}
                    />
                ))}
            </View>
            <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
        </View>
    );
}


function Requirement({ met, label }) {
    return (
        <View style={styles.reqRow}>
            <Ionicons
                name={met ? "checkmark-circle" : "ellipse-outline"}
                size={13}
                color={met ? C.success : C.muted}
            />
            <Text style={[styles.reqText, met && { color: C.success }]}>{label}</Text>
        </View>
    );
}


const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showModal, setShowModal] = useState(false);

    const navigation = useNavigation();
    const { user } = useAuth();

    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const minLength = newPassword.length >= 6;

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill all required fields" });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: "error", text1: "Password Mismatch", text2: "Passwords do not match" });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({ type: "error", text1: "Weak Password", text2: "Minimum 6 characters required" });
            return;
        }
        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);
        try {
            const response = await changePassword({
                userId: user?.userId,
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (!response.success) {
                Toast.show({ type: "error", text1: "Error", text2: response.message });
                return;
            }

            Toast.show({ type: "success", text1: "Password Updated", text2: "Your password was changed successfully" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigation.goBack();
        } catch {
            Toast.show({ type: "error", text1: "Network Error", text2: "Something went wrong. Try again." });
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
    contentContainerStyle={{ paddingBottom: 20 }}
    showsVerticalScrollIndicator={false}
  >
            <View style={styles.topBar}>
                <ServizoBackButton />
            </View>


            <View style={styles.hero}>
                <View style={styles.heroIcon}>
                    <Ionicons name="lock-closed-outline" size={26} color="#534AB7" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.heroLabel}>Security</Text>
                    <Text style={styles.heroTitle}>
                        Change{" "}
                        <Text style={styles.heroTitleItalic}>Password</Text>
                    </Text>
                    <Text style={styles.heroSub}>Keep your account secure</Text>
                </View>
            </View>

            <View style={styles.divider} />


            <View style={styles.card}>
                <View style={styles.sectionLabel}>
                    <Ionicons name="key-outline" size={13} color={C.muted} />
                    <Text style={styles.sectionLabelText}>Credentials</Text>
                </View>

                <ServizoInput
                    label="Current Password"
                    placeholder="Enter current password"
                    icon="lock-closed-outline"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                />

                <View style={styles.newPassSection}>
                    <ServizoInput
                        label="New Password"
                        placeholder="Enter new password"
                        icon="lock-open-outline"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                    <StrengthBar password={newPassword} />
                </View>

                <ServizoInput
                    label="Confirm Password"
                    placeholder="Re-enter new password"
                    icon="lock-open-outline"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />


                {confirmPassword.length > 0 && (
                    <View style={styles.matchRow}>
                        <Ionicons
                            name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                            size={13}
                            color={passwordsMatch ? C.success : C.danger}
                        />
                        <Text style={[styles.matchText, { color: passwordsMatch ? C.success : C.danger }]}>
                            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </Text>
                    </View>
                )}
            </View>


            <View style={[styles.card, { marginTop: 12 }]}>
                <View style={styles.sectionLabel}>
                    <Ionicons name="information-circle-outline" size={13} color={C.muted} />
                    <Text style={styles.sectionLabelText}>Requirements</Text>
                </View>
                <Requirement met={minLength} label="At least 6 characters" />
                <Requirement met={/[A-Z]/.test(newPassword)} label="One uppercase letter" />
                <Requirement met={/[0-9]/.test(newPassword)} label="One number" />
                <Requirement met={/[^A-Za-z0-9]/.test(newPassword)} label="One special character" />
            </View>


            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword} activeOpacity={0.85}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Update Password</Text>
            </TouchableOpacity>

            <ConfirmModal
                visible={showModal}
                onCancel={() => setShowModal(false)}
                onConfirm={handleConfirm}
            />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ChangePassword;


const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },

    topBar: { paddingHorizontal: 20, paddingTop: 8 },


    hero: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    heroIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: "#EEEDFE",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    heroLabel: {
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: C.muted,
        marginBottom: 2,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "300",
        color: C.primary,
        lineHeight: 32,
    },
    heroTitleItalic: {
        fontStyle: "italic",
        fontWeight: "400",
        color: "#6B5E3F",
    },
    heroSub: { fontSize: 13, color: C.subtext, marginTop: 2 },

    divider: {
        height: 1,
        backgroundColor: C.border,
        marginHorizontal: 16,
        marginBottom: 16,
    },


    card: {
        backgroundColor: C.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        marginHorizontal: 16,
        gap: 4,
    },

    sectionLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    sectionLabelText: {
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: C.muted,
    },

    newPassSection: { gap: 4 },


    strengthWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 2,
        marginTop: 2,
        marginBottom: 6,
    },
    strengthBars: { flex: 1, flexDirection: "row", gap: 4 },
    strengthBar: {
        flex: 1,
        height: 3,
        borderRadius: 2,
    },
    strengthLabel: { fontSize: 11, fontWeight: "500", minWidth: 40 },


    matchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 2,
        marginTop: 2,
        marginBottom: 4,
    },
    matchText: { fontSize: 12 },


    reqRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingVertical: 4,
    },
    reqText: {
        fontSize: 13,
        color: C.muted,
    },


    saveBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: C.primary,
        borderRadius: 16,
        paddingVertical: 15,
        margin: 16,
        marginTop: 20,
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
        letterSpacing: 0.1,
    },


    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(28,26,23,0.45)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#E0DDD6",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    modalIconWrap: {
        width: 48,
        height: 48,
        backgroundColor: C.successLight,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "300",
        color: C.primary,
        marginBottom: 6,
    },
    modalBody: {
        fontSize: 13,
        color: C.subtext,
        lineHeight: 20,
        marginBottom: 24,
    },
    btnConfirm: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: C.primary,
        borderRadius: 14,
        paddingVertical: 14,
        marginBottom: 10,
    },
    btnConfirmText: { color: "#fff", fontSize: 14, fontWeight: "500" },
    btnCancel: {
        backgroundColor: C.bg,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
    },
    btnCancelText: { color: "#4A4640", fontSize: 14 },
});