import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Text,
  ScrollView,
  Button,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MapView, { Marker, MapViewProps, Callout } from "react-native-maps";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import Header from "@/components/Header";
import RestaurantInfoCard from "@/components/RestaurantInfoCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DistanceFilter from "@/components/distancefilter";
import MapComponent from "@/components/MapComponent";
import SearchModal from "@/components/SearchModal";
import FavoritesModal from "@/components/FavoritesModal";
import { useData } from "@/context/DataContext";

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
  reviews?: any[];
  isFavorite?: boolean;
};

export default function HomeScreen() {
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<FoodPoint[]>([]);
  const [isDistanceFilterVisible, setIsDistanceFilterVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [promotedRestaurant, setPromotedRestaurant] =
    useState<FoodPoint | null>(null);
  const [isPromotedModalVisible, setIsPromotedModalVisible] = useState(true);
  //para mostrar el listado de favoritos
  const [favoritesVisible, setFavoritesVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<FoodPoint | null>(null);
  const [maxDistance, setmaxDistance] = useState(15000);
  const [searchText, setSearchText] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const mapRef = useRef<MapView>(null);

  const handleDistanceChange = (distance: number) => {
    setmaxDistance(distance);
    if (location) {
      fetchRestaurants();
    }
  };

  const handleMarkerPress = (restaurant: FoodPoint) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(false);
  };

  const handleMapPress = () => {
    setSelectedRestaurant(null); // Cerrar el modal del restaurante seleccionado
  };

  const fetchRestaurants = async () => {
    const url =
      "https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Restaurantes?select=*";
    const apiKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU";

    const response = await fetch(url, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (data && data.length > 0) {
      const formattedRestaurants = data.map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        address: restaurant.address || "Dirección no disponible",
        phone: restaurant.phone || "Teléfono no disponible",
        description: restaurant.description || "Descripción no disponible",
        image: restaurant.image || "https://via.placeholder.com/150",
      }));

      setNearbyRestaurants(formattedRestaurants);
    } else {
      console.log("No se encontraron restaurantes en la base de datos");
    }
    // Selecciona un restaurante aleatorio como promocionado
    const randomRestaurant =
      uniqueRestaurants[Math.floor(Math.random() * uniqueRestaurants.length)];
    setPromotedRestaurant(randomRestaurant);
  };

  const closePromotedModal = () => {
    setIsPromotedModalVisible(false);

    if (promotedRestaurant && mapRef.current) {
      // Centrar el mapa en el restaurante promocionado
      mapRef.current.animateToRegion({
        latitude: promotedRestaurant.latitude,
        longitude: promotedRestaurant.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Simular un clic en el marcador para activar `handleMarkerPress`
      handleMarkerPress(promotedRestaurant);
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
      await fetchRestaurants();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setIsDistanceFilterVisible(!selectedRestaurant);
  }, [selectedRestaurant]);

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRestaurant(null);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon1 - lon2) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const filteredRestaurants = nearbyRestaurants.filter((restaurant) => {
    const distance = calculateDistance(
      location?.latitude || 0,
      location?.longitude || 0,
      restaurant.latitude,
      restaurant.longitude
    );

    return (
      restaurant.name.toLowerCase().startsWith(searchText.toLowerCase()) &&
      distance <= maxDistance
    );
  });

  const handleRestaurantSearchSelect = (restaurant: FoodPoint) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(false);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteIdsString = await AsyncStorage.getItem(
        "favoriteRestaurants"
      );
      if (favoriteIdsString) {
        setFavoriteIds(JSON.parse(favoriteIdsString));
      }
    };
    loadFavorites();
  }, []);

  const handleFavoriteUpdate = (updatedFavorites: string[]) => {
    setFavoriteIds(updatedFavorites);
  };

  const closeFavorites = () => {
    setFavoritesVisible(false);
    setSelectedRestaurant(null);
  };

  const handleRestaurantFavoriteSelect = (restaurant: FoodPoint) => {
    setSelectedRestaurant(restaurant);
    setFavoritesVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="DondeComo"
        onProfilePress={() => setFavoritesVisible(true)}
        onSearchPress={() => setModalVisible(true)}
      />
      {promotedRestaurant && (
        <Modal
          visible={isPromotedModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.promotedModalOverlay}>
            <View style={styles.centeredCard}>
              <Text style={styles.title}>{promotedRestaurant.name}</Text>
              <Text style={styles.address}>Restaurante destacado cerca</Text>
              <Pressable
                style={styles.closeButton}
                onPress={closePromotedModal}
              >
                <Text style={styles.closeButtonText}>Ver en el mapa</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Renderiza el filtro de distancia solo si no hay un restaurante seleccionado */}
      {isDistanceFilterVisible && (
        <DistanceFilter onDistanceChange={handleDistanceChange} />
      )}

      <MapComponent
        location={location}
        loading={loading}
        filteredRestaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        handleMarkerPress={handleMarkerPress}
        handleMapPress={handleMapPress}
        moveToLocation={(loc) => {
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: loc?.latitude || 0,
              longitude: loc?.longitude || 0,
              latitudeDelta: loc?.latitudeDelta || 0.01,
              longitudeDelta: loc?.longitudeDelta || 0.01,
            });
          }
        }}
      />

      <SearchModal
        modalVisible={modalVisible}
        searchText={searchText}
        setSearchText={setSearchText}
        filteredRestaurants={filteredRestaurants}
        handleRestaurantSearchSelect={handleRestaurantSearchSelect}
        closeModal={closeModal}
      />

      <FavoritesModal
        favoritesVisible={favoritesVisible}
        favoriteIds={favoriteIds}
        filteredRestaurants={filteredRestaurants}
        handleRestaurantFavoriteSelect={handleRestaurantFavoriteSelect}
        closeFavorites={closeFavorites}
      />

      {selectedRestaurant && (
        <RestaurantInfoCard
          restaurantId={selectedRestaurant.id}
          name={selectedRestaurant.name}
          address={selectedRestaurant.address || "Dirección no disponible"}
          phone={selectedRestaurant.phone || "Teléfono no disponible"}
          description={
            selectedRestaurant.description || "Descripción no disponible"
          }
          image={selectedRestaurant.image || "https://via.placeholder.com/150"}
          onClose={closeModal}
          onFavoriteUpdate={handleFavoriteUpdate}
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
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  promotedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo oscuro semitransparente para resaltar el modal
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
  },
  centeredCard: {
    width: "80%",
    padding: 16,
    backgroundColor: "#EF4423",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center", // Centra el contenido dentro del card
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#EF4423",
    fontSize: 16,
    fontWeight: "bold",
  },
});
