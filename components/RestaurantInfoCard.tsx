import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Button,
    Modal,
    TouchableOpacity,
} from 'react-native';
import RatingModal from './RatingModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RestaurantInfoCardProps = {
    restaurantId: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    image: string;
    onClose: () => void;
};

const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({
    restaurantId,
    name,
    address,
    phone,
    description,
    image,
    onClose,
}) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const favoriteStatus = await AsyncStorage.getItem(`favorite_${restaurantId}`);
                if (favoriteStatus !== null) {
                    setIsFavorite(JSON.parse(favoriteStatus));
                }
            } catch (error) {
                console.error("Error fetching favorite status:", error);
            }
        };
        fetchFavoriteStatus();
    }, [restaurantId]);

    const toggleFavorite = async () => {
        try {
            const newFavoriteStatus = !isFavorite;
            setIsFavorite(newFavoriteStatus);
            await AsyncStorage.setItem(`favorite_${restaurantId}`, JSON.stringify(newFavoriteStatus));
        } catch (error) {
            console.error("Error saving favorite status:", error);
        }
    };

    return (
        <View style={styles.card}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

            <TouchableOpacity style={styles.heartButton} onPress={toggleFavorite}>
                <Icon name={isFavorite ? "heart" : "heart-o"} size={24} color="#FF4D4D" />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.address}>{address}</Text>
                <Text style={styles.phone}>{phone}</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.buttonText}>Calificar</Text>
                </TouchableOpacity>
                <Button title="Cerrar" color="#FF4D4D" onPress={onClose} />
            </View>
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <RatingModal restaurantId={restaurantId} onClose={() => setModalVisible(false)} />
            </Modal>
        </View>
    );
};

export default RestaurantInfoCard;

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15,
        padding: 8, // Reducido el padding
        backgroundColor: '#EF4423', // Fondo del card
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 }, // Altura de la sombra reducida
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4, // Elevación reducida
    },
    image: {
        width: '100%',
        height: 180, // Reducido el tamaño de la imagen
        borderRadius: 8,
    },
    heartButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Fondo opcional para el botón
        borderRadius: 25,
        padding: 5,
        elevation: 5, // Para dar sombra
    },
    infoContainer: {
        padding: 8, // Reducido el padding
    },
    title: {
        fontSize: 20, // Reducido el tamaño de la fuente
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4, // Reducido el margen
    },
    address: {
        fontSize: 14, // Reducido el tamaño de la fuente
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    phone: {
        fontSize: 14, // Reducido el tamaño de la fuente
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 8, // Reducido el padding
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14, // Reducido el tamaño de la fuente
        fontWeight: 'bold',
    },
});
