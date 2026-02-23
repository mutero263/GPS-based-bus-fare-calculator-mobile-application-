import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';

export default function CalculateFare() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocationName, setCurrentLocationName] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);

      const currentLocationName = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setCurrentLocationName(currentLocationName[0]?.city || 'Unknown Location');
    })();
  }, []);

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestination({ latitude, longitude });

    const destinationName = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    setDestinationName(destinationName[0]?.city || 'Unknown Destination');
  };

  const calculateFare = () => {
    if (!location || !destination) return;

    // Calculate distance between two points using Haversine formula
    const R = 6371; // Earth's radius in km
    const lat1 = location.coords.latitude;
    const lon1 = location.coords.longitude;
    const lat2 = destination.latitude;
    const lon2 = destination.longitude;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const calculatedDistance = R * c;

    setDistance(calculatedDistance);

    const calculatedFare = (calculatedDistance * 0.034) + 0.50;
    setFare(calculatedFare);
  };

  // Generate unique receipt number: ZIM-YYMMDD-XXXX
  const generateReceiptId = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '').slice(2); // YYMMDD
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MUT-${datePart}-${randomPart}`;
  };

  // Navigate to receipt page with trip data
  const handleGenerateReceipt = () => {
    if (!location || !destination || fare === null || distance === null) return;

    const receiptId = generateReceiptId();
    const timestamp = new Date().toISOString();

    router.push({
      pathname: '/receipt',
      params: {
        receiptId,
        from: currentLocationName || 'Unknown',
        to: destinationName || 'Unknown',
        distanceKm: distance.toFixed(2),
        fareUSD: fare.toFixed(2),
        timestamp,
        fromLat: location.coords.latitude.toString(),
        fromLng: location.coords.longitude.toString(),
        toLat: destination.latitude.toString(),
        toLng: destination.longitude.toString(),
      },
    });
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {location && (
            <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}>
              <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Location"
                  pinColor="#007AFF"
              />
              {destination && (
                  <Marker
                      coordinate={destination}
                      title="Destination"
                      pinColor="#FF3B30"
                  />
              )}
            </MapView>
        )}

        <View style={styles.bottomSheet}>
          <Text style={styles.instructions}>
            {destination
                ? 'Tap "Calculate Fare" to see your fare'
                : 'Select destination on the map'}
          </Text>

          {destination && (
              <TouchableOpacity style={styles.button} onPress={calculateFare}>
                <Text style={styles.buttonText}>Calculate Fare</Text>
              </TouchableOpacity>
          )}

          {fare !== null && (
              <View style={styles.fareContainer}>
                <Text style={styles.fareLabel}>Bus Fare:</Text>
                <Text style={styles.fareAmount}>${fare.toFixed(2)}</Text>
                <Text style={styles.locationLabel}>From: {currentLocationName}</Text>
                <Text style={styles.locationLabel}>To: {destinationName}</Text>
                <Text style={styles.locationLabel}>Distance: {distance?.toFixed(1)} km</Text>

                {/* 🎫 Generate Receipt Button */}
                <TouchableOpacity
                    style={[styles.button, styles.receiptButton]}
                    onPress={handleGenerateReceipt}
                >
                  <Text style={styles.buttonText}>🎫 Generate Receipt</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  receiptButton: {
    backgroundColor: '#25D366', // WhatsApp green for receipt action
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fareContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  fareAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});