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
          placeholderTextColor="black"
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
        backgroundColor: "#F3F4F6",
    },
    searchInput: {
        flex: 1,
        height: 45, // Altura ajustada para centrar verticalmente
        paddingVertical: 0, // Elimina relleno vertical adicional
        paddingHorizontal: 14, // Espaciado interno horizontal
        fontSize: 16, // Tamaño del texto ajustado
        backgroundColor: "transparent", // Sin fondo adicional
        borderWidth: 0, // Sin borde
        color: "#333", // Texto oscuro
        textAlignVertical: "center", // Centra verticalmente en Android
        fontFamily: "AvenirNext-Regular", // Fuente profesional
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16, // Ajusta el relleno interno horizontal
        paddingVertical: 10, // Ajusta el relleno interno vertical
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 30, // Bordes redondeados más suaves
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4, // Sombra para Android
    },
    closeButton: {
        marginLeft: 8,
        padding: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 20, // Botón más redondo
        borderWidth: 1,
        borderColor: "#EF4423",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute", // Para posicionarlo en el centro vertical
        right: 16, // Cerca del borde derecho
        top: "50%", // Centrado verticalmente
        transform: [{ translateY: -12 }], // Ajuste para centrar
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    closeButtonText: {
        color: "#EF4423",
        fontSize: 14,
        fontWeight: "600",
    },

    resultItem: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#EF4423",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    resultItemText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    noResultsText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
        color: "#666",
    },
});


export default Busqueda;
