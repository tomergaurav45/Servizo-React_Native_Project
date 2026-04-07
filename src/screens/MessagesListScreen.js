import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../utils/constants";

const users = [
{ id: "1", name: "Amit Sharma", lastMessage: "Hello 👋" },
{ id: "2", name: "Priya Verma", lastMessage: "Service done?" },
{ id: "3", name: "Rahul Kumar", lastMessage: "On the way" },
];

export default function MessagesListScreen({ navigation }) {

const renderItem = ({ item }) => (
<TouchableOpacity
style={styles.card}
onPress={() => navigation.navigate("MessageScreen", { user: item })}
> <View style={styles.row}> <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />

    <View style={{ marginLeft: 10 }}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </View>
  </View>
</TouchableOpacity>
);

return ( <View style={styles.container}>
<FlatList
data={users}
keyExtractor={(item) => item.id}
renderItem={renderItem}
/> </View>
);
}
const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#fff" },

card: {
padding: 15,
borderBottomWidth: 1,
borderColor: "#eee",
},
row: {
flexDirection: "row",
alignItems: "center",
},

name: {
fontSize: 16,
fontWeight: "600",
},

lastMessage: {
color: "#777",
marginTop: 2,
},
});
