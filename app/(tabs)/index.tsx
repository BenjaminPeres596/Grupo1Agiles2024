import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import Header from "@/components/Header";
import RestaurantInfoCard from "@/components/RestaurantInfoCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DistanceFilter from "@/components/distancefilter";
import MapComponent from "@/components/MapComponent";
import SearchModal from "@/components/SearchModal";
import FavoritesModal from "@/components/FavoritesModal";

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
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isDistanceFilterVisible, setIsDistanceFilterVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoritesVisible, setFavoritesVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<FoodPoint | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: any }>({});
  const [maxDistance, setmaxDistance] = useState(15000);
  const [searchText, setSearchText] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const handleDistanceChange = (distance: number) => {
    setmaxDistance(distance);
    if (location) {
      fetchRestaurants(location.latitude, location.longitude);
    }
  };

  const handleMarkerPress = (restaurant: FoodPoint) => {
    fetchRestaurantDetails(restaurant.id.toString());
    setSelectedRestaurant(restaurant);
    setModalVisible(false);
  };

  const fetchRestaurants = async (latitude: number, longitude: number) => {
    const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${maxDistance}&type=restaurant&key=${API_KEY}`;
    console.log("URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const filteredRestaurants = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      }));

      const uniqueRestaurants = filteredRestaurants.filter(
        (FoodPoint: FoodPoint) =>
          !nearbyRestaurants.some((r) => r.id === FoodPoint.id)
      );

      setNearbyRestaurants((prev) => [...prev, ...uniqueRestaurants]);
      setNextPageToken(data.next_page_token || null);

      if (data.next_page_token) {
        console.log("Llamado a funcion.");
        setTimeout(() => {
          loadMoreRestaurants(data.next_page_token);
        }, 2000);
      } else {
        console.log("No se encontraron más resultados.");
      }
    } else {
      console.log("No se encontraron resultados");
    }
  };

  const loadMoreRestaurants = async (token: string) => {
    const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${token}&key=${API_KEY}`;

    console.log("URL loadMoreRestaurants:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const filteredRestaurants = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      }));

      const uniqueRestaurants = filteredRestaurants.filter(
        (FoodPoint: FoodPoint) =>
          !nearbyRestaurants.some((r) => r.id === FoodPoint.id)
      );
      setNearbyRestaurants((prev) => [...prev, ...uniqueRestaurants]);
      setNextPageToken(data.next_page_token || null);

      if (data.next_page_token) {
        console.log("Llamado a funcion.");
        setTimeout(() => {
          loadMoreRestaurants(data.next_page_token);
        }, 2000);
      }
    } else {
      console.log("No hay restaurantes cercanos.");
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
      await fetchRestaurants(userLatitude, userLongitude);
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
    fetchRestaurantDetails(restaurant.id.toString());
    setSelectedRestaurant(restaurant);
    setModalVisible(false);
  };

  const fetchRestaurantDetails = async (placeId: string) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE`);
    const data = await response.json();
    if (data.result) {
      const restaurantDetails = {
        id: data.result.place_id,
        name: data.result.name,
        address: data.result.formatted_address || "Dirección no disponible",
        phone: data.result.formatted_phone_number || "Teléfono no disponible",
        description: data.result.types ? data.result.types.join(", ") : "Descripción no disponible",
        image: data.result.photos && data.result.photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${data.result.photos[0].photo_reference}&key=AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE` : "https://via.placeholder.com/150",
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
      };
      console.log("Restaurant details fetched:", restaurantDetails);
      setSelectedRestaurant(restaurantDetails);
    } else {
      console.log("Detalles del restaurante no disponibles");
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteIdsString = await AsyncStorage.getItem('favoriteRestaurants');
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
    fetchRestaurantDetails(restaurant.id.toString());
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

      {isDistanceFilterVisible && (
        <DistanceFilter onDistanceChange={handleDistanceChange} />
      )}

      <MapComponent
        location={location}
        loading={loading}
        filteredRestaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        handleMarkerPress={handleMarkerPress}
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
          description={selectedRestaurant.description || "Descripción no disponible"}
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
  distanceFilterContainer: {
    position: "absolute",
    top: 100,
    left: 250,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 10,
  },
});