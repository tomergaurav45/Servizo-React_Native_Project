import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const ServizoAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
  loading = false,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={[styles.overlay, { backgroundColor: colors.bg + "73" }]}>
        <View style={[styles.alertBox, { backgroundColor: colors.surface }]}>

          <Image
            source={require("../../assets/images/icon1.png")}
            style={styles.icon}
          />

          <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>

          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>

          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt }, loading && styles.disabled]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.bg} />
              ) : (
                <Text style={[styles.confirmText, { color: colors.bg }]}>{confirmText}</Text>
              )}
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  alertBox: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  cancelText: {
    fontWeight: "600",
  },

  confirmText: {
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.65,
  },

});
