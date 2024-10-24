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
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<FoodPoint | null>(null);
  const parallaxScrollViewRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  const haversine = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchRestaurants = async (latitude: number, longitude: number) => {
    const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=restaurant&key=${API_KEY}`;

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

        setNearbyRestaurants((prev) => [...prev, ...filteredRestaurants]);
        setNextPageToken(data.next_page_token || null);
      } else {
        console.log("No se encontraron resultados");
      }
    } catch (error) {
      console.error("Error al intentar el fetch:", error);
    }
  };

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
      let { status } = await Location.requestForegroundPermissionsAsync();
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

        setLocation({
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

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
    setSelectedRestaurant(null);
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Filtrar restaurantes en base al texto de búsqueda
  const filteredRestaurants = [
    ...nearbyRestaurants,
    ...additionalRestaurants,
  ].filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="DondeComo"
        onProfilePress={() => console.log("Perfil presionado")}
        onSearchPress={() => setIsSearching(!isSearching)} // Toggle de búsqueda
        searchText={searchText} // Texto del campo de búsqueda
        onSearchChange={(text: string) => setSearchText(text)} // Actualiza el estado del texto
      />

      <ScrollView ref={scrollViewRef}>
        <View style={styles.mapContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : location ? (
            <MapView
              style={styles.map}
              region={location}
              showsUserLocation={true}
            >
              {filteredRestaurants.map((restaurant) => (
                <Marker
                  key={`restaurant-${restaurant.id}`}
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

        <ThemedView style={styles.restaurantsContainer}>
          <ThemedText type="title" style={styles.listTitle}>
            Restaurantes cercanos
          </ThemedText>
          {filteredRestaurants.length === 0 ? (
            <ThemedText>No se encontraron restaurantes cercanos.</ThemedText>
          ) : (
            <FlatList
              data={filteredRestaurants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setLocation({
                      latitude: item.latitude,
                      longitude: item.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    });
                    scrollToTop();
                  }}
                >
                  <ThemedView style={styles.restaurantItem}>
                    <Image
                      style={styles.restaurantImage}
                      source={require("@/assets/images/restaurant-placeholder.png")}
                    />
                    <ThemedText>{item.name}</ThemedText>
                  </ThemedView>
                </Pressable>
              )}
              onEndReached={loadMoreRestaurants}
              onEndReachedThreshold={0.5}
            />
          )}
        </ThemedView>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText type="title">{selectedRestaurant?.name}</ThemedText>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  restaurantsContainer: {
    padding: 16,
  },
  listTitle: {
    marginBottom: 8,
  },
  restaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    width: 300,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
  },
});
