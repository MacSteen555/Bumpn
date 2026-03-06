import { gql, useQuery } from '@apollo/client';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || 'pk.placeholder');

const GET_NEARBY_PARTIES = gql`
  query GetNearbyParties($longitude: Float!, $latitude: Float!) {
    nearbyParties(longitude: $longitude, latitude: $latitude) {
      id
      title
      vibeScore
      location {
        coordinates
      }
    }
  }
`;

import { SignedIn, SignedOut, useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

WebBrowser.maybeCompleteAuthSession();

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<number[] | null>(null);

  // NOTE: In an actual app, you want to handle these permissions better, 
  // but for the MVP we will just request them on mount.
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation([location.coords.longitude, location.coords.latitude]);
    })();
  }, []);

  const { data, loading, error } = useQuery(GET_NEARBY_PARTIES, {
    variables: {
      longitude: userLocation?.[0] || 0,
      latitude: userLocation?.[1] || 0
    },
    skip: !userLocation,
  });

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPressLogin = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'bumpn' }),
      });

      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, []);

  return (
    <View style={styles.page}>

      {/* LOGIN SCREEN */}
      <SignedOut>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Bumpn</Text>
          <Text style={styles.subtitle}>Find the vibe. Join the party.</Text>

          <TouchableOpacity style={styles.loginButton} onPress={onPressLogin}>
            <Text style={styles.loginText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </SignedOut>

      {/* MAIN MAP SCREEN */}
      <SignedIn>
        <View style={styles.container}>
          <Mapbox.MapView style={styles.map}>
            {userLocation && (
              <Mapbox.Camera
                zoomLevel={12}
                centerCoordinate={userLocation}
                animationMode="flyTo"
                animationDuration={2000}
              />
            )}

            {userLocation && (
              <Mapbox.PointAnnotation
                id="user-location"
                coordinate={userLocation}
              >
                <View style={styles.userDot} />
              </Mapbox.PointAnnotation>
            )}

            {data?.nearbyParties?.map((party: any) => (
              <Mapbox.PointAnnotation
                key={party.id}
                id={party.id}
                coordinate={party.location.coordinates}
              >
                <View style={styles.partyPin}>
                  <Text style={styles.pinText}>🔥 {party.vibeScore}</Text>
                </View>
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>
        </View>
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  userDot: {
    height: 20,
    width: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 3,
  },
  partyPin: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderColor: 'white',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  pinText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0a0a0a'
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 48
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center'
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  }
});
