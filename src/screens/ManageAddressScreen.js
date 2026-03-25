import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { deleteAddress, getAddresses } from "../apis/authApi";
import { ServizoAlert } from "../components/ServizoAlert";
import ServizoBackButton from "../components/ServizoBackButton";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

export default function ManageAddressScreen() {
  const navigation = useNavigation();

  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const fetchAddresses = async () => {
    setLoading(true);

    const res = await getAddresses(user?.userId);

    if (res.success) {
      setAddresses(res.data || []);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>


      <View style={styles.cardHeader}>

        <Text style={styles.type}>
          {item.type === "Other" && item.other
            ? item.other
            : item.type}
        </Text>

        <TouchableOpacity
          onPress={() => {
            setSelectedAddressId(item._id);
            setShowDeleteAlert(true);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#E53935" />
        </TouchableOpacity>

      </View>

      <Text style={styles.address}>
        {item.fullAddress}
      </Text>

      {item.landmark ? (
        <Text style={styles.subText}>
          Landmark: {item.landmark}
        </Text>
      ) : null}

    </View>
  );

  const handleDelete = async () => {

    const res = await deleteAddress({
      userId: user?.userId,
      addressId: selectedAddressId,
    });

    if (!res.success) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: res.message || "Something went wrong",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Address Deleted",
    });

    setShowDeleteAlert(false);
    setSelectedAddressId(null);

    fetchAddresses();
  };

  return (

    <SafeAreaView style={styles.container}>
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
            <Text style={styles.title}>Manage Address</Text>
            <Text style={styles.subtitle}>
              Your saved locations
            </Text>
          </View>
        </View>

        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No addresses found
            </Text>
          }
        />

        <TouchableOpacity
          style={styles.servizoBtn}
          onPress={() => navigation.navigate("AddAddressMap")}
        >
          <Text style={styles.servizoBtnText}>+ Add Address</Text>
        </TouchableOpacity>

      </View>

      <ServizoAlert
        visible={showDeleteAlert}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        onCancel={() => {
          setShowDeleteAlert(false);
          setSelectedAddressId(null);
        }}
        onConfirm={handleDelete}
      />



    </SafeAreaView>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    // marginBottom: 15,
  },



  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  type: {
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },

  address: {
    fontSize: 14,
    color: "#333",
  },

  subText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  formCard: {
    flex: 1,
    backgroundColor: COLORS.background2,
    borderRadius: 20,
    padding: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },

  servizoBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  servizoBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  iconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },

  icon: {
    width: 70,
    height: 70,
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    // marginTop: 2,
    marginLeft: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
});