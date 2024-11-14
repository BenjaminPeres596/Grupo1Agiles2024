import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from 'react-native';
import RatingModal from './RatingModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestaurantMenu from './RestaurantMenu';

type RestaurantInfoCardProps = {
    restaurantId: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    image: string;
    onClose: () => void;
    onFavoriteUpdate: (favoriteIds: string[]) => void;
};

const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({
    restaurantId,
    name,
    address,
    phone,
    description,
    image,
    onClose,
    onFavoriteUpdate,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const favoriteIds = await AsyncStorage.getItem('favoriteRestaurants');
                if (favoriteIds) {
                    const favorites = JSON.parse(favoriteIds);
                    setIsFavorite(favorites.includes(restaurantId));
                }
            } catch (error) {
                console.error("Error fetching favorite status:", error);
            }
        };
        fetchFavoriteStatus();
    }, [restaurantId]);
    
    const toggleFavorite = async () => {
        try {
            const favoriteIds = await AsyncStorage.getItem('favoriteRestaurants');
            const favorites = favoriteIds ? JSON.parse(favoriteIds) : [];
            const newFavoriteStatus = !isFavorite;
    
            if (newFavoriteStatus) {
                if (!favorites.includes(restaurantId)) {
                    favorites.push(restaurantId);
                }
            } else {
                const index = favorites.indexOf(restaurantId);
                if (index > -1) {
                    favorites.splice(index, 1);
                }
            }
    
            await AsyncStorage.setItem('favoriteRestaurants', JSON.stringify(favorites));
            setIsFavorite(newFavoriteStatus);
            onFavoriteUpdate(favorites);
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
                    style={styles.buttonQualify}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.buttonText}>Calificar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.buttonMenu}
                    onPress={() => setMenuVisible(true)}
                >
                    <Text style={styles.buttonText}>Ver Menú</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={onClose}
                >
                    <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
            
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <RatingModal restaurantId={restaurantId} onClose={() => setModalVisible(false)} />
            </Modal>

            <Modal
                visible={menuVisible}
                animationType="slide"
                onRequestClose={() => setMenuVisible(false)}
            >
                <RestaurantMenu restaurantId={restaurantId} onClose={() => setMenuVisible(false)} />
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
        padding: 8,
        backgroundColor: '#EF4423',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: -8,
    },
    heartButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 25,
        padding: 5,
        elevation: 5,
    },
    infoContainer: {
        padding: 8,
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        marginBottom: -1,
    },
    address: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 1,
    },
    phone: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    buttonQualify: {
        backgroundColor: '#FF4D4D',
        padding: 6,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 7,
    },
    buttonMenu: {
        backgroundColor: '#28A745',
        padding: 6,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 7,
    },
    buttonClose: {
        backgroundColor: '#0D73AB',
        padding: 6,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
