import { Image, StyleSheet, View, ActivityIndicator, FlatList, } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Pressable } from 'react-native'
import Header from '@/components/Header';

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
      name: "Afan en la cuadra",
        latitude: -34.91081037947414,
        longitude: -57.94575454132004,
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
    <View style={{ flex: 1 }}>
        <Header 
          title="DondeComo" // Título del header
          onProfilePress={() => console.log('Perfil presionado')} // Preparo ya para un proximo sprint la accion de este boton
          onSearchPress={() => console.log('Búsqueda presionada')} // Preparo ya para un proximo sprint la accion de este boton
        />
      {/* Mapa de Google Maps */}
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
              <ThemedText type="title" style={styles.listTitle}>
                  Restaurantes cercanos
              </ThemedText>

              {nearbyRestaurants.length === 0 ? (
                  <ThemedText>No se encontraron restaurantes cercanos.</ThemedText>
              ) : (
                  <FlatList
                      data={nearbyRestaurants}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                          <Pressable
                              onPressIn={() => setLocation({
                                  latitude: item.latitude,
                                  longitude: item.longitude,
                                  latitudeDelta: 0.005,
                                  longitudeDelta: 0.005,
                              })}
                              style={({ pressed }) => [
                                  styles.restaurantCard,
                                  pressed && styles.pressedCard, // Estilo adicional cuando se presiona
                              ]}
                          >
                              <Image
                                  source={require("@/assets/images/restaurant-placeholder.png")}
                                  style={styles.restaurantImage}
                              />
                              <View style={styles.restaurantInfo}>
                                  <ThemedText type="subtitle" style={styles.restaurantName}>
                                      {item.name}
                                  </ThemedText>
                              </View>
                          </Pressable>
                      )}
                  />
              )}
          </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 400, // Altura fija para el mapa
    marginHorizontal: 16, // Márgenes para que no toque los bordes
    borderRadius: 10, // Bordes redondeados opcionales
    overflow: 'hidden', // Asegura que el mapa respete los bordes redondeados
    paddingTop: 16, // Agrego un espacio entre el header y el mapa.
  },
  map: {
    flex: 1,
  },
  restaurantsContainer: {
        padding: 16,
    },
  listTitle: {
      marginBottom: 10,
      fontSize: 24, // Tamaño de fuente
     },
  restaurantCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3, 
    },
  restaurantImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
  restaurantInfo: {
        flex: 1,
    },
  restaurantName: {
      color: '#000', // Define el color negro
      fontSize: 16, // Tamaño de fuente
      marginVertical: 8, 
    },
  pressedCard: {
        backgroundColor: '#e0e0e0', // Cambia el color al presionar
    },
});

