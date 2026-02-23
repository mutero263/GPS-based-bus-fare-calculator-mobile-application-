import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Share,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
    Ticket,
    MapPin,
    Ruler,
    DollarSign,
    Share2,
    Save,
    ArrowLeft,
    Calendar,
    Hash,
    Navigation,
} from 'lucide-react-native';

// eslint-disable-next-line import/no-default-export
export default function ReceiptPage() {
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Safe param parsing
    const safeString = (val: any, fallback: string): string =>
        typeof val === 'string' && val ? val : fallback;

    const safeNumber = (val: any, fallback: number): number => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return typeof num === 'number' && !isNaN(num) ? num : fallback;
    };

    const receiptData = {
        receiptId: safeString(params.receiptId, 'N/A'),
        from: safeString(params.from, 'Unknown'),
        to: safeString(params.to, 'Unknown'),
        distanceKm: safeNumber(params.distanceKm, 0),
        fareUSD: safeNumber(params.fareUSD, 0),
        timestamp: safeString(params.timestamp, new Date().toISOString()),
        fromLat: safeNumber(params.fromLat, 0),
        fromLng: safeNumber(params.fromLng, 0),
        toLat: safeNumber(params.toLat, 0),
        toLng: safeNumber(params.toLng, 0),
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!receiptData.receiptId || receiptData.receiptId === 'N/A') {
                console.warn('Receipt loaded without valid data');
            }
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const formatTimestamp = (ts: string): string => {
        try {
            const d = new Date(ts);
            return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()} • ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        } catch {
            return ts;
        }
    };

    const usdToZwlRate = 13500;
    const fareZWL = receiptData.fareUSD * usdToZwlRate;

    const handleShareWhatsApp = async () => {
        const shareText = `Bus Fare Receipt
Receipt #: ${receiptData.receiptId}
Date: ${formatTimestamp(receiptData.timestamp)}

From: ${receiptData.from}
To: ${receiptData.to}
Distance: ${receiptData.distanceKm.toFixed(1)} km
Fare: $${receiptData.fareUSD.toFixed(2)} USD

Mutero263 GPS Fare Calculator`;

        try {
            await Share.share({ message: shareText, title: 'Bus Fare Receipt' });
        } catch {
            Alert.alert('Error', 'Could not share receipt.');
        }
    };

    const handleSaveReceipt = async () => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const existing = await AsyncStorage.getItem('receipts');
            const receipts = existing ? JSON.parse(existing) : [];
            receipts.unshift({ ...receiptData, savedAt: new Date().toISOString() });
            await AsyncStorage.setItem('receipts', JSON.stringify(receipts));
            Alert.alert('✓ Saved!', 'Receipt saved to history.');
        } catch {
            Alert.alert('Error', 'Could not save receipt.');
        }
    };

    const handleBack = () => router.back();

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={handleBack}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const hasValidCoords = receiptData.fromLat > 0 && receiptData.toLat > 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowLeft size={20} color="#007AFF" />
                    <Text style={styles.backText}>Back to Map</Text>
                </TouchableOpacity>
            </View>

            {/* Receipt Card */}
            <View style={styles.card}>
                {/* Title */}
                <View style={styles.titleRow}>
                    <Ticket size={32} color="#007AFF" />
                    <Text style={styles.title}>FARE RECEIPT</Text>
                </View>
                <View style={styles.divider} />

                {/* Receipt ID */}
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Hash size={16} color="#666" />
                        <Text style={styles.label}>Receipt #</Text>
                    </View>
                    <Text style={styles.value}>{receiptData.receiptId}</Text>
                </View>

                {/* Timestamp */}
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Calendar size={16} color="#666" />
                        <Text style={styles.label}>Date & Time</Text>
                    </View>
                    <Text style={styles.value}>{formatTimestamp(receiptData.timestamp)}</Text>
                </View>

                {/* Map Preview */}
                {hasValidCoords && (
                    <View style={styles.mapBox}>
                        <MapView
                            style={styles.map}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                            initialRegion={{
                                latitude: (receiptData.fromLat + receiptData.toLat) / 2,
                                longitude: (receiptData.fromLng + receiptData.toLng) / 2,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            <Marker coordinate={{ latitude: receiptData.fromLat, longitude: receiptData.fromLng }} pinColor="#007AFF" />
                            <Marker coordinate={{ latitude: receiptData.toLat, longitude: receiptData.toLng }} pinColor="#FF3B30" />
                            <Polyline
                                coordinates={[
                                    { latitude: receiptData.fromLat, longitude: receiptData.fromLng },
                                    { latitude: receiptData.toLat, longitude: receiptData.toLng },
                                ]}
                                strokeColor="#007AFF"
                                strokeWidth={3}
                            />
                        </MapView>
                    </View>
                )}

                {/* Route */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MapPin size={18} color="#333" />
                        <Text style={styles.sectionTitle}>Route</Text>
                    </View>
                    <View style={styles.routeBox}>
                        <View style={styles.routeRow}>
                            <View style={[styles.dot, styles.dotBlue]} />
                            <View>
                                <Text style={styles.routeLabel}>From</Text>
                                <Text style={styles.routeText}>{receiptData.from}</Text>
                            </View>
                        </View>
                        <View style={styles.routeLine} />
                        <View style={styles.routeRow}>
                            <View style={[styles.dot, styles.dotRed]} />
                            <View>
                                <Text style={styles.routeLabel}>To</Text>
                                <Text style={styles.routeText}>{receiptData.to}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.distanceRow}>
                        <Ruler size={14} color="#666" />
                        <Text style={styles.distance}>{receiptData.distanceKm.toFixed(1)} km</Text>
                    </View>
                </View>

                {/* Fare */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <DollarSign size={18} color="#333" />
                        <Text style={styles.sectionTitle}>Fare Details</Text>
                    </View>
                    <View style={styles.fareBox}>
                        <View style={styles.fareRow}>
                            <Text style={styles.fareLabel}>Total:</Text>
                            <Text style={styles.fareAmount}>${receiptData.fareUSD.toFixed(2)} USD</Text>
                        </View>
                        <Text style={styles.fareZWL}>≈ ZWL {fareZWL.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Navigation size={16} color="#333" />
                        <Text style={styles.footerText}>Mutero263</Text>
                    </View>
                    <Text style={styles.footerSub}>GPS Fare Calculator</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.btnContainer}>
                <TouchableOpacity style={[styles.btn, styles.shareBtn]} onPress={handleShareWhatsApp}>
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.btnText}>Share via WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSaveReceipt}>
                    <Save size={20} color="#fff" />
                    <Text style={styles.btnText}>Save to History</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.spacer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
    errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#FF3B30', marginBottom: 16 },
    errorText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
    header: { marginBottom: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    backText: { color: '#007AFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 10, letterSpacing: 1 },
    divider: { height: 2, backgroundColor: '#007AFF', marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 14, color: '#666', fontWeight: '500', marginLeft: 8 },
    value: { fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'right' },
    mapBox: { marginVertical: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#007AFF' },
    map: { width: '100%', height: 150 },
    section: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8 },
    routeBox: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 12 },
    routeRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    dotBlue: { backgroundColor: '#007AFF' },
    dotRed: { backgroundColor: '#FF3B30' },
    routeLabel: { fontSize: 12, color: '#666' },
    routeText: { fontSize: 15, fontWeight: '600', color: '#333' },
    routeLine: { width: 2, height: 20, backgroundColor: '#ddd', marginLeft: 5, marginVertical: 4 },
    distanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    distance: { fontSize: 14, color: '#666', fontStyle: 'italic', marginLeft: 6 },
    fareBox: { backgroundColor: '#f0f8ff', borderRadius: 12, padding: 12 },
    fareFormula: { fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' },
    fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    fareLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
    fareAmount: { fontSize: 28, fontWeight: 'bold', color: '#007AFF' },
    fareZWL: { fontSize: 13, color: '#666', marginTop: 4 },
    footer: { marginTop: 24, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#007AFF', alignItems: 'center' },
    footerRow: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 6 },
    footerSub: { fontSize: 12, color: '#666', marginTop: 2 },
    btnContainer: { marginTop: 20, gap: 12 },
    btn: { flexDirection: 'row', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    shareBtn: { backgroundColor: '#25D366' },
    saveBtn: { backgroundColor: '#007AFF' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    spacer: { height: 40 },
    button: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});