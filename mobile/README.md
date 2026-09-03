# Campus Posgrado Mobile App

Aplicación móvil multiplataforma (iOS + Android) para Campus Posgrado LMS.

## Features

- ✅ Autenticación multi-user con JWT
- ✅ Dashboard con cursos y progreso
- ✅ Sync offline con AsyncStorage
- ✅ Notificaciones push con Expo Notifications
- ✅ Responsive design para móviles
- ✅ Dark mode ready

## Tech Stack

- **Framework:** React Native con Expo
- **State Management:** Zustand
- **Navigation:** React Navigation
- **Storage:** AsyncStorage (offline sync)
- **API:** Axios con interceptores
- **Notifications:** Expo Notifications

## Setup

### Prerequisites

- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app (iOS/Android) o Android emulator/iOS simulator

### Installation

```bash
cd mobile
npm install
```

### Running the App

**Development (Expo Go):**
```bash
npm start
```

Then:
- iOS: Press `i` to open in iOS Simulator
- Android: Press `a` to open in Android emulator
- QR Code: Scan with Expo Go app

**Build for Production:**
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── CourseScreen.tsx (preparado)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useCourses.ts
│   ├── store/
│   │   └── authStore.ts
│   └── App.tsx
├── app.json (Expo config)
├── package.json
└── index.ts (entry point)
```

## Features por Implementar

- [ ] Pantalla de cursos detallado
- [ ] Entregas de tareas
- [ ] Quiz interactivos
- [ ] Certificados
- [ ] Push notifications automáticas
- [ ] Dark mode
- [ ] Gestos de navegación (swipe)

## Testing Accounts

**Student:**
- Email: `test@example.com`
- Password: `Password123`

**Instructor:**
- Email: `instructor@example.com`
- Password: `Password123`

## API Integration

La app se conecta a:
```
https://campus-posgrado-v2-api.railway.app/api
```

Endpoints utilizados:
- `POST /auth/login`
- `GET /auth/me`
- `GET /courses`
- `GET /progress`

## Offline Support

- ✅ Caché local de cursos y progreso
- ✅ Las llamadas online se sincronizar automáticamente
- ✅ Los datos en caché se muestran en modo offline
- ✅ Pull-to-refresh para actualizar datos

## Deployment

### iOS App Store

```bash
eas build --platform ios
eas submit --platform ios
```

### Google Play Store

```bash
eas build --platform android
eas submit --platform android
```

## Troubleshooting

### App no carga
1. Ejecutar `npm install` nuevamente
2. Limpiar caché: `expo r -c`
3. Verificar que API_URL en `app.json` es correcta

### AsyncStorage error
- En development: usar Expo Go
- Para producción: las build nativas incluyen AsyncStorage automáticamente

### Notificaciones no llegan
- Verificar permisos en configuración del dispositivo
- En iOS: Settings > Notifications > Campus Posgrado
- En Android: Settings > Apps > Campus Posgrado > Notifications

## License

MIT
