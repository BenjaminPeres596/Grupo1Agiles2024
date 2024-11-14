// components/Busqueda.tsx
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

type FoodPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  description?: string;
  image?: string;
};

interface BusquedaProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  restaurants: FoodPoint[];
  onClose: () => void;
  onSelectRestaurant: (restaurant: FoodPoint) => void;
}

const Busqueda: React.FC<BusquedaProps> = ({
  searchText,
  onSearchChange,
  restaurants,
  onClose,
  onSelectRestaurant,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.searchContainer}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar restaurantes..."
          value={searchText}
          onChangeText={onSearchChange}
        />
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </Pressable>
      </KeyboardAvoidingView>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.resultItem}
            onPress={() => onSelectRestaurant(item)}
          >
            <Text style={styles.resultItemText}>{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.noResultsText}>No hay resultados</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
  closeButton: {
    marginLeft: 8,
    padding: 8,
  },
  closeButtonText: {
    color: "blue",
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultItemText: {
    fontSize: 16,
  },
  noResultsText: {
    padding: 16,
    textAlign: "center",
    color: "#999",
  },
});

export default Busqueda;
