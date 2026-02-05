import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { TrophyCard } from '../../packages/ui/src/components/TrophyCard';
import { useTrophies } from '../../features/trophy/src/hooks/useTrophies';

const ExploreScreen = () => {
  const { trophies, loading, error } = useTrophies();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading trophies: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Trophies</Text>
      <FlatList
        data={trophies}
        renderItem={({ item }) => <TrophyCard trophy={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default ExploreScreen;