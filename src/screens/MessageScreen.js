import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../utils/constants";

export default function MessageScreen({ route }) {
const user = route?.params?.user; // 👈 selected user

const [message, setMessage] = useState("");
const [messages, setMessages] = useState([
{ id: "1", text: "Hello 👋", sender: "other" },
{ id: "2", text: "Hi! How can I help you?", sender: "me" },
{ id: "3", text: "Need AC repair service", sender: "other" },
]);

// ✅ Send Message
const handleSend = () => {
if (!message.trim()) return;

```
const newMessage = {
  id: Date.now().toString(),
  text: message,
  sender: "me",
};

setMessages((prev) => [...prev, newMessage]);
setMessage("");
```

};

const renderItem = ({ item }) => (
<View
style={[
styles.messageContainer,
item.sender === "me" ? styles.myMessage : styles.otherMessage,
]}
>
<Text
style={[
styles.messageText,
item.sender === "me" && { color: "#fff" },
]}
>
{item.text} </Text> </View>
);

return ( <View style={styles.container}>


  
  <View style={styles.header}>
    <Ionicons name="person-circle-outline" size={36} color={COLORS.primary} />
    <Text style={styles.headerName}>
      {user?.name || "User"}
    </Text>
  </View>

  {/* Chat List */}
  <FlatList
    data={messages}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    contentContainerStyle={{ padding: 16 }}
  />

  
  <View style={styles.inputContainer}>
    <TextInput
      placeholder="Type a message..."
      value={message}
      onChangeText={setMessage}
      style={styles.input}
    />

    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
      <Ionicons name="send" size={20} color="#fff" />
    </TouchableOpacity>
  </View>

</View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#f5f5f5",
},

// 🔥 Header
header: {
flexDirection: "row",
alignItems: "center",
padding: 12,
backgroundColor: "#fff",
borderBottomWidth: 1,
borderColor: "#eee",
},

headerName: {
marginLeft: 10,
fontSize: 16,
fontWeight: "600",
},

// Messages
messageContainer: {
maxWidth: "75%",
padding: 10,
borderRadius: 12,
marginBottom: 10,
},

myMessage: {
alignSelf: "flex-end",
backgroundColor: COLORS.primary,
},

otherMessage: {
alignSelf: "flex-start",
backgroundColor: "#fff",
},

messageText: {
color: "#000",
},

// Input
inputContainer: {
flexDirection: "row",
alignItems: "center",
padding: 10,
backgroundColor: "#fff",
},

input: {
flex: 1,
backgroundColor: "#f1f1f1",
borderRadius: 20,
paddingHorizontal: 12,
height: 40,
},

sendBtn: {
marginLeft: 10,
backgroundColor: COLORS.primary,
padding: 10,
borderRadius: 20,
},
});
