import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { deleteAddress, getAddresses } from "../apis/authApi";
import ServizoBackButton from "../components/ServizoBackButton";
import ServizoLoader from "../components/ServizoLoader";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  bg: "#F7F5F0",
  card: "#FFFFFF",
  primary: "#1C1A17",
  accent: "#C4AA7A",
  muted: "#A89F8E",
  subtext: "#7A7263",
  bodyText: "#5A5449",
  border: "#EAE7E0",
  danger: "#E53935",
  dangerLight: "#FFF0F0",
  pill: "#F5F3EE",

  homeIcon: "#EEEDFE",
  homeStroke: "#534AB7",
  workIcon: "#E1F5EE",
  workStroke: "#0F6E56",
  otherIcon: "#FAECE7",
  otherStroke: "#993C1D",
};

const TYPE_META = {
  Home:  { bg: COLORS.homeIcon,  stroke: COLORS.homeStroke  },
  Work:  { bg: COLORS.workIcon,  stroke: COLORS.workStroke  },
  Other: { bg: COLORS.otherIcon, stroke: COLORS.otherStroke },
};

function TypeIcon({ type }) {
  const meta = TYPE_META[type] || TYPE_META.Other;
  return (
    <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}>
      <Ionicons
        name={
          type === "Home" ? "home-outline" :
          type === "Work" ? "briefcase-outline" : "location-outline"
        }
        size={16}
        color={meta.stroke}
      />
    </View>
  );
}

function AddressCard({ item, onPress, onDelete, selected }) {
  const label =
    item.type === "Other" && item.other ? item.other : item.type;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardTop}>
        <View style={styles.typeRow}>
          <TypeIcon type={item.type} />
          <Text style={styles.typeLabel}>{label}</Text>
        </View>
        <TouchableOpacity
          style={styles.trashBtn}
          onPress={(e) => { e.stopPropagation(); onDelete(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <Text style={styles.addrText}>{item.fullAddress}</Text>

      {item.landmark ? (
        <View style={styles.landmarkPill}>
          <Ionicons name="radio-button-on-outline" size={10} color={COLORS.subtext} />
          <Text style={styles.landmarkText}>{item.landmark}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function DeleteModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalIconWrap}>
            <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
          </View>

          <Text style={styles.modalTitle}>Delete address?</Text>
          <Text style={styles.modalBody}>
            This location will be permanently removed from your saved addresses.
          </Text>

          <TouchableOpacity style={styles.btnDelete} onPress={onConfirm}>
            <Text style={styles.btnDeleteText}>Yes, delete it</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
            <Text style={styles.btnCancelText}>Keep address</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function ManageAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onSelectAddress } = route.params || {};
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  const fetchAddresses = async () => {
    setLoading(true);
    const res = await getAddresses(user?.userId);
    if (res.success) setAddresses(res.data || []);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchAddresses(); }, []));

  const handleSelect = (item) => {
    setActiveCardId(item._id);
    if (onSelectAddress) {
      onSelectAddress({
        id: item._id,
        title: item.type === "Other" && item.other ? item.other : item.type,
        fullAddress: item.fullAddress,
        landmark: item.landmark,
        latitude: item.latitude,
        longitude: item.longitude,
        city: item.city,
      });
    }
    navigation.goBack();
  };

  const handleDelete = async () => {
    const res = await deleteAddress({
      userId: user?.userId,
      addressId: selectedAddressId,
    });

    if (!res.success) {
      Toast.show({ type: "error", text1: "Delete Failed", text2: res.message || "Something went wrong" });
      return;
    }

    Toast.show({ type: "success", text1: "Address Deleted" });
    setShowDeleteModal(false);
    setSelectedAddressId(null);
    fetchAddresses();
  };

  return (
    <SafeAreaView style={styles.container}>
     
      <View style={styles.topBar}>
        <ServizoBackButton />
      </View>

    
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Locations</Text>
        <Text style={styles.heroTitle}>
          Manage{" "}
          <Text style={styles.heroTitleItalic}>Address</Text>
        </Text>
        <Text style={styles.heroSub}>Tap to select · Trash to remove</Text>
      </View>

    
      <View style={styles.divider} />
      {!loading && (
        <Text style={styles.countBadge}>
          {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
        </Text>
      )}

    
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ marginTop: 40 }}>
            <ServizoLoader text="Fetching addresses..." />
          </View>
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AddressCard
                item={item}
                selected={activeCardId === item._id}
                onPress={() => handleSelect(item)}
                onDelete={() => {
                  setSelectedAddressId(item._id);
                  setShowDeleteModal(true);
                }}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No addresses saved yet</Text>
            }
          />
        )}
      </View>

    
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddAddressMap")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Add New Address</Text>
      </TouchableOpacity>

    
      <DeleteModal
        visible={showDeleteModal}
        onCancel={() => { setShowDeleteModal(false); setSelectedAddressId(null); }}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F0",
  },

  /* Top bar */
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* Hero */
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "300",
    color: COLORS.primary,
    lineHeight: 34,
  },
  heroTitleItalic: {
    fontStyle: "italic",
    fontWeight: "400",
    color: "#6B5E3F",
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 4,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.muted,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

 
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.subtext,
    fontSize: 14,
  },

 
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  cardSelected: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 0.1,
  },
  trashBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addrText: {
    fontSize: 13,
    color: COLORS.bodyText,
    lineHeight: 19,
    paddingLeft: 38,
  },
  landmarkPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.pill,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginLeft: 38,
  },
  landmarkText: {
    fontSize: 11,
    color: COLORS.subtext,
  },

  
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    margin: 16,
  },
  addBtnText: {
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
    borderRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: 36,
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
    backgroundColor: COLORS.dangerLight,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "300",
    color: COLORS.primary,
    marginBottom: 6,
  },
  modalBody: {
    fontSize: 13,
    color: COLORS.subtext,
    lineHeight: 20,
    marginBottom: 24,
  },
  btnDelete: {
    backgroundColor: COLORS.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  btnDeleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  btnCancel: {
    backgroundColor: "#F7F5F0",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnCancelText: {
    color: "#4A4640",
    fontSize: 14,
  },
});