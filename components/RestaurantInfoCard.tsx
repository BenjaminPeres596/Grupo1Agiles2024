import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import RatingModal from './RatingModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestaurantMenu from './RestaurantMenu';

const API_URL = 'https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Comentarios';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU';


type RestaurantInfoCardProps = {
    restaurantId: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    image: string;
    onClose: () => void;
    onFavoriteUpdate: (favoriteIds: string[]) => void;
    moveToNextRestaurant: () => void;
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
    moveToNextRestaurant,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [comments, setComments] = useState<{ id: string; text: string }[]>([]);
    const [loading, setLoading] = useState(false);

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

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?restaurantId=eq.${restaurantId}&select=*`, {
                headers: {
                    apikey: API_KEY,
                    Authorization: `Bearer ${API_KEY}`,
                },
            });
            const data = await response.json();
            setComments(data.map((comment: any) => ({ id: comment.id, text: comment.comment_text })));
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (commentsVisible) {
            fetchComments();
        }
    }, [commentsVisible]);

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

            <View style={styles.overlay} />

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.heartButton} onPress={toggleFavorite}>
                <Icon name={isFavorite ? "heart" : "heart-o"} size={20} color="#FF4D4D" />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.address}>{address}</Text>
                <Text style={styles.phone}>{phone}</Text>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.buttonComments}
                        onPress={() => setCommentsVisible(true)}
                    >
                        <Icon name="comments" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Reseñas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonMenu}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Icon name="book" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Menú</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonQualify}
                        onPress={() => {
                            console.log("Botón Calificar presionado");
                            setModalVisible(true); // Abre el modal de calificación
                        }}
                    >
                        <Icon name="star" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Calificar</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={moveToNextRestaurant}
                >
                    <Icon name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <RatingModal
                    restaurantId={restaurantId}
                    restaurantName={name} // Pasa el nombre del restaurante
                    restaurantImage={image} // Pasa la imagen del restaurante
                    onClose={() => setModalVisible(false)}
                />
            </Modal>

            <Modal
                visible={menuVisible}
                animationType="slide"
                onRequestClose={() => setMenuVisible(false)}
            >
                <RestaurantMenu restaurantId={restaurantId} onClose={() => setMenuVisible(false)} />
            </Modal>

            <Modal
                visible={commentsVisible}
                animationType="slide"
                onRequestClose={() => setCommentsVisible(false)}
            >
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.closeModalButton}
                        onPress={() => setCommentsVisible(false)}
                    >
                        <Icon name="close" size={20} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Comentarios</Text>
                    {loading ? (
                        <Text>Cargando comentarios...</Text>
                    ) : (
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Text style={styles.comment}>{item.text}</Text>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 15,
        padding: 16,
        backgroundColor: 'transparent',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    heartButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    infoContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
        marginBottom: 4,
    },
    address: {
        fontSize: 16,
        color: '#E0E0E0',
        marginBottom: 2,
    },
    phone: {
        fontSize: 14,
        color: '#CFCFCF',
        marginBottom: 12,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        marginTop: 30,
    },
    buttonQualify: {
        backgroundColor: '#FF4D4D',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        flex: 1,
        marginRight: 6,
        shadowColor: '#FF4D4D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    buttonMenu: {
        backgroundColor: '#28A745',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        flex: 1,
        marginHorizontal: 6,
        shadowColor: '#28A745',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
        textAlign: 'center',
    },
    nextButton: {
        position: 'absolute',
        right: 0,
        bottom: 85,
        backgroundColor: '#FFD700',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    buttonComments: {
        backgroundColor: '#007BFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        flex: 1,
        marginLeft: 6,
        shadowColor: '#007BFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
    },
    closeModalButton: {
        alignSelf: 'flex-end',
        marginTop: 50,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    comment: {
        fontSize: 16,
        marginVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 8,
    },
});

export default RestaurantInfoCard;