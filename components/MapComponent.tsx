// components/MapComponent.tsx
import React, { useRef, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ThemedText } from "@/components/ThemedText";

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
  moveToLocation: (location: LocationType) => void; // Nueva prop para mover el mapa
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

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : location ? (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          region={location}
          showsUserLocation={true}
          onPress={handleMapPress}
        >
          {filteredRestaurants.map((restaurant, index) => {
            const isActive = selectedRestaurant?.id === restaurant.id;
            return (
              <Marker
                key={`restaurant-${restaurant.id}-${index}-${isActive ? "active" : "inactive"}`}
                pinColor={isActive ? "blue" : "red"}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                }}
                title={restaurant.name}
                description="Restaurante sin gluten"
                onPress={() => handleMarkerPress(restaurant)}
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