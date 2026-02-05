import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrophyDetail = ({ trophy }) => {
    if (!trophy) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No trophy details available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{trophy.name}</Text>
            <Text style={styles.description}>{trophy.description}</Text>
            <Text style={styles.date}>Date Caught: {trophy.dateCaught}</Text>
            <Text style={styles.size}>Size: {trophy.size} lbs</Text>
            <Text style={styles.location}>Location: {trophy.location}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginVertical: 10,
    },
    date: {
        fontSize: 14,
        color: '#555',
    },
    size: {
        fontSize: 14,
        color: '#555',
    },
    location: {
        fontSize: 14,
        color: '#555',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
    },
});

export default TrophyDetail;