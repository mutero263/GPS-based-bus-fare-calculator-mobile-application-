import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// Import the correct type from expo-image-picker
type ImagePickerAsset = ImagePicker.ImagePickerAsset;

const Register = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idPicture, setIdPicture] = useState<ImagePickerAsset | null>(null);

  // Function to handle image selection
  const handleIdPictureChange = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "You need to grant permission to access your photos."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Image Picker Result:", result);

      if (result.canceled) {
        console.log("User canceled image picker");
        return;
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdPicture(result.assets[0]);
        console.log("Selected Image:", result.assets[0]);
      }
    } catch (error) {
      console.error("Error opening image picker:", error);
      Alert.alert("Failed to open image picker");
    }
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    const formData = new FormData();

    // Append text fields
    formData.append("name", name);
    formData.append("surname", surname);
    formData.append("email", email);
    formData.append("password", password);

    // Append the image file if available
    if (idPicture && idPicture.uri) {
      try {
        const response = await fetch(idPicture.uri);
        const blob = await response.blob();
        const filename = `${Date.now()}_${idPicture.fileName || "id.jpg"}`;
        formData.append("idPicture", blob, filename);
      } catch (error) {
        console.error("Error converting image to Blob:", error);
        Alert.alert("Failed to process the image");
        return;
      }
    }

    try {
      const response = await fetch("http://197.221.254.112:3000/add-record", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Registration successful!");
      } else {
        Alert.alert(result.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome To GPS based bus fare Calculator</Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Surname"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Upload ID Picture Button */}
      <TouchableOpacity
        style={styles.fileInput}
        onPress={handleIdPictureChange}
      >
        <Text style={styles.fileText}>
          {idPicture ? idPicture.fileName : "Upload ID Picture"}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "black",
  },
  input: {
    width: "70%",
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  fileInput: {
    width: "60%",
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  fileText: {
    color: "#666",
  },
  button: {
    backgroundColor: "#0A1A2F",
    padding: 14,
    borderRadius: 8,
    marginVertical: 8,
    width: "50%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Register;