
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../utils/constants";


export const ServizoToast = ({ text1, text2, type }) => {
  const isSuccess = type === "success";
  const isError = type === "error";
  const isInfo = type === "info";

  const backgroundColor = isSuccess
    ? "#E8F5E9"
    : isError
      ? "#FFEBEE"
      : "#E3F2FD";

  const borderColor = isSuccess
    ? COLORS.primary
    : isError
      ? "#E53935"
      : "#2196F3";

  const textColor = isSuccess
    ? COLORS.primary
    : isError
      ? "#C62828"
      : "#1976D2";

  return (
    <View style={[styles.container, { backgroundColor, borderLeftColor: borderColor }]}>
      
      <Image
        source={require("../../assets/images/icon1.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 6,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  text1: {
    fontWeight: "bold",
    fontSize: 15,
  },
  text2: {
    fontSize: 13,
    color: "#555",
  },
});
