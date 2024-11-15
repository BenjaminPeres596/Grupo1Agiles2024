import React, { useRef, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ThemedText } from '@/components/ThemedText';
import { Platform } from 'react-native';
import LoadingScreen from './LoadingScreen';

type LocationType = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
} | null;

type FoodPoint = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
};

interface MapComponentProps {
    location: LocationType;
    loading: boolean;
    filteredRestaurants: FoodPoint[];
    selectedRestaurant: FoodPoint | null;
    handleMarkerPress: (restaurant: FoodPoint) => void;
    handleMapPress: () => void;
    moveToLocation: (restaurant: FoodPoint) => void; // Cambiado para aceptar un FoodPoint
}

const MapComponent: React.FC<MapComponentProps> = ({
    location,
    loading,
    filteredRestaurants,
    selectedRestaurant,
    handleMarkerPress,
    handleMapPress,
    moveToLocation,
}) => {
    const mapRef = useRef<MapView>(null);

    // Mueve el mapa al restaurante seleccionado
    useEffect(() => {
        if (selectedRestaurant && mapRef.current) {
            const { latitude, longitude } = selectedRestaurant;
            mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    }, [selectedRestaurant]);

    // Define la función `moveToLocation` en `MapComponent` para centrar el mapa en el restaurante
    const handleMoveToLocation = (restaurant: FoodPoint) => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            handleMarkerPress(restaurant); // Activa el marcador del restaurante
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {loading ? (
                <LoadingScreen/>
            ) : location ? (
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    region={location}
                    showsUserLocation={true}
                    onPress={(event) => {
                        if (event.nativeEvent.action !== 'marker-press') {
                            // Solo ejecuta esta lógica si el evento NO es un "marker-press"
                            handleMapPress();
                        }
                    }}
                >
                    {filteredRestaurants.map((restaurant) => {
                        const isActive = selectedRestaurant?.id === restaurant.id;
                        return (
                            <Marker
                                key={restaurant.id} // Simplifica la clave
                                pinColor={isActive ? '#EF4423' : 'red'}
                                coordinate={{
                                    latitude: restaurant.latitude,
                                    longitude: restaurant.longitude,
                                }}
                                onPress={() => handleMarkerPress(restaurant)}
                                tracksViewChanges={Platform.OS === 'ios' ? false : true} // Ajusta el comportamiento en iOS
                            />
                        );
                    })}
                </MapView>
            ) : (
                <ThemedText>No se pudo obtener la ubicación</ThemedText>
            )}
        </View>
    );
};

export default MapComponent;
