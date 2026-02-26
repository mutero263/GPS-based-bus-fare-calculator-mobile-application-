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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
    Ticket,
    MapPin,
    Ruler,
    DollarSign,
    Share2,
    Save,
    Download,
    ArrowLeft,
    Calendar,
    Hash,
    Navigation,
} from 'lucide-react-native';

// eslint-disable-next-line import/no-default-export, spellcheck/spell-checker
export default function ReceiptPage() {
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);

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
        const timer = setTimeout(() => setLoading(false), 300);
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

    // Generate PDF HTML Template
    const generatePdfHtml = () => {
        return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
            .receipt { background: #fff; border-radius: 16px; padding: 24px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #007AFF; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #333; display: flex; align-items: center; justify-content: center; gap: 10px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .label { color: #666; font-size: 14px; font-weight: 500; }
            .value { color: #333; font-size: 14px; font-weight: 600; text-align: right; }
            .route-box { background: #f8f8f8; border-radius: 12px; padding: 16px; margin: 16px 0; }
            .route-point { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
            .dot { width: 12px; height: 12px; border-radius: 50%; }
            .dot-blue { background: #007AFF; }
            .dot-red { background: #FF3B30; }
            .route-text { flex: 1; }
            .route-label { font-size: 12px; color: #666; }
            .route-name { font-size: 15px; font-weight: 600; color: #333; }
            .fare-box { background: #f0f8ff; border-radius: 12px; padding: 16px; margin: 16px 0; }
            .fare-total { font-size: 28px; font-weight: bold; color: #007AFF; text-align: right; }
            .footer { text-align: center; border-top: 2px solid #007AFF; padding-top: 16px; margin-top: 24px; }
            .footer-text { font-size: 18px; font-weight: bold; color: #333; }
            .footer-sub { font-size: 12px; color: #666; margin-top: 4px; }
            .watermark { text-align: center; color: #999; font-size: 10px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">🎫 FARE RECEIPT</div>
            </div>
            <div class="info-row">
              <span class="label">🆔 Receipt #</span>
              <span class="value">${receiptData.receiptId}</span>
            </div>
            <div class="info-row">
              <span class="label">📅 Date & Time</span>
              <span class="value">${formatTimestamp(receiptData.timestamp)}</span>
            </div>
            <div class="route-box">
              <div class="route-point">
                <div class="dot dot-blue"></div>
                <div class="route-text">
                  <div class="route-label">From</div>
                  <div class="route-name">${receiptData.from}</div>
                </div>
              </div>
              <div style="width: 2px; height: 20px; background: #ddd; margin: 4px 0 4px 5px;"></div>
              <div class="route-point">
                <div class="dot dot-red"></div>
                <div class="route-text">
                  <div class="route-label">To</div>
                  <div class="route-name">${receiptData.to}</div>
                </div>
              </div>
            </div>
            <div class="info-row">
              <span class="label">📏 Distance</span>
              <span class="value">${receiptData.distanceKm.toFixed(1)} km</span>
            </div>
            <div class="fare-box">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-style: italic;">
                Formula: (${receiptData.distanceKm.toFixed(1)} × $0.034) + $0.50
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="label">Total Fare:</span>
                <span class="fare-total">$${receiptData.fareUSD.toFixed(2)} USD</span>
              </div>
              <div style="text-align: right; font-size: 13px; color: #666; margin-top: 4px;">
                ≈ ZWL ${fareZWL.toLocaleString()}
              </div>
            </div>
            <div class="footer">
              <div class="footer-text">🇿🇼 Mutero263</div>
              <div class="footer-sub">GPS Fare Calculator</div>
              <div class="watermark">Generated on ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </body>
      </html>
    `;
    };

    // Generate and Share PDF
    const handleDownloadPdf = async () => {
        setGeneratingPdf(true);
        try {
            // Generate PDF file - returns a valid file URI
            const { uri } = await Print.printToFileAsync({
                html: generatePdfHtml(),
            });

            // Share the PDF directly using the URI from printToFileAsync
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Save Receipt',
                });
            } else {
                Alert.alert('✓ Ready!', 'PDF generated. Use a file manager to access it.');
            }
        } catch (err) {
            console.error('PDF error:', err);
            Alert.alert('Error', 'Could not generate PDF. Please try again.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    // Save
    const handleSaveReceipt = async () => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;

            const existing = await AsyncStorage.getItem('receipts');
            const receipts = existing ? JSON.parse(existing) : [];

            const newReceipt = {
                ...receiptData,
                savedAt: new Date().toISOString(),
            };

            receipts.unshift(newReceipt);
            await AsyncStorage.setItem('receipts', JSON.stringify(receipts));

            Alert.alert('✓ Saved!', 'Receipt saved to your history.');
        } catch (err) {
            console.error('Save error:', err);
            Alert.alert('Error', 'Could not save receipt.');
        }
    };

    // Share via WhatsApp
    const handleShareWhatsApp = async () => {
        const shareText = `Bus Fare Receipt - Mutero263
Receipt #: ${receiptData.receiptId}
Date: ${formatTimestamp(receiptData.timestamp)}

From: ${receiptData.from}
To: ${receiptData.to}
Distance: ${receiptData.distanceKm.toFixed(1)} km
Fare: $${receiptData.fareUSD.toFixed(2)} USD

📎 PDF receipt available - tap Download to save!

Mutero263 GPS Fare Calculator`;

        Alert.alert(
            'Share Receipt',
            'How would you like to share?',
            [
                {
                    text: 'Share Text Only',
                    onPress: async () => {
                        try {
                            await Share.share({ message: shareText, title: 'Bus Fare Receipt' });
                        } catch {
                            Alert.alert('Error', 'Could not share.');
                        }
                    },
                },
                {
                    text: 'Share PDF',
                    onPress: handleDownloadPdf,
                },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const handleBack = () => router.back();

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
                    <Text style={styles.title}>FARE TICKET</Text>
                </View>
                <View style={styles.divider} />

                {/* Receipt ID */}
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Hash size={16} color="#666" />
                        <Text style={styles.label}>Ticket #</Text>
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

            {/* Action Buttons */}
            <View style={styles.btnContainer}>
                <TouchableOpacity
                    style={[styles.btn, styles.shareBtn]}
                    onPress={handleShareWhatsApp}
                    disabled={generatingPdf}
                >
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.btnText}>{generatingPdf ? 'Generating...' : 'Share via WhatsApp'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.saveBtn]}
                    onPress={handleSaveReceipt}
                    disabled={generatingPdf}
                >
                    <Save size={20} color="#fff" />
                    <Text style={styles.btnText}>Save</Text>
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
    downloadBtn: { backgroundColor: '#FF9500' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    spacer: { height: 40 },
});