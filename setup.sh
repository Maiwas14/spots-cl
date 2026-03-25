#!/bin/bash

# ================================================
# Rincones - Script de instalación
# ================================================

set -e

echo ""
echo "🏔️  Configurando Rincones..."
echo ""

# Verificar que existe el proyecto Expo
if [ ! -f "package.json" ]; then
  echo "❌ No se encontró package.json. Asegúrate de correr esto dentro del proyecto Expo."
  exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npx expo install \
  expo-image-picker \
  expo-location \
  expo-image-manipulator \
  expo-font \
  expo-splash-screen \
  expo-constants \
  react-native-maps \
  react-native-safe-area-context \
  react-native-screens \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-url-polyfill \
  @react-native-async-storage/async-storage

npm install \
  @supabase/supabase-js \
  zustand \
  date-fns

echo ""
echo "✅ Dependencias instaladas."
echo ""

# Crear carpetas si no existen
echo "📁 Creando estructura de carpetas..."
mkdir -p app/\(auth\)
mkdir -p app/\(tabs\)
mkdir -p app/lugar
mkdir -p app/perfil
mkdir -p components
mkdir -p hooks
mkdir -p lib
mkdir -p stores
mkdir -p types
mkdir -p constants

echo "✅ Estructura lista."
echo ""
echo "🚀 Ahora copia los archivos generados a su destino y ejecuta:"
echo ""
echo "   npx expo start"
echo ""
echo "📱 Escanea el QR con Expo Go (Android) o la cámara (iOS)"
echo ""
