import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import Slider from '@react-native-community/slider';
// Define la interfaz para las props que recibe el componente
interface BusquedaProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  restaurants: FoodPoint[];
  userLocation: { latitude: number; longitude: number } | null;
  maxDistance: number; // Nueva prop para la distancia máxima
  onClose: () => void;
  onSelectRestaurant: (restaurant: FoodPoint) => void;
  onDistanceChange: (distance: number) => void;
}

// Define la interfaz para los puntos de comida
interface FoodPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

const Busqueda: React.FC<BusquedaProps> = ({
  searchText,
  onSearchChange,
  restaurants,
  userLocation,
  maxDistance,
  onClose,
  onSelectRestaurant,
  onDistanceChange,
}) => {
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Retorna la distancia en metros
  };

  // Filtrar restaurantes en base al texto de búsqueda y la distancia
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const distance = userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          restaurant.latitude,
          restaurant.longitude
        )
      : Infinity; // Si no hay ubicación, no filtrar por distancia

    return (
      restaurant.name.toLowerCase().startsWith(searchText.toLowerCase()) &&
      distance <= maxDistance
    );
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchText}
        placeholder="Buscar restaurante"
        onChangeText={onSearchChange}
      />
      <Text style={styles.distanceText}>Distancia máxima: {maxDistance / 1000} km</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={30000}
        value={maxDistance}
        onValueChange={onDistanceChange} // Llama a la función al cambiar el valor
        step={100} // Puedes ajustar el paso
      />
      {filteredRestaurants.length > 0 && (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelectRestaurant(item)}
              style={({ pressed }) => [
                styles.restaurantCard,
                pressed && styles.pressedCard,
              ]}
            >
              <Text style={styles.restaurantItem}>{item.name}</Text>
            </Pressable>
          )}
        />
      )}
      <Pressable onPress={onClose}>
        <Text style={styles.closeButton}>Cerrar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  distanceText: {
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  restaurantItem: {
    paddingVertical: 10,
    fontSize: 16,
  },
  closeButton: {
    color: "blue",
    marginTop: 16,
    textAlign: "center",
  },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginStart: 2,
    marginEnd: 2,
  },
  pressedCard: {
    backgroundColor: "#e0e0e0",
  },
});

export default Busqueda;
