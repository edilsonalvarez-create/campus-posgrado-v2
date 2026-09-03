import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList
} from 'react-native';
import { useCourses } from '../hooks/useCourses';
import { useAuthStore } from '../store/authStore';

export function DashboardScreen({ navigation }: any) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [coursesData, progressData] = await Promise.all([
        useCourses.getCourses(isRefreshing),
        useCourses.getProgress(isRefreshing)
      ]);
      setCourses(coursesData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const activeCourses = courses.filter((c) => c.progress.percentage < 100);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={activeCourses}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={() => {
          setIsRefreshing(true);
          loadData();
        }}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>¡Bienvenido!</Text>
                <Text style={styles.userName}>{user?.name}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Salir</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{activeCourses.length}</Text>
                <Text style={styles.statLabel}>Cursos Activos</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{progress?.averageProgress || 0}%</Text>
                <Text style={styles.statLabel}>Progreso</Text>
              </View>
            </View>

            {/* Section Title */}
            <Text style={styles.sectionTitle}>Mis Cursos</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => navigation.navigate('Course', { courseId: item.id })}
          >
            <View style={styles.courseHeader}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.courseProgress}>{item.progress.percentage}%</Text>
            </View>
            <Text style={styles.courseDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.progress.percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.progress.completed} de {item.progress.total} completados
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay cursos activos</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerContent: {
    flex: 1
  },
  greeting: {
    fontSize: 14,
    color: '#666'
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8
  },
  courseCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1
  },
  courseProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginLeft: 8
  },
  courseDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981'
  },
  progressText: {
    fontSize: 11,
    color: '#999'
  },
  emptyContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  }
});
