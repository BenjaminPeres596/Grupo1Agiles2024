import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";

// Define la interfaz para las props que recibe el componente
type FavoritesProps = {
    restaurants: FoodPoint[]; // Asegúrate de que esto sea el tipo correcto para tus restaurantes
    favoriteIds: string[]; // Lista de IDs de restaurantes favoritos
    onClose: () => void;
    onSelectRestaurant: (restaurant: FoodPoint) => void;
  };

// Define la interfaz para los puntos de comida
interface FoodPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const Favoritos: React.FC<FavoritesProps> = ({
    restaurants,
    favoriteIds,
    onClose,
    onSelectRestaurant,
  }) => {

    // Filtrar restaurantes que son favoritos y coinciden con el texto de búsqueda
    const filteredRestaurants = restaurants
      .filter((restaurant) => favoriteIds.includes(restaurant.id)) // Filtra solo los favoritos

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0} // Ajusta según sea necesario
      >
        <Text style={styles.title}>Mis Favoritos</Text>
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
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.buttonText}>Cerrar</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Black",
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
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
    backgroundColor: '#0D73AB',
    padding: 8, // Reducido el padding
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FBFEF9',
    fontSize: 14, // Reducido el tamaño de la fuente
    fontWeight: 'bold',
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

export default Favoritos;