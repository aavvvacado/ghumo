/**
 * Map Background Layer
 * Pure 100% Free OpenStreetMap (OSM) Tile Layer via react-native-webview.
 * Zero API keys required - No watermarks, no rate limits.
 * Features:
 * - Free official OpenStreetMap tile server (tile.openstreetmap.org)
 * - Intelligent Dark Mode CSS inversion filter (sleek charcoal night map)
 * - Geolocation pin: Glowing pulse dot ("📍 You Are Here")
 * - Dynamic place pins for search results (lat, lng, place name, rating)
 * - Auto camera framing (fitBounds & flyTo)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/context/themeContext';
import { useHome } from '@/context/homeContext';
import { PlaceSearchResult } from '@/domain/models/search';
import { resolvePlaceCoordinates } from '@/utils/geoUtils';

export const MapBackground: React.FC = () => {
  const { isDark } = useTheme();
  const {
    userLocation,
    searchResults,
    categorizedResults,
    activeMapCategory,
    aiResponse,
    selectedPlaceId,
    setSelectedPlaceId,
  } = useHome();
  const webViewRef = useRef<WebView>(null);

  const activePlaces = useMemo(() => {
    if (categorizedResults && categorizedResults.places.length > 0) {
      let list = categorizedResults.places;
      if (activeMapCategory === 'food') list = categorizedResults.food;
      else if (activeMapCategory === 'markets') list = categorizedResults.markets;
      else if (activeMapCategory === 'attractions') list = categorizedResults.attractions;
      else if (activeMapCategory === 'hidden_gems') list = categorizedResults.hidden_gems;
      return list.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || p.city || 'Place',
        rating: p.rating || p.feedback?.averageRating || 4.8,
        lat: p.lat,
        lng: p.lng,
      }));
    }

    if (searchResults.length > 0) {
      let list = searchResults;
      if (activeMapCategory === 'food') list = searchResults.filter((p) => p.type === 'food' || p.category?.toLowerCase().includes('food'));
      else if (activeMapCategory === 'markets') list = searchResults.filter((p) => p.type === 'market' || p.category?.toLowerCase().includes('market'));
      else if (activeMapCategory === 'attractions') list = searchResults.filter((p) => p.type === 'attraction' || (!p.type?.includes('food') && !p.type?.includes('market')));
      return list.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || p.city || 'Place',
        rating: p.rating || p.feedback?.averageRating || 4.8,
        lat: p.lat,
        lng: p.lng,
      }));
    }

    if (aiResponse) {
      const places: { id: string; name: string; category?: string; rating?: number | null; lat?: number; lng?: number }[] = [];
      const selectedDay = activeMapCategory && activeMapCategory.startsWith('day_')
        ? parseInt(activeMapCategory.replace('day_', ''), 10)
        : null;

      if (aiResponse.days && aiResponse.days.length > 0) {
        aiResponse.days.forEach((day, dIdx) => {
          if (selectedDay === null || selectedDay === dIdx) {
            (day.activities || day.places || []).forEach((act, actIdx) => {
              places.push({
                id: `ai_d${dIdx}_p${actIdx}`,
                name: act.name || act.place || 'Stop',
                category: `Day ${day.dayNumber || day.day || dIdx + 1}`,
                rating: 4.8,
                lat: act.lat,
                lng: act.lng,
              });
            });
          }
        });
      } else if (aiResponse.recommended_places && aiResponse.recommended_places.length > 0) {
        aiResponse.recommended_places.forEach((p, idx) => {
          places.push({
            id: `ai_d0_p${idx}`,
            name: p.name,
            category: p.type === 'food' ? 'Food Stop' : (p.type || 'Highlight'),
            rating: 4.8,
            lat: p.lat,
            lng: p.lng,
          });
        });
      }

      return places;
    }

    return [];
  }, [categorizedResults, searchResults, aiResponse, activeMapCategory]);

  const placePins = useMemo(() => {
    const destinationContext = aiResponse?.location || aiResponse?.title || '';
    return activePlaces
      .map((place, idx) => {
        const coords = resolvePlaceCoordinates(place, destinationContext, idx);
        return coords ? { place, coords } : null;
      })
      .filter((item): item is { place: (typeof activePlaces)[0]; coords: { lat: number; lng: number } } => item !== null);
  }, [activePlaces, aiResponse]);

  // Prepare map data payload for webview injection
  const mapData = {
    isDark,
    userLocation,
    pins: placePins.map((p) => ({
      id: p.place.id,
      name: p.place.name,
      category: p.place.category || 'Destination',
      rating: p.place.rating || null,
      lat: p.coords.lat,
      lng: p.coords.lng,
    })),
    selectedPlaceId,
  };

  // Inject updated marker data into Leaflet WebView whenever state updates
  useEffect(() => {
    if (!webViewRef.current) return;
    const jsCode = `if (window.updateGhumoMap) { window.updateGhumoMap(${JSON.stringify(mapData)}); } true;`;
    webViewRef.current.injectJavaScript(jsCode);
  }, [userLocation, activePlaces, placePins, isDark, selectedPlaceId]);

  const initialLat = userLocation?.latitude || 28.6139;
  const initialLng = userLocation?.longitude || 77.2090;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: ${isDark ? '#191816' : '#F6F1E9'};
    }
    .leaflet-control-container .leaflet-routing-container-hide {
      display: none !important;
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      opacity: 0.6;
      background: rgba(0,0,0,0.4) !important;
      color: #fff !important;
    }

    /* 100% Free OpenStreetMap Dark Mode Styling (Zero API Key, No Watermark) */
    .dark-mode .leaflet-tile {
      filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(92%);
    }

    .user-pulse-marker {
      width: 24px;
      height: 24px;
      box-sizing: border-box;
      background: rgba(217, 83, 56, 0.35);
      border: 2px solid #D95338;
      border-radius: 50%;
      box-shadow: 0 0 14px rgba(217, 83, 56, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
    }
    .user-pulse-dot {
      width: 10px;
      height: 10px;
      box-sizing: border-box;
      background: #D95338;
      border-radius: 50%;
      border: 1.5px solid #FFFFFF;
      flex-shrink: 0;
    }
    .place-pin-marker {
      background: #D95338;
      color: #FFFFFF;
      padding: 5px 12px;
      border-radius: 9999px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      border: 1.5px solid rgba(255,255,255,0.85);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      transform: translate(-50%, -50%);
      cursor: pointer;
    }
    .place-pin-marker.selected-pin {
      background: #E85D04;
      border-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(235,94,40,0.45), 0 6px 16px rgba(0,0,0,0.5);
      transform: translate(-50%, -50%) scale(1.08);
      z-index: 9999 !important;
    }
    .custom-popup .leaflet-popup-content-wrapper {
      background: ${isDark ? '#2B2825' : '#FFFFFF'};
      color: ${isDark ? '#FFF' : '#111'};
      border-radius: 12px;
      padding: 4px 8px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    .custom-popup .leaflet-popup-tip {
      background: ${isDark ? '#2B2825' : '#FFFFFF'};
    }
  </style>
</head>
<body class="${isDark ? 'dark-mode' : ''}">
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${initialLat}, ${initialLng}], 14);

    // Official OpenStreetMap (OSM) Tile Server - 100% Free, No Watermark, No API Key
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var userMarker = null;
    var placeMarkers = [];

    window.updateGhumoMap = function(data) {
      if (!data) return;

      if (data.isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }

      // User location marker
      if (data.userLocation) {
        var uLat = data.userLocation.latitude;
        var uLng = data.userLocation.longitude;
        var userIcon = L.divIcon({
          className: '',
          html: '<div class="user-pulse-marker"><div class="user-pulse-dot"></div></div>',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          popupAnchor: [0, -14]
        });

        if (userMarker) {
          userMarker.setLatLng([uLat, uLng]);
        } else {
          userMarker = L.marker([uLat, uLng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b style="color:#D95338;display:flex;align-items:center;gap:4px;">You Are Here</b><span style="font-size:11px;color:#888;">Current Geolocation</span>', { className: 'custom-popup' });
        }
      }

      // Clear old place markers
      placeMarkers.forEach(function(m) { map.removeLayer(m); });
      placeMarkers = [];

      var boundsPoints = [];
      if (data.userLocation) {
        boundsPoints.push([data.userLocation.latitude, data.userLocation.longitude]);
      }

      var selectedMarker = null;

      if (data.pins && data.pins.length > 0) {
        data.pins.forEach(function(pin) {
          boundsPoints.push([pin.lat, pin.lng]);
          var isSelected = data.selectedPlaceId === pin.id;
          var pinIcon = L.divIcon({
            className: '',
            html: '<div class="place-pin-marker' + (isSelected ? ' selected-pin' : '') + '">' + pin.name + '</div>',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, -14]
          });

          var popupContent = '<b style="display:flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="#D95338"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>' + pin.name + '</b><span style="font-size:11px;color:#D95338;">' + pin.category + '</span>';
          if (pin.rating) {
            popupContent += '<br><span style="font-size:11px;font-weight:bold;color:#D95338;display:inline-flex;align-items:center;gap:2px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="#D95338"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> ' + pin.rating + ' / 5</span>';
          }

          var marker = L.marker([pin.lat, pin.lng], { icon: pinIcon })
            .addTo(map)
            .bindPopup(popupContent, { className: 'custom-popup' });

          marker.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PLACE', id: pin.id }));
            }
          });

          if (isSelected) {
            selectedMarker = marker;
          }

          placeMarkers.push(marker);
        });
      }

      // Camera centering & zoom behavior:
      // 1. If a place on the carousel is clicked/selected -> smoothly fly to that place and open its popup
      // 2. If pins exist without a specific selected pin -> frame all place pins
      // 3. If no search/itinerary pins exist -> smoothly pan back to user's current location
      if (data.selectedPlaceId && data.pins && data.pins.length > 0) {
        var activePin = data.pins.find(function(p) { return p.id === data.selectedPlaceId; });
        if (activePin) {
          map.flyTo([activePin.lat, activePin.lng], 16, { animate: true, duration: 0.8 });
          if (selectedMarker) {
            selectedMarker.openPopup();
          }
        }
      } else if (data.pins && data.pins.length > 0) {
        var pinPoints = data.pins.map(function(p) { return [p.lat, p.lng]; });
        if (pinPoints.length > 1) {
          map.fitBounds(pinPoints, { padding: [50, 50], maxZoom: 15 });
        } else if (pinPoints.length === 1) {
          map.setView(pinPoints[0], 15, { animate: true });
        }
      } else if (data.userLocation) {
        map.setView([data.userLocation.latitude, data.userLocation.longitude], 15, { animate: true });
        if (userMarker) {
          userMarker.openPopup();
        }
      }
    };

    // Initial trigger
    window.updateGhumoMap(${JSON.stringify(mapData)});
  </script>
</body>
</html>
  `;

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PLACE' && data.id) {
        setSelectedPlaceId(data.id);
      }
    } catch {
      // Ignore invalid JSON
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="auto">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMapMessage}
        style={StyleSheet.absoluteFill}
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 0,
  },
});
