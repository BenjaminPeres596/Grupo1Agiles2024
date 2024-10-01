import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MapView from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Definir el tipo para el estado de location
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

export default function HomeScreen() {
  // Declarar el estado con el tipo LocationType
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true); // Estado para manejar el indicador de carga

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setLoading(false); // Dejar de cargar si no se concede el permiso
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest, // Mayor precisión
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
        setLoading(false); // Dejar de cargar cuando se obtenga la ubicación o si falla
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

      {/* Mapa de Google Maps */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" /> // Indicador de carga
        ) : location ? (
          <MapView
            style={styles.map}
            region={location} // Usar region en lugar de initialRegion
            showsUserLocation={true}
            showsMyLocationButton={true} // Mostrar botón para centrar la ubicación
          />
        ) : (
          <ThemedText>No se pudo obtener la ubicación</ThemedText> // Mensaje en caso de fallo
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
    height: 400, // Altura fija para el mapa
    marginHorizontal: 16, // Márgenes para que no toque los bordes
    borderRadius: 10, // Bordes redondeados opcionales
    overflow: 'hidden', // Asegura que el mapa respete los bordes redondeados
  },
  map: {
    flex: 1, // Se expande para llenar todo el contenedor
  },
});
