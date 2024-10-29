import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import Slider from '@react-native-community/slider';

// Definir la interfaz para las propiedades
interface DistanceFilterProps {
  onDistanceChange: (distance: number) => void; // Define el tipo de la función
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({ onDistanceChange }) => {
  const [maxDistance, setMaxDistance] = useState(10000); // Valor inicial en metros

  const handleApplyDistance = () => {
    // Llama a la función para actualizar la distancia máxima
    onDistanceChange(maxDistance);
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Distancia máxima: {maxDistance} metros</Text>
      <Slider
        minimumValue={150}
        maximumValue={10000}
        step={10}
        value={maxDistance}
        onValueChange={(value) => setMaxDistance(value)}
      />
      <Button title="Aplicar" onPress={handleApplyDistance} />
    </View>
  );
};

export default DistanceFilter;
