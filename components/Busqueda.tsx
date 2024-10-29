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
  onSelectRestaurant: (restaurant: FoodPoint) => void;
}

// Define la interfaz para los puntos de comida
interface FoodPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const Busqueda: React.FC<BusquedaProps> = ({
  searchText,
  onSearchChange,
  restaurants,
  onClose,
  onSelectRestaurant,
}) => {
  // Filtrar restaurantes solo cuando hay texto en el campo de búsqueda
  const filteredRestaurants =
    searchText.trim() === ""
      ? []
      : restaurants.filter((restaurant) =>
          restaurant.name.toLowerCase().startsWith(searchText.toLowerCase())
        );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchText}
        placeholder="Buscar restaurante"
        onChangeText={onSearchChange}
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