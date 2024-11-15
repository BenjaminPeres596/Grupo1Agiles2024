import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from 'react-native-star-rating-widget';

type RatingModalProps = {
    restaurantId: string;
    onClose: () => void;
};

const RatingModal: React.FC<RatingModalProps> = ({
    restaurantId = '',
    onClose = () => {},
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchRatingData = async () => {
            const data = await AsyncStorage.getItem(`restaurant_${restaurantId}`);
            if (data) {
                const parsedData = JSON.parse(data);
                setRating(Math.round(parsedData.rating));
                setComment(parsedData.comment || '');
            }
        };
        fetchRatingData();
    }, [restaurantId]);

    const handleSaveRating = async () => {
        const ratingData = {
             // Cambia "some_column" por el nombre real de la columna para el rating
            comment_text: comment, // Cambia "other_column" por el nombre real de la columna para el comentario
            restaurantId: restaurantId, // Supón que tienes una columna para vincular al restaurante
        };
    
        try {
            // Guardar en la base de datos Supabase
            const response = await fetch('https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Comentarios', {
                method: 'POST',
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify(ratingData),
            });
    
            if (response.ok) {
                console.log('Comentario guardado en la base de datos:', ratingData);
            } else {
                console.error('Error al guardar el comentario en la base de datos:', await response.text());
            }
    
            // Guardar en AsyncStorage
            const localRatingData = {
                rating,
            };
    
            await AsyncStorage.setItem(`restaurant_${restaurantId}`, JSON.stringify(localRatingData));
            console.log(`Datos de calificación guardados localmente para el restaurante ID: ${restaurantId}`, localRatingData);
    
            // Cerrar el modal
            onClose();
        } catch (error) {
            console.error('Error al guardar el comentario:', error);
        }
    };

    return (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Califica el Restaurante</Text>
            <StarRating
                rating={rating}
                onChange={setRating}
                starSize={40}
                color="#FFD700"
                style={styles.starRating}
            />
            <TextInput
                style={styles.commentInput}
                placeholder="Escribe un comentario..."
                value={comment}
                onChangeText={setComment}
                multiline
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSaveRating}>
                    <Text style={styles.buttonText}>GUARDAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onClose}>
                    <Text style={styles.buttonText}>CANCELAR</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RatingModal;

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    starRating: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
