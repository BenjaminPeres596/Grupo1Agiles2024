import React from "react";
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
}

const MapComponent: React.FC<MapComponentProps> = ({
  location,
  loading,
  filteredRestaurants,
  selectedRestaurant,
  handleMarkerPress,
}) => {
  const mapRef = React.useRef<MapView>(null);

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