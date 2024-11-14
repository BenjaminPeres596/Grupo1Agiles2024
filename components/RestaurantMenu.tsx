import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';

type Plato = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
};

type RestaurantMenuProps = {
    restaurantId: string;
    onClose: () => void;
};

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ restaurantId, onClose }) => {
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [restaurantName, setRestaurantName] = useState('');
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU";
    const platosUrl = `https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Platos?select=*&restaurantId=eq.${restaurantId}`;
    const restaurantUrl = `https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Restaurantes?id=eq.${restaurantId}`;

    useEffect(() => {
        const fetchPlatos = async () => {
            try {
                const response = await fetch(platosUrl, {
                    headers: {
                        apikey: apiKey,
                        Authorization: `Bearer ${apiKey}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Error en la solicitud de platos');
                }
                const data = await response.json();
                setPlatos(data);
            } catch (error) {
                console.error("Error fetching platos:", error);
            }
        };

        const fetchRestaurantName = async () => {
            try {
                const response = await fetch(restaurantUrl, {
                    headers: {
                        apikey: apiKey,
                        Authorization: `Bearer ${apiKey}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Error en la solicitud del restaurante');
                }
                const data = await response.json();
                setRestaurantName(data[0]?.name || 'Restaurante');
            } catch (error) {
                console.error("Error fetching restaurant name:", error);
            }
        };

        fetchPlatos();
        fetchRestaurantName();
    }, [restaurantId]);

    return (
        <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú de {restaurantName}</Text>
            <FlatList
                data={platos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.PlatoContainer}>
                        <Image source={{ uri: item.image }} style={styles.PlatoImage} />
                        <View style={styles.PlatoInfo}>
                            <Text style={styles.PlatoName}>{item.name}</Text>
                            <Text style={styles.PlatoDescription}>{item.description}</Text>
                            <Text style={styles.PlatoPrice}>${item.price}</Text>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
                <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RestaurantMenu;

const styles = StyleSheet.create({
    menuContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FAFAFA',
    },
    menuTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#2D3436',
        borderBottomWidth: 2,
        borderBottomColor: '#00B894',
        paddingBottom: 8,
    },
    PlatoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderLeftWidth: 5,
        borderLeftColor: '#00B894',
    },
    PlatoImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginRight: 15,
    },
    PlatoInfo: {
        flex: 1,
    },
    PlatoName: {
        fontSize: 22,
        fontWeight: '600',
        color: '#2D3436',
    },
    PlatoDescription: {
        fontSize: 14,
        color: '#636E72',
        marginTop: 4,
    },
    PlatoPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00B894',
        marginTop: 8,
    },
    buttonClose: {
        backgroundColor: '#E63946',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
