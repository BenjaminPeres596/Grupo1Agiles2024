import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface HeaderProps {
    title: string;
    onProfilePress?: () => void;
    onSearchPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title,
    onProfilePress,
    onSearchPress,
}) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={onProfilePress} style={styles.iconContainer}>
                    <Ionicons name="star-outline" size={28} color="white" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <FontAwesome6 name="plate-wheat" size={20} color="#FFFFFF" style={styles.icon} />
                </View>

                <TouchableOpacity onPress={onSearchPress} style={styles.iconContainer}>
                    <Ionicons name="search-outline" size={28} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#EF4423",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#EF4423",
        height: 75,
        paddingHorizontal: 16,
    },
    titleContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 16,
    },
    title: {
        fontSize: 18, // Tamaño reducido del texto
        fontWeight: "600",
        color: "white",
        fontFamily: "AvenirNext-DemiBold",
        marginBottom: 2, // Espacio entre el texto y el icono
    },
    icon: {
        marginTop: 2, // Espacio entre el texto y el icono
    },
    iconContainer: {
        padding: 8,
    },
});

export default Header;
