import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { fetchTrophies } from '../../../services/trophyService';
import TrophyCard from '../../../packages/ui/src/components/TrophyCard';

const TrophyList = () => {
  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTrophies = async () => {
      try {
        const data = await fetchTrophies();
        setTrophies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTrophies();
  }, []);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={trophies}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <TrophyCard trophy={item} />}
    />
  );
};

export default TrophyList;