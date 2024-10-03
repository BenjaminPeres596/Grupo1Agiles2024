import {
  Image,
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

// Definir el tipo para el estado de location y para los puntos de comida
// LocationType define el tipo de objeto que guarda las coordenadas de ubicación
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

// Definición del tipo para representar puntos de comida (restaurantes)
type FoodPoint = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  // Estado para almacenar la ubicación actual del usuario
  const [location, setLocation] = useState<LocationType>(null);

  // Estado para gestionar el estado de carga
  const [loading, setLoading] = useState(true);

  // Estado para almacenar los restaurantes cercanos al usuario
  const [nearbyRestaurants, setNearbyRestaurants] = useState<FoodPoint[]>([]);

  // Lista de puntos de comida (restaurantes con coordenadas específicas)
  const foodPoints: FoodPoint[] = [
    {
      id: 1,
      name: "La Cabrera Al Paso Baxar Mercado",
      latitude: -34.9138048884854,
      longitude: -57.94808435414168,
    },
    {
      id: 2,
      name: "Green Garden - La Plata",
      latitude: -34.91801012714514,
      longitude: -57.95458602885797,
    },
    {
      id: 3,
      name: "La Trattoria Cucina Caffe",
      latitude: -34.91575797594942,
      longitude: -57.95510101289757,
    },
    {
      id: 4,
      name: "Atenas Parrilla Resto",
      latitude: -34.92476621004759,
      longitude: -57.949965283708394,
    },
    {
      id: 5,
      name: "Ese es mi pollo",
      latitude: -34.90639681023369,
      longitude: -57.924194197557235,
    },
  ];

  // Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
  const haversine = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Diferencia de latitud en radianes
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Diferencia de longitud en radianes
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2); // Fórmula de Haversine
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Arco entre los puntos
    return R * c; // Distancia en kilómetros
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const userLatitude = currentLocation.coords.latitude;
        const userLongitude = currentLocation.coords.longitude;

        const filteredRestaurants = foodPoints.filter((restaurant) => {
          const distance = haversine(
            userLatitude,
            userLongitude,
            restaurant.latitude,
            restaurant.longitude
          );
          return distance <= 1; // Si la distancia es menor o igual a 1 km, se incluye
        });

        setNearbyRestaurants(filteredRestaurants);
        setLocation({
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.0922, // Zoom inicial en el mapa
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error obteniendo la ubicación:", error); // Manejo de errores
      } finally {
        setLoading(false); // Una vez que se obtienen los datos, se deja de cargar
      }
    })();
  }, []); // Ejecutar el efecto cuando se monta el componente

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }} // Estilo del encabezado
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")} // Logo en el encabezado
          style={styles.reactLogo}
        />
      }
    >
      {/* Título y saludo */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Comer seguro, sin gluten</ThemedText>
        {/* Título de la pantalla */}
      </ThemedView>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : // Indicador de carga mientras se obtiene la ubicación
        location ? (
          <MapView
            style={styles.map}
            region={location} // Región centrada en la ubicación del usuario
            showsUserLocation={true} // Muestra el icono de la ubicación del usuario
            showsMyLocationButton={true} // Botón para centrar en la ubicación del usuario
          >
            {/* Marcadores de los puntos de comida */}
            {foodPoints.map((point) => (
              <Marker
                key={point.id} // Cada marcador necesita una clave única
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={point.name} // Nombre del restaurante como título del marcador
              />
            ))}
          </MapView>
        ) : (
          <ThemedText>No se pudo obtener la ubicación</ThemedText>
          // Mensaje si no se obtiene la ubicación
        )}
      </View>

      {/* Lista de restaurantes cercanos */}
      <ThemedView style={styles.restaurantsContainer}>
        <ThemedText type="title">Restaurantes cercanos:</ThemedText>
        {/* Título de la lista */}
        {nearbyRestaurants.length > 0 ? (
          <FlatList
            data={nearbyRestaurants} // Datos de los restaurantes cercanos
            keyExtractor={(item) => item.id.toString()} // Convierte el id a string para usarlo como clave
            renderItem={({ item }) => (
              <ThemedText>{item.name}</ThemedText> // Renderiza el nombre del restaurante
            )}
          />
        ) : (
          <ThemedText>No se encontraron restaurantes cercanos.</ThemedText>
          // Mensaje si no hay restaurantes cercanos
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  mapContainer: {
    height: 400,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  restaurantsContainer: {
    padding: 16,
  },
});
