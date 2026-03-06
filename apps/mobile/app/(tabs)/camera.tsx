import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PartyCamScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const photoData = await cameraRef.current.takePictureAsync({
                base64: false,
            });
            if (photoData) {
                setPhoto(photoData.uri);
            }
        }
    };

    const uploadPhoto = async () => {
        // This will implement the multipart upload to our `/api/upload` endpoint
        // and then call the GraphQL mutation to create the Post
        console.log("Uploading photo from:", photo);
        setPhoto(null);
    }

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.fullscreenImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.bottomGradient}
                >
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.retakeButton} onPress={() => setPhoto(null)}>
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={uploadPhoto} style={{ flex: 1, marginLeft: 16 }}>
                            <LinearGradient
                                colors={['#FF2A54', '#FF5E3A']}
                                style={styles.postGradientButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.postText}>Post to Party</Text>
                                <Ionicons name="send" size={20} color="white" style={{ marginLeft: 8 }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    fullscreenImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        justifyContent: 'flex-end',
        paddingBottom: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    captureButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    captureButtonInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 8,
        margin: 8,
        alignItems: 'center'
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    retakeButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postGradientButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF2A54',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    postText: {
        fontSize: 18,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 0.5,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
