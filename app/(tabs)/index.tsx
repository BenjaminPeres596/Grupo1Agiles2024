import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import Header from '../../components/Header';
import { ThemedText } from '../../components/ThemedText'; 


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
  // Declarar el estado con el tipo LocationType
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true); // Estado para manejar el indicador de carga

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
    <View style={{ flex: 1 }}>
        <Header 
          title="DondeComo" // Título del header
          onProfilePress={() => console.log('Perfil presionado')} // Preparo ya para un proximo sprint la accion de este boton
          onSearchPress={() => console.log('Búsqueda presionada')} // Preparo ya para un proximo sprint la accion de este boton
        />
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
          <ThemedText>No se pudo obtener la ubicación</ThemedText> // Mensaje en caso de fallo
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 400, // Altura fija para el mapa
    marginHorizontal: 16, // Márgenes para que no toque los bordes
    borderRadius: 10, // Bordes redondeados opcionales
    overflow: 'hidden', // Asegura que el mapa respete los bordes redondeados
    paddingTop: 16, // Agrego un espacio entre el header y el mapa.
  },
  map: {
    flex: 1, // Se expande para llenar todo el contenedor
  },
});

