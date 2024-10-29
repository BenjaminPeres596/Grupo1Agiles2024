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
import MapView, { Marker, MapViewProps } from "react-native-maps";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import Header from "@/components/Header";
import Busqueda from "@/components/Busqueda";
import RestaurantInfoCard from "@/components/RestaurantInfoCard";
import AsyncStorage from '@react-native-async-storage/async-storage';


// Definir el tipo para representar la ubicación del usuario
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

type FoodPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  description?: string;
  image?: string;
  reviews?: any[]; // Agregar la propiedad reviews
};

export default function HomeScreen() {
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<FoodPoint[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para el restaurante que se selecciona
  const [selectedRestaurant, setSelectedRestaurant] = useState<FoodPoint | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: any }>({}); // Estado para las reseñas

  // Referencia a Parallax y ScrollView para el desplazamiento hacia arriba
  const parallaxScrollViewRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchText, setSearchText] = useState("");
  const mapRef = useRef<MapView>(null);

  const handleMarkerPress = (restaurant: FoodPoint) => {
    fetchRestaurantDetails(restaurant.id.toString()); // Obtiene los detalles del restaurante
    setSelectedRestaurant(restaurant);
    setModalVisible(false);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: restaurant.latitude - 0.0025,
        longitude: restaurant.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  useEffect(() => {
    console.log("Restaurante seleccionado:", selectedRestaurant);
  }, [selectedRestaurant]);

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
  const filteredRestaurants = nearbyRestaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().startsWith(searchText.toLowerCase())
  );

  // Manejar la selección del restaurante desde el componente Busqueda
  // Modifica handleRestaurantSelect para obtener detalles específicos del restaurante seleccionado
  const handleRestaurantSelect = (restaurant: FoodPoint) => {
    fetchRestaurantDetails(restaurant.id.toString()); // Convierte el ID a string
    setSelectedRestaurant(restaurant);
    setModalVisible(false);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: restaurant.latitude - 0.0025,
        longitude: restaurant.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const fetchRestaurantDetails = async (placeId: string) => {
    const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE"; // Asegúrate de tener la clave de API correctamente
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        const restaurantDetails = {
          id: data.result.place_id,
          name: data.result.name,
          address: data.result.formatted_address || "Dirección no disponible",
          phone: data.result.formatted_phone_number || "Teléfono no disponible",
          description: data.result.types
            ? data.result.types.join(", ")
            : "Descripción no disponible",
          image:
            data.result.photos && data.result.photos.length > 0
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${data.result.photos[0].photo_reference}&key=${API_KEY}`
              : "https://via.placeholder.com/150",
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
        };
        console.log(restaurantDetails);
        setSelectedRestaurant({
          id: restaurantDetails.id,
          name: restaurantDetails.name,
          address: restaurantDetails.address,
          phone: restaurantDetails.phone,
          description: restaurantDetails.description,
          image: restaurantDetails.image,
          latitude:
            restaurantDetails.latitude !== null
              ? restaurantDetails.latitude
              : 0,
          longitude:
            restaurantDetails.longitude !== null
              ? restaurantDetails.longitude
              : 0,
        });
      } else {
        console.log("Detalles del restaurante no disponibles");
      }
    } catch (error) {
      console.error("Error obteniendo detalles del restaurante:", error);
    }
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
            ref={mapRef}
            style={styles.map}
            region={location}
            showsUserLocation={true}
          >
            {filteredRestaurants.map((restaurant, index) => {
              const isActive = selectedRestaurant?.id === restaurant.id; // Verifica si el restaurante está seleccionado
              return (
                <Marker
                  key={`restaurant-${restaurant.id}-${index}-${isActive ? "active" : "inactive"}`}
                  pinColor={isActive ? "blue" : "red"}
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }}
                  title={restaurant.name}
                  description="Restaurante sin gluten"
                  onPress={() => handleMarkerPress(restaurant)} // Agrega manejador aquí
                />
              );
            })}
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
          onSelectRestaurant={(restaurant: FoodPoint) => {
            handleRestaurantSelect(restaurant); // Llama a esta función para manejar la selección
          }}
        />
      </Modal>

            {selectedRestaurant && ( // Asegúrate de que esto esté fuera del modal
                <RestaurantInfoCard
                    restaurantId={selectedRestaurant.id}
                    name={selectedRestaurant.name}
                    address={selectedRestaurant.address || "Dirección no disponible"} // Proporcionar un valor por defecto
                    phone={selectedRestaurant.phone || "Teléfono no disponible"} // Proporcionar un valor por defecto
                    description={selectedRestaurant.description || "Descripción no disponible"} // Proporcionar un valor por defecto
                    image={selectedRestaurant.image || "https://via.placeholder.com/150"} // Proporcionar un valor por defecto
                    onClose={closeModal}
                />
            )}
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
