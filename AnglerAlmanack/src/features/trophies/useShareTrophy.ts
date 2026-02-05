/**
 * @file useShareTrophy.ts
 * @description Custom hook for handling trophy sharing across platforms.
 * 
 * The "Growth Loop" Implementation:
 * When a user clicks "Share" on their phone, it generates a link to the Website Version.
 * This drives organic growth as users share their catches with friends on social media.
 * 
 * The Web version link is indexed by Google, bringing in free traffic.
 */

import { Share, Platform } from 'react-native';
import type { Trophy } from '../../types/trophy';

interface UseShareTrophyReturn {
  shareTrophy: (trophy: Trophy) => Promise<void>;
  isSupported: boolean;
}

/**
 * @hook useShareTrophy
 * @description Provides trophy sharing functionality optimized per platform.
 * 
 * - iOS: Generates a rich link preview with Open Graph tags
 * - Android: Includes full message with URL
 * - Web: Copies shareable link to clipboard
 * 
 * @param {string} baseUrl - Your domain (e.g., "https://yourfishingapp.com")
 * @returns {UseShareTrophyReturn} Object with shareTrophy function and isSupported flag
 * 
 * @example
 * const { shareTrophy } = useShareTrophy('https://fishingapp.com');
 * 
 * const handleShare = async () => {
 *   await shareTrophy(myTrophy);
 * };
 */
export const useShareTrophy = (
  baseUrl: string = 'https://yourfishingapp.com'
): UseShareTrophyReturn => {
  const isSupported = Platform.OS !== 'web' || typeof navigator !== 'undefined';

  /**
   * Generates a shareable URL for a trophy
   * @param trophyId - The UUID of the trophy
   * @returns Absolute URL to the trophy's public page
   */
  const getTrophyShareUrl = (trophyId: string): string => {
    return `${baseUrl}/trophy/${trophyId}`;
  };

  /**
   * Generates a share message with emoji and context
   * @param trophy - The trophy object
   * @returns Human-readable share message
   */
  const generateShareMessage = (trophy: Trophy): string => {
    const emoji = '🎣';
    return `${emoji} Check out this ${trophy.species} I just landed on Trophy Angler! 🏆`;
  };

  /**
   * Main share function - handles platform-specific sharing logic
   * @param trophy - The trophy to share
   */
  const shareTrophy = async (trophy: Trophy): Promise<void> => {
    try {
      const message = generateShareMessage(trophy);
      const url = getTrophyShareUrl(trophy.id);

      if (Platform.OS === 'web') {
        // Web: Copy to clipboard and show notification
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          console.log('Trophy link copied to clipboard:', url);
          // In a real app, show a toast notification here
        }
      } else {
        // Mobile (iOS/Android)
        await Share.share({
          // Android requires message + URL in the message string
          message: Platform.OS === 'android' 
            ? `${message}\n${url}` 
            : message,
          // iOS uses this for rich link preview
          url: url,
          title: `Shared ${trophy.species} Catch`
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'User did not share') {
        console.error('Error sharing trophy:', error);
        throw error;
      }
    }
  };

  return {
    shareTrophy,
    isSupported
  };
};

/**
 * Utility function to generate Open Graph tags for a trophy
 * Use this on your website when rendering the trophy detail page
 * 
 * @param trophy - The trophy object
 * @param baseUrl - Your domain
 * @returns Object with og: meta tags
 */
export const generateTrophyOpenGraph = (
  trophy: Trophy,
  baseUrl: string
) => {
  return {
    'og:title': `Big ${trophy.species} Caught on Trophy Angler!`,
    'og:description': `Landed at ${trophy.location_name} using ${trophy.bait || 'unknown bait'}. ${trophy.length}cm × ${trophy.width}cm`,
    'og:image': trophy.photo_url,
    'og:url': `${baseUrl}/trophy/${trophy.id}`,
    'og:type': 'article',
    'twitter:card': 'summary_large_image',
    'twitter:title': `Big ${trophy.species} - Trophy Angler`,
    'twitter:description': `Caught at ${trophy.location_name}`,
    'twitter:image': trophy.photo_url
  };
};
