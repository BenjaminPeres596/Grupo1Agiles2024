import React from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import StarRating from "@/components/modal/StarRating"; // Asegúrate de que la ruta sea correcta

type RestaurantModalProps = {
  visible: boolean;
  onClose: () => void;
  restaurant: any;
  rating: number;
  onRatingChange: (newRating: number) => void;
};

const RestaurantModal: React.FC<RestaurantModalProps> = ({
  visible,
  onClose,
  restaurant,
  rating,
  onRatingChange,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {restaurant && (
            <>
              <Text style={styles.modalTitle}>{restaurant.name}</Text>
              <StarRating
                rating={rating}
                onChange={onRatingChange}
              />
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default RestaurantModal;
