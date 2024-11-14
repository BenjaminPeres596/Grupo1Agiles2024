import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface DataContextType {
  location: LocationType;
  loading: boolean;
  nearbyRestaurants: FoodPoint[];
  fetchRestaurants: (latitude: number, longitude: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationType>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<FoodPoint[]>([]);

  const fetchRestaurants = async (latitude: number, longitude: number) => {
    const API_KEY = "AIzaSyBhAMa66FuySpxmP4lydmRENtNDWqp4WnE";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=15000&type=restaurant&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const filteredRestaurants = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      }));
      setNearbyRestaurants(filteredRestaurants);
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

  return (
    <DataContext.Provider value={{ location, loading, nearbyRestaurants, fetchRestaurants }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};