import { gql, useQuery } from '@apollo/client';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

import { SignedIn, SignedOut, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { TextInput } from 'react-native';

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

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  const onSignInPress = async () => {
    if (!isSignInLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setSignInActive({ session: signInAttempt.createdSessionId });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onSignUpPress = async () => {
    if (!isSignUpLoaded) return;

    if (username.length < 4) {
      Alert.alert("Sign Up Error", "Username must be at least 4 characters long.");
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        username,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Sign Up Error", err.errors?.[0]?.message || err.message || "An unknown error occurred");
    }
  };

  const onPressVerify = async () => {
    if (!isSignUpLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === 'complete') {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.page}>

      {/* LOGIN SCREEN */}
      <SignedOut>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Bumpn</Text>
          <Text style={styles.subtitle}>Find the vibe. Join the party.</Text>

          {!pendingVerification && (
            <>
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email..."
                placeholderTextColor="#666"
                onChangeText={(email) => setEmailAddress(email)}
                style={styles.input}
              />
              {!isLoggingIn && (
                <TextInput
                  autoCapitalize="none"
                  value={username}
                  placeholder="Username..."
                  placeholderTextColor="#666"
                  onChangeText={(user) => setUsername(user)}
                  style={styles.input}
                />
              )}
              <TextInput
                value={password}
                placeholder="Password..."
                placeholderTextColor="#666"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
                style={styles.input}
              />
              {isLoggingIn ? (
                <>
                  <TouchableOpacity style={styles.loginButton} onPress={onSignInPress}>
                    <Text style={styles.loginText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.textButton} onPress={() => setIsLoggingIn(false)}>
                    <Text style={styles.textButtonText}>Need an account? Sign Up</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.loginButton} onPress={onSignUpPress}>
                    <Text style={styles.loginText}>Sign Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.textButton} onPress={() => setIsLoggingIn(true)}>
                    <Text style={styles.textButtonText}>Have an account? Sign In</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {pendingVerification && (
            <>
              <TextInput
                value={code}
                placeholder="Verification Code..."
                placeholderTextColor="#666"
                onChangeText={(code) => setCode(code)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.loginButton} onPress={onPressVerify}>
                <Text style={styles.loginText}>Verify Email</Text>
              </TouchableOpacity>
            </>
          )}
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
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textButton: {
    marginTop: 16,
    padding: 8,
  },
  textButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  }
});
