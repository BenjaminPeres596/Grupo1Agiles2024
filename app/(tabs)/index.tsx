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
    import * as Location from "expo-location";
    import Header from "@/components/Header";
    import RestaurantInfoCard from "@/components/RestaurantInfoCard";
    import AsyncStorage from "@react-native-async-storage/async-storage";
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
      isPromoted?: boolean;
      isGlutenFree?: boolean;
      isVegetarian?: boolean;
      isVegan?: boolean;
      isLactoseFree?: boolean;
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
      const [visitedRestaurants, setVisitedRestaurants] = useState<string[]>([]);

        const moveToLocation = (restaurant: FoodPoint) => {
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                handleMarkerPress(restaurant); // Simula un clic en el marcador
            }
        };
      
        const moveToNextRestaurant = () => {
          if (selectedRestaurant && filteredRestaurants.length > 1) {
              // Combina el historial con el restaurante actualmente seleccionado
              const updatedVisited = [...visitedRestaurants, selectedRestaurant.id];
      
              // Filtra los restaurantes ya visitados
              const unvisitedRestaurants = filteredRestaurants.filter(
                  (restaurant) => !updatedVisited.includes(restaurant.id)
              );
      
              if (unvisitedRestaurants.length === 0) {
                  // Si todos los restaurantes han sido visitados, reinicia el historial
                  setVisitedRestaurants([]);
                  return;
              }
      
              // Calcula el restaurante más cercano entre los no visitados
              const nearestRestaurant = unvisitedRestaurants
                  .map((restaurant) => ({
                      ...restaurant,
                      distance: Math.sqrt(
                          Math.pow(selectedRestaurant.latitude - restaurant.latitude, 2) +
                          Math.pow(selectedRestaurant.longitude - restaurant.longitude, 2)
                      ),
                  }))
                  .reduce((nearest, restaurant) =>
                      restaurant.distance < nearest.distance ? restaurant : nearest
                  );
      
              if (nearestRestaurant) {
                  // Mueve a la ubicación del restaurante más cercano
                  moveToLocation(nearestRestaurant);
                  setSelectedRestaurant(nearestRestaurant);
      
                  // Actualiza el historial de restaurantes visitados
                  setVisitedRestaurants(updatedVisited);
              }
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

            try {
                const response = await fetch(url, {
                    headers: {
                        apikey: apiKey,
                        Authorization: `Bearer ${apiKey}`,
                    },
                });

                const data: FoodPoint[] = await response.json();

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
                        isPromoted: restaurant.isPromoted || false,
                        isGlutenFree: restaurant.isGlutenFree || false,
                        isVegetarian: restaurant.isVegetarian || false,
                        isVegan: restaurant.isVegan || false,
                        isLactoseFree: restaurant.isLactoseFree || false,
                    }));

                    setNearbyRestaurants(formattedRestaurants);

                    // Filtra el restaurante que tenga isPromoted en true
                    const promoted = formattedRestaurants.find(
                        (restaurant) => restaurant.isPromoted
                    );

                    // Asigna el restaurante promocionado al estado
                    if (promoted) {
                        setPromotedRestaurant(promoted);
                    } else {
                        console.log("No se encontró un restaurante promocionado.");
                    }
                } else {
                    console.log("No se encontraron restaurantes en la base de datos.");
                }
            } catch (error) {
                console.error("Error al intentar el fetch:", error);
            }
        };

        const closePromotedModal = () => {
            setIsPromotedModalVisible(false);

            if (promotedRestaurant) {
                // Mover el mapa al restaurante promocionado y seleccionar el restaurante
                moveToLocation(promotedRestaurant);
                setSelectedRestaurant(promotedRestaurant); // Activa la tarjeta del restaurante
            }
        }

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
          {!loading && (
                <Header
                    title="DondeComo"
                    onProfilePress={() => setFavoritesVisible(true)}
                    onSearchPress={() => setModalVisible(true)}
                />
            )}
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

              <MapComponent
                  location={location}
                  loading={loading}
                  filteredRestaurants={filteredRestaurants}
                  selectedRestaurant={selectedRestaurant}
                  handleMarkerPress={handleMarkerPress}
                  handleMapPress={handleMapPress}
                  moveToLocation={moveToLocation} // Pasa la función aquí
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
              latitude={selectedRestaurant.latitude}
              longitude={selectedRestaurant.longitude}
              address={selectedRestaurant.address || "Dirección no disponible"}
              phone={selectedRestaurant.phone || "Teléfono no disponible"}
              description={
                selectedRestaurant.description || "Descripción no disponible"
              }
              image={selectedRestaurant.image || "https://via.placeholder.com/150"}
              isGlutenFree={selectedRestaurant.isGlutenFree}
              isVegetarian={selectedRestaurant.isVegetarian}
              isVegan={selectedRestaurant.isVegan}
              isLactoseFree={selectedRestaurant.isLactoseFree}
              onClose={closeModal}
              onFavoriteUpdate={handleFavoriteUpdate}
              moveToNextRestaurant={moveToNextRestaurant}
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
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            justifyContent: "center",
            alignItems: "center",
        },
        centeredCard: {
            width: "80%",
            padding: 20,
            backgroundColor: "#333333",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 4,
            alignItems: "center",
        },
        title: {
            fontSize: 20,
            fontWeight: "600",
            color: "#FFFFFF",
            marginBottom: 8,
        },
        address: {
            fontSize: 14,
            color: "#CCCCCC",
            textAlign: "center",
            marginBottom: 12,
        },
        closeButton: {
            backgroundColor: "#EF4423",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 8,
            alignItems: "center",
            shadowColor: "#EF4423",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
        },
        closeButtonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
        },

    });
