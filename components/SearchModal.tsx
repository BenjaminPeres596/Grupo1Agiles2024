import React from "react";
import { Modal } from "react-native";
import Busqueda from "@/components/Busqueda";

type FoodPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

interface SearchModalProps {
  modalVisible: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  filteredRestaurants: FoodPoint[];
  handleRestaurantSearchSelect: (restaurant: FoodPoint) => void;
  closeModal: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  modalVisible,
  searchText,
  setSearchText,
  filteredRestaurants,
  handleRestaurantSearchSelect,
  closeModal,
}) => {
  return (
    <Modal visible={modalVisible} animationType="slide">
      <Busqueda
        searchText={searchText}
        onSearchChange={setSearchText}
        restaurants={filteredRestaurants}
        onClose={closeModal}
        onSelectRestaurant={handleRestaurantSearchSelect}
      />
    </Modal>
  );
};

export default SearchModal;