import { Image, StyleSheet, View } from "react-native";

export default function ServizoLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon1.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 999,
  },
  logo: {
    width: 40,
    height: 40,
  },
});