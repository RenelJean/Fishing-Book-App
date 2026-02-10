/**
 * @file CatchCard.tsx
 * @component CatchCard
 * @description Standardized display component for a catch record.
 * 
 * On mobile: Renders as a beautiful card with shadow and elevation.
 * On web: Can be rendered as part of a landing page with SEO richness.
 * 
 * This is the visual centerpiece of the Trophy Angler platform.
 * Handles responsive design across all platforms.
 */

import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { Ruler, MapPin, Calendar } from 'lucide-react-native';
import type { Trophy } from '../../types/trophy';

interface CatchCardProps {
  trophy: Trophy;
  onPress?: () => void;
  variant?: 'compact' | 'full';
}

/**
 * @component CatchCard
 * @param {CatchCardProps} props - Component props
 * @returns {JSX.Element} The rendered catch card
 * 
 * @example
 * <CatchCard 
 *   trophy={myTrophy} 
 *   onPress={() => navigate(`/trophy/${myTrophy.id}`)}
 * />
 */
export const CatchCard = ({ 
  trophy, 
  onPress, 
  variant = 'full' 
}: CatchCardProps) => {
  const formattedDate = new Date(trophy.caught_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <View 
      style={[
        styles.card,
        variant === 'compact' && styles.compactCard
      ]}
      onTouchEnd={onPress}
    >
      {/* Hero Image */}
      <Image 
        source={{ uri: trophy.photo_url }} 
        style={[
          styles.image,
          variant === 'compact' && styles.compactImage
        ]}
        resizeMode="cover"
      />

      {/* Content Section */}
      <View style={styles.content}>
        {/* Species Title */}
        <Text style={styles.title}>
          {trophy.species.charAt(0).toUpperCase() + trophy.species.slice(1)}
        </Text>

        {/* Size Stats */}
        <View style={styles.statRow}>
          <Ruler size={16} color="#666" />
          <Text style={styles.statText}>
            {trophy.length}cm × {trophy.width}cm
            {trophy.weight && ` • ${trophy.weight}kg`}
          </Text>
        </View>

        {/* Location Stat */}
        <View style={styles.statRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.statText}>{trophy.location_name}</Text>
        </View>

        {/* Date Stat */}
        <View style={styles.statRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.statText}>{formattedDate}</Text>
        </View>

        {/* Bait (if available) */}
        {trophy.bait && (
          <View style={styles.baitBadge}>
            <Text style={styles.baithText}>Bait: {trophy.bait}</Text>
          </View>
        )}

        {/* Notes Section */}
        {trophy.notes && (
          <Text style={styles.notes}>
            "{trophy.notes}"
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    // Platform-specific elevation
    ...(Platform.OS === 'ios' 
      ? {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 }
        }
      : {
          elevation: 3
        }
    )
  },
  compactCard: {
    marginBottom: 12,
    borderRadius: 8
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0'
  },
  compactImage: {
    height: 180
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  statText: {
    color: '#444',
    fontSize: 14,
    flex: 1
  },
  baithText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500'
  },
  baitBadge: {
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  notes: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
    lineHeight: 20
  }
});

// Export for use in different contexts
export default CatchCard;
