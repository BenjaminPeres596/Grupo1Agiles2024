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
import RestaurantModal from "@/components/modal/RestaurantModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/Header";
import Busqueda from "@/components/Busqueda";

// Definir el tipo para representar la ubicación del usuario
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

type FoodPoint = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<FoodPoint[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para el restaurante que se selecciona
  const [selectedRestaurant, setSelectedRestaurant] = useState<FoodPoint | null>(null);

  // Referencia a Parallax y ScrollView para el desplazamiento hacia arriba
  const parallaxScrollViewRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchText, setSearchText] = useState("");

  //
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${API_KEY}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const filteredRestaurants = data.results.map((place: any) => ({
            id: place.place_id,
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      // Obtener restaurantes cercanos
        await fetchRestaurants(userLatitude, userLongitude);
      } catch (error) {
        console.error("Error obteniendo la ubicación:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRestaurant(null); // Reinicia el restaurante seleccionado al cerrar
  };

  // ESTRELLAS
  const openModal = (restaurant:FoodPoint) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

  // Función para desplazarse hacia arriba
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };
  // ESTRELLAS
  useEffect(() => {
    // Cargar ratings persistidos cuando se monta el componente
    const loadRatings = async () => {
      try {
        const storedRatings = await AsyncStorage.getItem("restaurantRatings");
        if (storedRatings) {
          setRatings(JSON.parse(storedRatings));
        }
      } catch (error) {
        console.error("Error al cargar los ratings", error);
      }
    };
  
    loadRatings();
  }, []);

  // Función para guardar un rating
  const handleRatingChange = async (restaurantId: number, newRating: number) => {
    const updatedRatings = { ...ratings, [restaurantId]: newRating };
    setRatings(updatedRatings);

  try {
    // Guardar los ratings actualizados en AsyncStorage
    await AsyncStorage.setItem("restaurantRatings", JSON.stringify(updatedRatings));
  } catch (error) {
    console.error("Error al guardar el rating", error);
    }
  };


  // Función para calcular la distancia entre dos puntos geograficos
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

  // Filtrar restaurantes en base al texto de búsqueda
  const filteredRestaurants = [
    ...nearbyRestaurants,
    ...additionalRestaurants.filter((restaurant) => {
      // Aplicar solo el filtro de distancia
      return (
        location &&
        calculateDistance(
          location.latitude,
          location.longitude,
          restaurant.latitude,
          restaurant.longitude
        ) <= 1000
      );
    }),
  ].filter((restaurant) =>
    restaurant.name.toLowerCase().startsWith(searchText.toLowerCase())
  );

  // Manejar la selección del restaurante desde el componente Busqueda
  const handleRestaurantSelect = (restaurant: FoodPoint) => {
    setSelectedRestaurant(restaurant);
    setLocation({
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setModalVisible(false); // Cerrar el modal
    scrollToTop(); // Scroll hacia arriba
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="DondeComo"
        onProfilePress={() => console.log("Perfil presionado")}
        onSearchPress={() => setModalVisible(true)}
      />

      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : location ? (
          <MapView
            style={styles.map}
            region={location}
            showsUserLocation={true}
          >
            {filteredRestaurants.map((restaurant, index) => (
              <Marker
                key={`restaurant-${restaurant.id}-${index}`}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                }}
                title={restaurant.name}
                description="Restaurante sin gluten"
              />
            ))}
          </MapView>
        ) : (
          <ThemedText>No se pudo obtener la ubicación</ThemedText>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <Busqueda
          searchText={searchText}
          onSearchChange={setSearchText}
          restaurants={[...filteredRestaurants]}
          onClose={() => setModalVisible(false)}
          onSelectRestaurant={handleRestaurantSelect} // Pasa la función aquí
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  restaurantsContainer: {
    padding: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  restaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    elevation: 1,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
});
