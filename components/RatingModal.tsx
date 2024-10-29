import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AirbnbRating } from 'react-native-ratings';
import { CheckBox } from '@rneui/themed';

type RatingModalProps = {
    restaurantId: number;
    onClose: () => void;
};

const RatingModal: React.FC<RatingModalProps> = ({ restaurantId, onClose }) => {
    const [rating, setRating] = useState(0);
    const [isVegan, setIsVegan] = useState(false);
    const [isVegetarian, setIsVegetarian] = useState(false);
    const [isGlutenFree, setIsGlutenFree] = useState(false);

    useEffect(() => {
        const fetchRatingData = async () => {
            const data = await AsyncStorage.getItem(`restaurant_${restaurantId}`);
            if (data) {
                const parsedData = JSON.parse(data);
                setRating(parsedData.rating);
                setIsVegan(parsedData.isVegan);
                setIsVegetarian(parsedData.isVegetarian);
                setIsGlutenFree(parsedData.isGlutenFree);
            }
        };
        fetchRatingData();
    }, [restaurantId]);

    const handleSaveRating = async () => {
        const ratingData = {
            rating,
            isVegan,
            isVegetarian,
            isGlutenFree,
        };
        await AsyncStorage.setItem(`restaurant_${restaurantId}`, JSON.stringify(ratingData));
        onClose();
    };

    return (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Califica el Restaurante</Text>
            <AirbnbRating
                count={5}
                defaultRating={rating}
                onFinishRating={setRating}
                size={20}
            />
            <CheckBox
                title="Opciones Veganas"
                checked={isVegan}
                onPress={() => setIsVegan(!isVegan)}
            />
            <CheckBox
                title="Opciones Vegetarianas"
                checked={isVegetarian}
                onPress={() => setIsVegetarian(!isVegetarian)}
            />
            <CheckBox
                title="Opciones Sin Gluten"
                checked={isGlutenFree}
                onPress={() => setIsGlutenFree(!isGlutenFree)}
            />
            <Button title="Guardar" onPress={handleSaveRating} />
            <Button title="Cancelar" onPress={onClose} />
        </View>
    );
};

export default RatingModal;

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});
