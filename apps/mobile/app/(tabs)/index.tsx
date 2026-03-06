import { gql, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

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

import { SignedIn, SignedOut, useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Modal, Pressable, TextInput } from 'react-native';

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
  const { signOut } = useAuth();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Create a pulsing animation for the user pin
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.4, { duration: 1000 }),
              withTiming(1, { duration: 1000 })
            ),
            -1,
            true
          ),
        },
      ],
      opacity: withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      ),
    };
  });

  return (
    <View style={styles.page}>

      {/* LOGIN SCREEN */}
      <SignedOut>
        <LinearGradient
          colors={['#0f0c29', '#302b63', '#24243e']}
          style={styles.loginPageGradient}
        >
          <View style={styles.loginContainer}>
            <View style={styles.brandingContainer}>
              <Text style={styles.title}>Bumpn</Text>
              <Text style={styles.subtitle}>Find the vibe. Join the party.</Text>
            </View>

            <BlurView intensity={40} tint="dark" style={styles.authCard}>
              {!pendingVerification && (
                <>
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    onChangeText={(email) => setEmailAddress(email)}
                    style={styles.premiumInput}
                  />
                  {!isLoggingIn && (
                    <TextInput
                      autoCapitalize="none"
                      value={username}
                      placeholder="Username"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      onChangeText={(user) => setUsername(user)}
                      style={styles.premiumInput}
                    />
                  )}
                  <TextInput
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                    style={styles.premiumInput}
                  />
                  {isLoggingIn ? (
                    <>
                      <TouchableOpacity onPress={onSignInPress}>
                        <LinearGradient
                          colors={['#FF2A54', '#FF5E3A']}
                          style={styles.primaryAuthButton}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.loginText}>Sign In</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.textButton} onPress={() => setIsLoggingIn(false)}>
                        <Text style={styles.textButtonText}>Need an account? <Text style={{ color: '#00F0FF', fontWeight: 'bold' }}>Sign Up</Text></Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={onSignUpPress}>
                        <LinearGradient
                          colors={['#8A2BE2', '#4169E1']}
                          style={styles.primaryAuthButton}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.loginText}>Sign Up</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.textButton} onPress={() => setIsLoggingIn(true)}>
                        <Text style={styles.textButtonText}>Have an account? <Text style={{ color: '#00F0FF', fontWeight: 'bold' }}>Sign In</Text></Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}

              {pendingVerification && (
                <>
                  <Text style={styles.verificationPrompt}>Enter the 6-digit code sent to your email.</Text>
                  <TextInput
                    value={code}
                    placeholder="000000"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    onChangeText={(code) => setCode(code)}
                    style={[styles.premiumInput, styles.verificationInput]}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity onPress={onPressVerify}>
                    <LinearGradient
                      colors={['#8A2BE2', '#4169E1']}
                      style={styles.primaryAuthButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.loginText}>Verify Email</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </BlurView>
          </View>
        </LinearGradient>
      </SignedOut>

      {/* MAIN MAP SCREEN */}
      <SignedIn>
        <View style={styles.container}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Dark}
            logoEnabled={false}
            compassEnabled={false}
            attributionEnabled={false}
          >
            {userLocation && (
              <Mapbox.Camera
                zoomLevel={13}
                centerCoordinate={userLocation}
                animationMode="flyTo"
                animationDuration={2500}
                pitch={45} // Adds a nice 3D perspective to the premium design
              />
            )}

            {userLocation && (
              <Mapbox.PointAnnotation
                id="user-location"
                coordinate={userLocation}
              >
                <View style={styles.userDotContainer}>
                  <Animated.View style={[styles.userDotPulse, pulseStyle]} />
                  <View style={styles.userDot} />
                </View>
              </Mapbox.PointAnnotation>
            )}

            {data?.nearbyParties?.map((party: any) => (
              <Mapbox.PointAnnotation
                key={party.id}
                id={party.id}
                coordinate={party.location.coordinates}
              >
                <View style={styles.partyPinContainer}>
                  <LinearGradient
                    colors={['#FF2A54', '#FF5E3A']}
                    style={styles.partyGlow}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="flame" size={14} color="white" />
                    <Text style={styles.pinText}>{party.vibeScore}</Text>
                  </LinearGradient>
                  <View style={styles.partyPinTail} />
                </View>
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>

          {/* Floating Premium Header Overlay */}
          <BlurView intensity={80} tint="dark" style={styles.floatingHeader}>
            <Text style={styles.floatingTitle}>The Vibe</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {data?.nearbyParties?.length || 0} Parties
              </Text>
            </View>
          </BlurView>

          {/* Action Menu Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={isMenuOpen}
            onRequestClose={() => setIsMenuOpen(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setIsMenuOpen(false)}>
              <BlurView intensity={60} tint="dark" style={styles.actionMenu}>

                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setIsMenuOpen(false);
                  Alert.alert("Coming Soon", "Party Hosting will be added in Phase 9!");
                }}>
                  <LinearGradient
                    colors={['#FF2A54', '#FF5E3A']}
                    style={styles.menuIconGradient}
                  >
                    <Ionicons name="flame" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.menuText}>Host a Party</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={async () => {
                  setIsMenuOpen(false);
                  await signOut();
                }}>
                  <LinearGradient
                    colors={['#333', '#111']}
                    style={styles.menuIconGradient}
                  >
                    <Ionicons name="log-out" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.menuText}>Sign Out</Text>
                </TouchableOpacity>

              </BlurView>
            </Pressable>
          </Modal>

          {/* Floating Action Button */}
          <View style={styles.floatingActionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsMenuOpen(true)}
            >
              <LinearGradient
                colors={['#8A2BE2', '#4169E1']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={isMenuOpen ? "close" : "add"} size={32} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

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
    backgroundColor: '#0a0a0a'
  },
  map: {
    flex: 1,
  },
  userDotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  userDotPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00F0FF',
  },
  userDot: {
    height: 18,
    width: 18,
    backgroundColor: '#00F0FF',
    borderRadius: 9,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  partyPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -15 }]
  },
  partyGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF2A54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  partyPinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF5E3A',
    shadowColor: '#FF2A54',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 4,
    fontVariant: ['tabular-nums']
  },
  floatingHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  floatingTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerBadgeText: {
    color: '#00F0FF',
    fontWeight: '700',
    fontSize: 13,
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  actionButton: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  actionGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 120, // Sit above the floating button
  },
  actionMenu: {
    width: '85%',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  loginPageGradient: {
    flex: 1,
    width: '100%',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  authCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  premiumInput: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  verificationPrompt: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  verificationInput: {
    textAlign: 'center',
    fontSize: 32,
    letterSpacing: 8,
    fontWeight: '700',
  },
  primaryAuthButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textButton: {
    marginTop: 24,
    padding: 8,
    alignItems: 'center',
  },
  textButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '500',
  }
});
