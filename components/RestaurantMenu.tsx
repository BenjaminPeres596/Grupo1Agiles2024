import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

type Plato = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isLactoseFree?: boolean;
  isGlutenFree?: boolean;
};

type RestaurantMenuProps = {
  restaurantId: string;
  onClose: () => void;
};

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({
  restaurantId,
  onClose,
}) => {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU";
  const platosUrl = `https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Platos?select=*&restaurantId=eq.${restaurantId}`;
  const restaurantUrl = `https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Restaurantes?id=eq.${restaurantId}`;

  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        const response = await fetch(platosUrl, {
          headers: {
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error en la solicitud de platos");
        }
        const data = await response.json();
        setPlatos(data);
      } catch (error) {
        console.error("Error fetching platos:", error);
      }
    };

    const fetchRestaurantName = async () => {
      try {
        const response = await fetch(restaurantUrl, {
          headers: {
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error en la solicitud del restaurante");
        }
        const data = await response.json();
        setRestaurantName(data[0]?.name || "Restaurante");
      } catch (error) {
        console.error("Error fetching restaurant name:", error);
      }
    };

    setLoading(true);

    Promise.all([fetchPlatos(), fetchRestaurantName()]).finally(() => {
      setLoading(false);
    });
  }, [restaurantId]);

  return (
    <SafeAreaView style={styles.menuContainer}>
      <Text style={styles.menuTitle}>Menú de {restaurantName}</Text>
      <View style={styles.menuTitleSeparator} />

      {loading ? (
        <ActivityIndicator size="large" color="#FF0000" style={styles.loader} />
      ) : (
        <FlatList
          data={platos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const emblems: any[] = [];
            if (item.isGlutenFree)
              emblems.push(require("../icons/gluten-free.png"));
            if (item.isVegetarian)
              emblems.push(require("../icons/vegetarian.png"));
            if (item.isVegan) emblems.push(require("../icons/vegan.png"));
            if (item.isLactoseFree)
              emblems.push(require("../icons/lactose-free.png"));

            return (
              <View style={styles.PlatoContainer}>
                <Image source={{ uri: item.image }} style={styles.PlatoImage} />
                <View style={styles.PlatoInfo}>
                  <Text style={styles.PlatoName}>{item.name}</Text>
                  <View style={styles.EmblemsContainer}>
                    {emblems.map((emblem, index) => (
                      <Image
                        key={index}
                        source={emblem}
                        style={styles.EmblemIcon}
                      />
                    ))}
                  </View>
                  <Text style={styles.PlatoDescription}>
                    {item.description}
                  </Text>
                  <Text style={styles.PlatoPrice}>${item.price}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
        <Text style={styles.buttonText}>Cerrar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RestaurantMenu;

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
  },
  menuTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#EF4423",
    textAlign: "center",
    marginVertical: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  menuTitleSeparator: {
    height: 2,
    width: "50%",
    backgroundColor: "#EF4423",
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 5,
  },
  PlatoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderLeftColor: "#EF4423",
    borderRightColor: "#EF4423",
  },
  PlatoImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  PlatoInfo: {
    flex: 1,
    justifyContent: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  PlatoName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  EmblemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  EmblemIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  PlatoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  PlatoPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4423",
  },
  buttonClose: {
    backgroundColor: "#EF4423",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    width: "60%",
    shadowColor: "#EF4423",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
