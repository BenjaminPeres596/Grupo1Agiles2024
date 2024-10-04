import { Image, StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import Header from '../../components/Header';

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
  const [loadingMore, setLoadingMore] = useState(false);

  // Función para calcular la distancia (opcional)
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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

        await fetchRestaurants(userLatitude, userLongitude);

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

  const fetchRestaurants = async (latitude: number, longitude: number, pageToken: string | null = null) => {
    const API_KEY = 'AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE';
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=6000&type=restaurant&key=${API_KEY}`;

    if (pageToken) {
      url += `&pagetoken=${pageToken}`;
      setLoadingMore(true); // Muestra un indicador mientras se cargan más resultados
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const newRestaurants = data.results.map((place: any, index: number) => ({
          id: index + nearbyRestaurants.length, // Para mantener los IDs únicos
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }));

        setNearbyRestaurants(prevRestaurants => [...prevRestaurants, ...newRestaurants]);
      }

      // Si hay un next_page_token, lo guardamos para futuras solicitudes
      if (data.next_page_token) {
        setNextPageToken(data.next_page_token);
      } else {
        setNextPageToken(null); // No más páginas
      }
    } catch (error) {
      console.error('Error obteniendo restaurantes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreRestaurants = () => {
    if (nextPageToken && location) {
      fetchRestaurants(location.latitude, location.longitude, nextPageToken);
    }
  };

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
          >
            {nearbyRestaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                }}
                title={restaurant.name}
              />
            ))}
          </MapView>
        ) : (
          <ThemedText>No se pudo obtener la ubicación</ThemedText>
        )}
      </View>

      <ThemedView style={styles.restaurantsContainer}>
        <ThemedText type="title">Restaurantes cercanos:</ThemedText>
        {nearbyRestaurants.length > 0 ? (
          <FlatList
            data={nearbyRestaurants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ThemedText>{item.name}</ThemedText>
            )}
            onEndReached={loadMoreRestaurants} // Cargar más cuando lleguemos al final de la lista
            onEndReachedThreshold={0.5} // Cargar cuando estemos al 50% del final
            ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color="#0000ff" /> : null}
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
