import { CameraView, useCameraPermissions } from 'expo-camera';
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
                <Image source={{ uri: photo }} style={{ flex: 1 }} />
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.button} onPress={() => setPhoto(null)}>
                        <Text style={styles.text}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonPrimary} onPress={uploadPhoto}>
                        <Text style={styles.text}>Post</Text>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 64,
    },
    captureButton: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 8,
        margin: 8,
        alignItems: 'center'
    },
    buttonPrimary: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        margin: 8,
        alignItems: 'center',
        flex: 1
    },
    controls: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 16
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
