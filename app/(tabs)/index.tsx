import {
  Image,
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
  Modal,
  Text,
  ScrollView,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import Header from "@/components/Header";

// Definir el tipo para representar la ubicación del usuario
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

// Definir el tipo para representar puntos de comida (restaurantes)
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
  // Al momento de realizar una llamada a la API de Google Places te retorna una lista de restaurantes (en este caso) y si hay más de cierta cantidad
  // Entonces lo que hace google es usar un token para mostrarlos en una página siguiente
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para el restaurante que se selecciona
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<FoodPoint | null>(null);

  // Referencia a Parallax y ScrollView para el desplazamiento hacia arriba
  const parallaxScrollViewRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Array de restaurantes adicionales o que no aparecen en Places
  const additionalRestaurants: FoodPoint[] = [
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

  // Función para obtener restaurantes cercanos
  const fetchRestaurants = async (latitude: number, longitude: number) => {
    const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=restaurant&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Mapeo de los resultados a nuestro estado de nearbyRestaurants
        const filteredRestaurants = data.results.map((place: any) => ({
          id: place.place_id, // ID que traemos desde la respuesta de la API
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }));

        // La expresión ...prev agrega todos los elementos que ya estaban en la lista anterior de restaurantes (prev)
        // La expresión ...filteredRestaurants añade los nuevos restaurantes obtenidos de la API (filteredRestaurants)
        // Finalmente se devuelve una nueva lista con todos los restaurantes juntos
        setNearbyRestaurants((prev) => [...prev, ...filteredRestaurants]);
        setNextPageToken(data.next_page_token || null); // Guardamos el token de la siguiente página
      } else {
        console.log("No se encontraron resultados");
      }
    } catch (error) {
      console.error("Error al intentar el fetch:", error);
    }
  };

  // Función para cargar más restaurantes cuando se llega al final de la lista (con el nextPageToken en caso de que exista)
  const loadMoreRestaurants = async () => {
    if (nextPageToken) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar un poco antes de hacer la solicitud
      const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${API_KEY}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const filteredRestaurants = data.results.map((place: any) => ({
            id: place.place_id, // Usa el ID único proporcionado por la API
            name: place.name,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          }));

          // La expresión ...prev agrega todos los elementos que ya estaban en la lista anterior de restaurantes (prev).
          // La expresión ...filteredRestaurants añade los nuevos restaurantes obtenidos de la API (filteredRestaurants).
          // Finalmente se forma una lista con todos los restaurantes juntos.
          setNearbyRestaurants((prev) => [...prev, ...filteredRestaurants]);
          setNextPageToken(data.next_page_token || null);
        } else {
          console.log("No hay restaurantes cercanos.");
        }
      } catch (error) {
        console.error("Error al hacer fetch:", error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync(); // Solicitamos permiso de ubicación al celular
      if (status !== "granted") {
        console.log("Permiso de ubicación denegado.");
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const userLatitude = currentLocation.coords.latitude;
        const userLongitude = currentLocation.coords.longitude;

        // Establecer la ubicación del usuario
        setLocation({
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.0922, // Zoom inicial en el mapa
          longitudeDelta: 0.0421,
        });

        // Obtener restaurantes cercanos
        await fetchRestaurants(userLatitude, userLongitude);
      } catch (error) {
        console.error("Error obteniendo la ubicación:", error);
      } finally {
        setLoading(false); // Una vez que se obtienen los datos, se deja de cargar
      }
    })();
  }, []); // Ejecutar el efecto cuando se monta el componente

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRestaurant(null); // Reinicia el restaurante seleccionado al cerrar
  };

  // Función para desplazarse hacia arriba
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="DondeComo"
        onProfilePress={() => console.log("Perfil presionado")}
        onSearchPress={() => console.log("Búsqueda presionada")}
      />

      <ScrollView ref={scrollViewRef}>
        <View style={styles.mapContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : location ? (
            <MapView style={styles.map} region={location} showsUserLocation={true}>
              {[...nearbyRestaurants, ...additionalRestaurants].map(
                (restaurant) => (
                  <Marker
                    key={`restaurant-${restaurant.id}`} // Ensure unique keys by prefixing the ID
                    coordinate={{
                      latitude: restaurant.latitude,
                      longitude: restaurant.longitude,
                    }}
                    title={restaurant.name}
                    description="Restaurante sin gluten"
                  />
                )
              )}
            </MapView>
          ) : (
            <ThemedText>No se pudo obtener la ubicación</ThemedText>
          )}
        </View>

        <ThemedView style={styles.restaurantsContainer}>
          <ThemedText type="title" style={styles.listTitle}>
            Restaurantes cercanos
          </ThemedText>
          {nearbyRestaurants.length === 0 ? (
            <ThemedText>No se encontraron restaurantes cercanos.</ThemedText>
          ) : (
            <FlatList
              data={[...nearbyRestaurants, ...additionalRestaurants]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setLocation({
                      latitude: item.latitude,
                      longitude: item.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    });
                    setSelectedRestaurant(item);
                    setModalVisible(true);
                    scrollToTop();
                  }}
                  style={({ pressed }) => [
                    styles.restaurantCard,
                    pressed && styles.pressedCard,
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
              onEndReached={loadMoreRestaurants}
              onEndReachedThreshold={0.5}
            />
          )}
        </ThemedView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedRestaurant && (
                <>
                  <Text style={styles.modalTitle}>
                    {selectedRestaurant.name}
                  </Text>
                  <Pressable style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

// Definición de estilos
const styles = StyleSheet.create({
  titleContainer: {
    padding: 16,
  },
  mapContainer: {
    height: 400,
    marginVertical: 16,
  },
  map: {
    flex: 1,
    height: "100%",
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
    color: "#000", // Define el color negro
    fontSize: 16, // Tamaño de fuente
    marginVertical: 8,
  },
  pressedCard: {
    backgroundColor: "#e0e0e0", // Cambia el color al presionar
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
