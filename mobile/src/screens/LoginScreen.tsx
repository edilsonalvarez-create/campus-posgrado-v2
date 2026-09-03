import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Password123');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Campus Posgrado</Text>
          <Text style={styles.subtitle}>Plataforma de Aprendizaje</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text style={styles.registerLink}>
              ¿No tienes cuenta? <Text style={styles.registerLinkBold}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo Account</Text>
          <Text style={styles.demoText}>Email: test@example.com</Text>
          <Text style={styles.demoText}>Password: Password123</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  form: {
    marginBottom: 30
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000'
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20
  },
  registerLink: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666'
  },
  registerLinkBold: {
    color: '#2563eb',
    fontWeight: '600'
  },
  demoBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    padding: 16,
    borderRadius: 8
  },
  demoTitle: {
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8
  },
  demoText: {
    fontSize: 12,
    color: '#1e3a8a',
    marginVertical: 2
  }
});
