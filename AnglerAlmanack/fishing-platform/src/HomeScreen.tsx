import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();

    const navigateToExplore = () => {
        navigation.navigate('Explore');
    };

    const navigateToTrophy = () => {
        navigation.navigate('Trophy');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to the Fishing Platform!</Text>
            <Button title="Explore Fishing Spots" onPress={navigateToExplore} />
            <Button title="View Trophies" onPress={navigateToTrophy} style={{ marginTop: 10 }} />
        </View>
    );
};

export default HomeScreen;