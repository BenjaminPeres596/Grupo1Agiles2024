import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

// Definir la interfaz para las propiedades
interface DistanceFilterProps {
  onDistanceChange: (distance: number) => void; // Define el tipo de la función
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({
  onDistanceChange,
}) => {
  const [maxDistance, setMaxDistance] = useState(10000);

  const handleApplyDistance = () => {
    onDistanceChange(maxDistance);
  };

  return (
    <View style={styles.verticalSliderContainer}>
      <Text style={styles.distanceText}>{maxDistance} m</Text>
      <Slider
        style={styles.verticalSlider}
        minimumValue={150}
        maximumValue={10000}
        step={10}
        value={maxDistance}
        onValueChange={(value) => setMaxDistance(value)}
        onSlidingComplete={handleApplyDistance}
        minimumTrackTintColor="#000000" // Color del track mínimo (parte que se llena)
        maximumTrackTintColor="#000000" // Color del track máximo (parte que no se llena)
        thumbTintColor="#000000" // Color del thumb (parte que se arrastra)
      />
    </View>
  );
};

export default DistanceFilter;

const styles = StyleSheet.create({
  verticalSliderContainer: {
    position: "absolute",
    bottom: 10,
    right: -70,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100, // Aumenta el valor para asegurar visibilidad
  },

  verticalSlider: {
    transform: [{ rotate: "-90deg" }], // Rotar el slider a vertical
    width: 200, // Ajusta el ancho para el rango de movimiento
  },

  distanceText: {
    color: "#000000", // Color del texto de la distancia
    fontSize: 16, // Ajusta el tamaño de la fuente según necesites
    bottom: 85,
    right: 5,
    textAlign: "center", // Centrar el texto
  },
});
