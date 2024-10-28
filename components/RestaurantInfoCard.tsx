import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';

type RestaurantInfoCardProps = {
    name: string;
    address: string;
    phone: string;
    description: string;
    image: string;
    onClose: () => void; // Función para cerrar la tarjeta
};

const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({ name, address, phone, description, image, onClose }) => {
    return (
        <View style={styles.card}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.address}>{address}</Text>
            <Text style={styles.phone}>{phone}</Text>
            <Text style={styles.description}>{description}</Text>
            <Button title="Cerrar" onPress={onClose} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15,
        padding: 12,
        backgroundColor: '#EF4423',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    phone: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
});

export default RestaurantInfoCard;
