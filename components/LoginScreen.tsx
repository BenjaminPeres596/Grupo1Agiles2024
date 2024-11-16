import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; // Icono del header

const LoginScreen: React.FC = () => {
  const { login } = useAuth(); // Llama al contexto}
  const navigation = useNavigation<any>();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://meobgislltawbmlyxuhw.supabase.co/rest/v1/Usuarios?select=username,password', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2JnaXNsbHRhd2JtbHl4dWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTk2MzUsImV4cCI6MjA0NjU5NTYzNX0.LDFkamJY2LibAns-wIy1WCEl5DVdj5rjvaecIJVkJSU',
        },
      });

      const data = await response.json();

      // Verificar si el usuario existe
      const usuarioEncontrado = data.find((user: { username: string, password: string }) => user.username === usuario);
      if (!usuarioEncontrado) {
        setError('El usuario no existe');
      } else if (usuarioEncontrado.password !== password) {
        setError('Contraseña incorrecta');
      } else {
        // Login exitoso, guarda los datos del usuario en el contexto
        const userData = {
          id: usuarioEncontrado.id,
          name: usuarioEncontrado.username,
          email: usuarioEncontrado.email, // Ajusta según tu estructura de datos
        };
        login(userData); // Guardamos el usuario en el contexto
        navigation.navigate('Home');
        setError('');
      }
    } catch (error) {
      setError('Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

    return (
        <LinearGradient
            colors={['#EF4423', '#FFA726']}
            style={styles.gradient}
        >
            <View style={styles.container}>
                {/* Icono del logo */}
                <FontAwesome6 name="plate-wheat" size={100} color="#FFFFFF" style={styles.icon} />

                <Text style={styles.title}>Iniciar Sesión</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Usuario"
                    value={usuario}
                    onChangeText={setUsuario}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {error && <Text style={styles.error}>{error}</Text>}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Ingresar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', // Centra todo horizontalmente
        paddingHorizontal: 20,
    },
    icon: {
        marginBottom: 30, // Espacio entre el logo y el título
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF',
        marginBottom: 40,
    },
    input: {
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
        width: '100%', // Asegura que los campos ocupen todo el ancho del contenedor
        elevation: 2,
    },
    button: {
        backgroundColor: '#FF6F61',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        width: '100%',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    error: {
        color: '#FF6F61',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default LoginScreen;