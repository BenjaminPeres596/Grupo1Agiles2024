import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
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

  // Lista de puntos de comida
  const foodPoints: FoodPoint[] = [
    { id: 1, name: 'La Cabrera Al Paso Baxar Mercado', latitude: -34.9138048884854, longitude: -57.94808435414168 },
    { id: 2, name: 'Green Garden - La Plata', latitude: -34.91801012714514, longitude: -57.95458602885797 },
    { id: 3, name: 'La Trattoria Cucina Caffe', latitude: -34.91575797594942, longitude: -57.95510101289757 },
  ];

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
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
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
          >
            {/* Renderizar los marcadores de puntos de comida */}
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
});
