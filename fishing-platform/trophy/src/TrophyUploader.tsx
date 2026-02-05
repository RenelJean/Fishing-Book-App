import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadTrophyData } from '../hooks/useTrophies';

const TrophyUploader = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (title && description && image) {
      const trophyData = { title, description, image };
      await uploadTrophyData(trophyData);
      // Reset the form
      setTitle('');
      setDescription('');
      setImage(null);
    } else {
      alert('Please fill in all fields and select an image.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Trophy</Text>
      <TextInput
        style={styles.input}
        placeholder="Trophy Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Pick an image from camera roll" onPress={handleImagePick} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Upload Trophy" onPress={handleUpload} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
});

export default TrophyUploader;