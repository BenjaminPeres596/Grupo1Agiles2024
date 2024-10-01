import { Image, StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MapView from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Definir el tipo para los restaurantes
type Restaurant = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

// Definir el tipo para el estado de location
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

// Simular una lista de restaurantes
const restaurants: Restaurant[] = [
  { id: 1, name: 'Restaurante A', latitude: -34.9164987, longitude: -57.9560722 },
  { id: 2, name: 'Restaurante B', latitude: -34.9164986, longitude: -57.9560721 },
  { id: 3, name: 'Restaurante C', latitude: -34.9164985, longitude: -57.9560720 },
  // Agrega más restaurantes aquí...
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

export default function HomeScreen() {
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]); // Usar el tipo Restaurant

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

        // Filtrar restaurantes
        const filteredRestaurants = restaurants.filter(restaurant => {
          const distance = haversine(
            userLatitude,
            userLongitude,
            restaurant.latitude,
            restaurant.longitude
          );
          return distance <= 1; // 1 km
        });

        setNearbyRestaurants(filteredRestaurants); // Guardar restaurantes cercanos en el estado

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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Comer seguro, sin gluten</ThemedText>
      </ThemedView>

      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : location ? (
          <MapView
            style={styles.map}
            region={location}
            showsUserLocation={true}
            showsMyLocationButton={true}
          />
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
    gap: 8,
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
