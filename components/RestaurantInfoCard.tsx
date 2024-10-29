import React from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity } from 'react-native';

type RestaurantInfoCardProps = {
    name: string;
    address: string;
    phone: string;
    description: string;
    image: string;
    hours: string;  // Nueva prop para los horarios
    onClose: () => void; // Función para cerrar la tarjeta
};

const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({ name, address, phone, description, image, hours, onClose }) => {
    return (
        <View style={styles.card}> 
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.address}>{address}</Text>
            <Text style={styles.phone}>{phone}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15,
        padding: 16,
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
        color: 'white',
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    phone: {
        fontSize: 16,
        color: 'white',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: 'white',
        marginBottom: 10,
    },
    hours: {
        fontSize: 14,
        color: 'white',
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: 'white', // Puedes usar blanco para el contraste o tu color principal de fondo
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#EF4423', // Usa el color principal de la app para el texto
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RestaurantInfoCard;
