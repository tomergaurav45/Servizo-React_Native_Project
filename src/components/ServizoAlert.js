import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../utils/constants";

export const ServizoAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>

          <Image
            source={require("../../assets/images/icon1.png")}
            style={styles.icon}
          />

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>

            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>No</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>Yes</Text>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
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
    color: COLORS.primary,
    marginBottom: 8,
  },

  message: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
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
    backgroundColor: "#EEE",
  },

  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  cancelText: {
    color: "#333",
    fontWeight: "600",
  },

  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },

});