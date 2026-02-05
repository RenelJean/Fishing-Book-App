/**
 * @file app/trophy/[id].tsx
 * @description Trophy detail page with full SEO support for web.
 * 
 * This page serves two purposes:
 * 1. Mobile: Deep link destination for sharing trophies
 * 2. Web: SEO-rich landing page that Google indexes
 * 
 * When users share a trophy, they generate a link to this page.
 * Google crawls public trophies, driving organic traffic.
 * 
 * To enable static rendering and SEO:
 * - Use getStaticParams() for generating static routes
 * - Use expo-router's <Head> for meta tags
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { CatchCard } from '../../src/components/shared/CatchCard';
import { useShareTrophy } from '../../src/features/trophies/useShareTrophy';
import { fetchTrophyById } from '../../src/services/supabaseClient';
import type { Trophy } from '../../src/types/trophy';

/**
 * Trophy Detail Page Component
 * 
 * The dynamic route parameter [id] is the trophy UUID.
 * This page is generated on-demand for each trophy.
 */
export default function TrophyDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { shareTrophy } = useShareTrophy('https://yourfishingapp.com');

  const [trophy, setTrophy] = useState<Trophy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid trophy ID');
      setLoading(false);
      return;
    }

    const loadTrophy = async () => {
      try {
        setLoading(true);
        const fetchedTrophy = await fetchTrophyById(id as string);
        
        if (!fetchedTrophy) {
          setError('Trophy not found. It may have been deleted or is not public.');
        } else {
          setTrophy(fetchedTrophy);
        }
      } catch (err) {
        setError('Failed to load trophy. Please try again.');
        console.error('Error loading trophy:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrophy();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Loading Trophy...',
            headerBackVisible: true
          }}
        />
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error || !trophy) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Trophy Not Found',
            headerBackVisible: true
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#cc0000" />
          <Text style={styles.errorText}>
            {error || 'Could not load this trophy'}
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await shareTrophy(trophy);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const formattedDate = new Date(trophy.caught_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      {/* Web: SEO Meta Tags */}
      {Platform.OS === 'web' && (
        <head>
          <title>{`${trophy.species.charAt(0).toUpperCase() + trophy.species.slice(1)} Caught on Trophy Angler`}</title>
          <meta
            name="description"
            content={`A ${trophy.length}cm × ${trophy.width}cm ${trophy.species} caught at ${trophy.location_name}. ${trophy.notes}`}
          />
          
          {/* Open Graph Tags for Social Media */}
          <meta property="og:title" content={`Big ${trophy.species} on Trophy Angler! 🏆`} />
          <meta property="og:description" content={`Landed at ${trophy.location_name} using ${trophy.bait || 'secret bait'}. Size: ${trophy.length}cm × ${trophy.width}cm`} />
          <meta property="og:image" content={trophy.photo_url} />
          <meta property="og:url" content={`https://yourfishingapp.com/trophy/${trophy.id}`} />
          <meta property="og:type" content="article" />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`Big ${trophy.species} Caught!`} />
          <meta name="twitter:description" content={`Trophy from ${trophy.location_name}`} />
          <meta name="twitter:image" content={trophy.photo_url} />
          
          {/* Structured Data for Google Search */}
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: `${trophy.species} Catch Log`,
              description: trophy.notes,
              image: trophy.photo_url,
              datePublished: trophy.caught_at,
              author: {
                '@type': 'Person',
                name: 'Trophy Angler User'
              },
              articleBody: `Caught a ${trophy.length}cm × ${trophy.width}cm ${trophy.species} at ${trophy.location_name}.`
            })}
          </script>
        </head>
      )}

      <Stack.Screen
        options={{
          headerShown: true,
          title: trophy.species,
          headerBackVisible: true,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleShare}
              style={styles.shareButton}
            >
              <Ionicons name="share-social" size={24} color="#0066cc" />
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Main Trophy Card */}
        <CatchCard trophy={trophy} variant="full" />

        {/* Additional Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Catch Details</Text>

          {/* Date Caught */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date Caught:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          {/* Dimensions */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dimensions:</Text>
            <Text style={styles.detailValue}>
              {trophy.length}cm (L) × {trophy.width}cm (W)
              {trophy.weight && ` • ${trophy.weight}kg`}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{trophy.location_name}</Text>
          </View>

          {/* Coordinates */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Coordinates:</Text>
            <Text style={styles.detailValue}>
              {trophy.latitude.toFixed(4)}°N, {trophy.longitude.toFixed(4)}°E
            </Text>
          </View>

          {/* Bait */}
          {trophy.bait && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bait Used:</Text>
              <Text style={styles.detailValue}>{trophy.bait}</Text>
            </View>
          )}

          {/* Water Temperature */}
          {trophy.water_temp && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Water Temp:</Text>
              <Text style={styles.detailValue}>{trophy.water_temp}°C</Text>
            </View>
          )}

          {/* Notes */}
          {trophy.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.detailLabel}>Angler's Notes:</Text>
              <Text style={styles.notesText}>{trophy.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.shareButtonFull]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.buttonText}>Share This Catch</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.backButtonSecondary]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonTextSecondary}>Back to Feed</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
    textAlign: 'center'
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center'
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  shareButton: {
    marginRight: 16,
    padding: 8
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 }
        }
      : { elevation: 2 }
    )
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16
  },
  detailRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  detailValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500'
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 0,
    borderBottomWidth: 0
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic'
  },
  actionButtons: {
    marginTop: 24,
    gap: 12
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  shareButtonFull: {
    backgroundColor: '#0066cc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  backButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066cc'
  },
  backButtonTextSecondary: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600'
  }
});
