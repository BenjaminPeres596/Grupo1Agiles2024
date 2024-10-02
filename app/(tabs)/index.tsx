import { Image, StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Definir el tipo para el estado de location y para los puntos de comida
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

  // Lista de puntos de comida
  const foodPoints: FoodPoint[] = [
    { id: 1, name: 'La Cabrera Al Paso Baxar Mercado', latitude: -34.9138048884854, longitude: -57.94808435414168 },
    { id: 2, name: 'Green Garden - La Plata', latitude: -34.91801012714514, longitude: -57.95458602885797 },
    { id: 3, name: 'La Trattoria Cucina Caffe', latitude: -34.91575797594942, longitude: -57.95510101289757 },
  ];

  // Función para calcular la distancia
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en kilómetros
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const userLatitude = currentLocation.coords.latitude;
        const userLongitude = currentLocation.coords.longitude;

        // Filtrar restaurantes cercanos (radio de 1 km)
        const filteredRestaurants = foodPoints.filter((restaurant) => {
          const distance = haversine(
            userLatitude,
            userLongitude,
            restaurant.latitude,
            restaurant.longitude
          );
          return distance <= 1;
        });

        setNearbyRestaurants(filteredRestaurants);
        setLocation({
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error obteniendo la ubicación:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      {/* Título y saludo */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Comer seguro, sin gluten</ThemedText>
      </ThemedView>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : location ? (
          <MapView
            style={styles.map}
            region={location}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {foodPoints.map((point) => (
              <Marker
                key={point.id}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={point.name}
              />
            ))}
          </MapView>
        ) : (
          <ThemedText>No se pudo obtener la ubicación</ThemedText>
        )}
      </View>

      {/* Lista de restaurantes cercanos */}
      <ThemedView style={styles.restaurantsContainer}>
        <ThemedText type="title">Restaurantes cercanos:</ThemedText>
        {nearbyRestaurants.length > 0 ? (
          <FlatList
            data={nearbyRestaurants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ThemedText>{item.name}</ThemedText>
            )}
          />
        ) : (
          <ThemedText>No se encontraron restaurantes cercanos.</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  mapContainer: {
    height: 400,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  restaurantsContainer: {
    padding: 16,
  },
});
