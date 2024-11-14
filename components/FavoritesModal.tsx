import React from "react";
import { Modal } from "react-native";
import Favoritos from "@/components/Favorites";

type FoodPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

interface FavoritesModalProps {
  favoritesVisible: boolean;
  favoriteIds: string[];
  filteredRestaurants: FoodPoint[];
  handleRestaurantFavoriteSelect: (restaurant: FoodPoint) => void;
  closeFavorites: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  favoritesVisible,
  favoriteIds,
  filteredRestaurants,
  handleRestaurantFavoriteSelect,
  closeFavorites,
}) => {
  return (
    <Modal visible={favoritesVisible} animationType="slide">
      <Favoritos
        restaurants={filteredRestaurants}
        favoriteIds={favoriteIds}
        onClose={closeFavorites}
        onSelectRestaurant={handleRestaurantFavoriteSelect}
      />
    </Modal>
  );
};

export default FavoritesModal;