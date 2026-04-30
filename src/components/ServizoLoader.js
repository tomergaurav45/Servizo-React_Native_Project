import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ServizoLoader({ text = "Loading" }) {
  const ring1Rotation = useRef(new Animated.Value(0)).current;
  const ring2Rotation = useRef(new Animated.Value(0)).current;
  const ring3Rotation = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0.85)).current;
  const dotOpacity = useRef(new Animated.Value(0.6)).current;
  const textOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const spin = (ref, duration, reverse = false) =>
      Animated.loop(
        Animated.timing(ref, {
          toValue: reverse ? -1 : 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

    const pulse = (scaleRef, opacityRef) =>
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleRef, {
              toValue: 1,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityRef, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleRef, {
              toValue: 0.85,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityRef, {
              toValue: 0.6,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

    spin(ring1Rotation, 1000);
    spin(ring2Rotation, 1400, true);
    spin(ring3Rotation, 1800);
    pulse(dotScale, dotOpacity);
    pulse(dotScale, dotOpacity); 
    pulse(textOpacity, textOpacity); 
  }, []);

  const toRotate = (val) => ({
    transform: [
      {
        rotate: val.interpolate({
          inputRange: [-1, 1],
          outputRange: ["-360deg", "360deg"],
        }),
      },
    ],
  });

  return (
    <View style={styles.overlay}>

      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <View style={styles.card}>

        <View style={styles.spinnerWrap}>
          <Animated.View style={[styles.ring, styles.ring1, toRotate(ring1Rotation)]} />
          <Animated.View style={[styles.ring, styles.ring2, toRotate(ring2Rotation)]} />
          <Animated.View style={[styles.ring, styles.ring3, toRotate(ring3Rotation)]} />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dotScale }], opacity: dotOpacity },
            ]}
          />
        </View>

        <Text style={styles.text}>{text}...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 12, 41, 0.85)",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.25,
  },
  blob1: {
    width: 220,
    height: 220,
    backgroundColor: "#7f77dd",
    top: -60,
    left: -60,
  },
  blob2: {
    width: 180,
    height: 180,
    backgroundColor: "#1d9e75",
    bottom: -50,
    right: -50,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 20,
  },
  spinnerWrap: {
    width: 56,
    height: 56,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: "transparent",
  },
  ring1: {
    inset: 0,
    width: 56,
    height: 56,
    borderTopColor: "#7f77dd",
  },
  ring2: {
    width: 44,
    height: 44,
    borderRightColor: "#1d9e75",
  },
  ring3: {
    width: 32,
    height: 32,
    borderBottomColor: "#ef9f27",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
});