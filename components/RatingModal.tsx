import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from 'react-native-star-rating-widget';
import { Image } from 'react-native';


type RatingModalProps = {
    restaurantId: string;
    restaurantName: string;
    restaurantImage: string;
    onClose: () => void;
};


const RatingModal: React.FC<RatingModalProps> = ({
    restaurantId = '',
    restaurantName = 'Restaurante', // Valor predeterminado
    restaurantImage = '', // Valor predeterminado
    onClose = () => { },
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
            <View style={styles.restaurantDetailsContainer}>
                <Image
                    source={{ uri: restaurantImage }} // Asegúrate de pasar la URL de la imagen
                    style={styles.restaurantImage}
                />
                <View>
                    <Text style={styles.restaurantName}>{restaurantName}</Text>
                    <Text style={styles.restaurantCategory}>Comida saludable</Text>
                </View>
            </View>

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
                <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                    <Text style={styles.buttonTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSubmit} onPress={handleSaveRating}>
                    <Text style={styles.buttonTextSubmit}>Enviar</Text>
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
        padding: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        bottom: 60,
       
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EF4423', // Naranja para destacar
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    restaurantDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    restaurantImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 12,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    restaurantCategory: {
        fontSize: 14,
        color: '#666',
    },
    starRating: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FFFFFF',
        color: '#333333',
        minHeight: 80,
        marginBottom: 24,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonCancel: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EF4423',
        width: '48%',
        alignItems: 'center',
    },
    buttonSubmit: {
        backgroundColor: '#EF4423',
        paddingVertical: 14,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#EF4423',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonTextCancel: {
        color: '#EF4423',
        fontWeight: '600',
        fontSize: 16,
    },
    buttonTextSubmit: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
