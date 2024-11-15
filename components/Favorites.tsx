import React from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
    StyleSheet,
    SafeAreaView,
} from "react-native";


type FavoritesProps = {
    restaurants: FoodPoint[];
    favoriteIds: string[];
    onClose: () => void;
    onSelectRestaurant: (restaurant: FoodPoint) => void;
};

interface FoodPoint {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    image?: string;
}

const Favoritos: React.FC<FavoritesProps> = ({
    restaurants,
    favoriteIds,
    onClose,
    onSelectRestaurant,
}) => {
    const favoriteRestaurants = restaurants.filter((restaurant) =>
        favoriteIds.includes(restaurant.id)
    );

    const renderFavoriteCard = ({ item }: { item: FoodPoint }) => (
        <Pressable
            onPress={() => onSelectRestaurant(item)}
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.8 },
            ]}
        >
            <Image
                source={{ uri: item.image || "https://via.placeholder.com/100" }}
                style={styles.image}
            />
            <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.address || "Sin dirección"}</Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Restaurantes favoritos</Text>
                {favoriteRestaurants.length > 0 ? (
                    <FlatList
                        data={favoriteRestaurants}
                        keyExtractor={(item) => item.id}
                        renderItem={renderFavoriteCard}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <Text style={styles.noFavoritesText}>
                        No tienes restaurantes favoritos.
                    </Text>
                )}
                <Pressable onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.buttonText}>Cerrar</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        marginVertical: 8,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    address: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    noFavoritesText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
        marginTop: 20,
    },
    closeButton: {
        backgroundColor: "#EF4423",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 15,
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default Favoritos;
