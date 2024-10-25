import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

// Define la interfaz para las props que recibe el componente
interface BusquedaProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  restaurants: FoodPoint[];
  onClose: () => void;
  onSelectRestaurant: (restaurant: FoodPoint) => void; // Corregido a minúscula
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
  onClose,
  onSelectRestaurant, // Corregido a minúscula
}) => {
  // Filtrar restaurantes en base al texto de búsqueda
  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchText}
        placeholder="Buscar restaurante"
        onChangeText={onSearchChange}
      />
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelectRestaurant(item)}>
            <Text style={styles.restaurantItem}>{item.name}</Text>
          </Pressable>
        )}
      />
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
  restaurantItem: {
    paddingVertical: 10,
    fontSize: 16,
  },
  closeButton: {
    color: "blue",
    marginTop: 16,
    textAlign: "center",
  },
});

export default Busqueda;
