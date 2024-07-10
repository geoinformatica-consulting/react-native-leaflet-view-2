import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import {
  MapMarker,
  WebviewLeafletMessage,
  MapMessage,
  WebViewLeafletEvents,
  MapLayer,
  MapShape,
  OwnPositionMarker,
  OWN_POSTION_MARKER_ID,
} from './types';
import ReactLeaflet from 'leaflet';
import { NativeSyntheticEvent, Platform, StyleSheet } from 'react-native';
import {
  WebViewError,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import LoadingIndicator from '../LoadingIndicator';

const LEAFLET_HTML_SOURCE = Platform.select({
  ios: require('../assets/leaflet.html'),
  android: require('../assets/leaflet.html'),
  web: require('../assets/leaflet.html')
});

const DEFAULT_MAP_LAYERS = [
  {
    attribution:'OpenStreetMap',
    baseLayerIsChecked: true,
    baseLayerName: '',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
];

const DEFAULT_ZOOM = 15;

export type LeafletViewProps = {
  renderLoading?: () => React.ReactElement;
  onError?: (syntheticEvent: NativeSyntheticEvent<WebViewError>) => void;
  onLoadEnd?: () => void;
  onLoadStart?: () => void;
  onMessageReceived?: (message: WebviewLeafletMessage) => void;
  mapLayers?: MapLayer[];
  mapMarkers?: MapMarker[];
  mapShapes?: MapShape[];
  mapCenterPosition?: ReactLeaflet.LatLng;
  ownPositionMarker?: OwnPositionMarker;
  zoom?: number;
  zoomControl?: boolean;
  doDebug?: boolean;
  androidHardwareAccelerationDisabled?: boolean;
};

const LeafletView: React.FC<LeafletViewProps> = ({
  renderLoading,
  onError,
  onLoadEnd,
  onLoadStart,
  onMessageReceived,
  mapLayers,
  mapMarkers,
  mapShapes,
  mapCenterPosition,
  ownPositionMarker,
  zoom,
  zoomControl,
  doDebug,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [initialized, setInitialized] = useState(false);

  const logMessage = useCallback(
    (message: string) => {
      if (doDebug) {
        console.log(message);
      }
    },
    [doDebug]
  );

  const sendMessage = useCallback(
    (payload: MapMessage) => {
      logMessage(`sending: ${JSON.stringify(payload)}`);

      webViewRef.current?.injectJavaScript(
        `window.postMessage(${JSON.stringify(payload)}, '*');`
      );
    },
    [logMessage]
  );

  const sendInitialMessage = useCallback(() => {
    let startupMessage: MapMessage = {};

    if (mapLayers) {
      startupMessage.mapLayers = mapLayers;
    }
    if (mapMarkers) {
      startupMessage.mapMarkers = mapMarkers;
    }
    if (mapCenterPosition) {
      startupMessage.mapCenterPosition = mapCenterPosition;
    }
    if (mapShapes) {
      startupMessage.mapShapes = mapShapes;
    }
    if (ownPositionMarker) {
      startupMessage.ownPositionMarker = {
        ...ownPositionMarker,
        id: OWN_POSTION_MARKER_ID,
      };
    }
    startupMessage.zoom = zoom;
    startupMessage.zoomControl = zoomControl;

    sendMessage(startupMessage);
    setInitialized(true);
    logMessage('sending initial message');
  }, [
    logMessage,
    mapCenterPosition,
    mapLayers,
    mapMarkers,
    mapShapes,
    ownPositionMarker,
    sendMessage,
    zoom,
    zoomControl,
  ]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = event?.nativeEvent?.data;
      if (!data) {
        return;
      }

      const message: WebviewLeafletMessage = JSON.parse(data);
      logMessage(`received: ${JSON.stringify(message)}`);

      if (message.msg === WebViewLeafletEvents.MAP_READY) {
        sendInitialMessage();
      }
      if (message.event === WebViewLeafletEvents.ON_MOVE_END) {
        logMessage(
          `moved to: ${JSON.stringify(message.payload?.mapCenterPosition)}`
        );
      }

      onMessageReceived && onMessageReceived(message);
    },
    [logMessage, onMessageReceived, sendInitialMessage]
  );

  //Handle mapLayers update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapLayers });
  }, [initialized, mapLayers, sendMessage]);

  //Handle mapMarkers update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapMarkers });
  }, [initialized, mapMarkers, sendMessage]);

  //Handle mapShapes update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapShapes });
  }, [initialized, mapShapes, sendMessage]);

  //Handle ownPositionMarker update
  useEffect(() => {
    if (!initialized || !ownPositionMarker) {
      return;
    }
    sendMessage({ ownPositionMarker });
  }, [initialized, ownPositionMarker, sendMessage]);

  //Handle mapCenterPosition update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapCenterPosition });
  }, [initialized, mapCenterPosition, sendMessage]);

  //Handle zoom update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({
      zoom,
    });
  }, [initialized, zoom, sendMessage]);

  // Handle zoom control update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({
      zoomControl
    });
  }, [initialized, zoomControl, sendMessage]);

  return (
    <WebView
      containerStyle={styles.container}
      ref={webViewRef}
      javaScriptEnabled={true}
      onLoadEnd={onLoadEnd}
      onLoadStart={onLoadStart}
      onMessage={handleMessage}
      domStorageEnabled={true}
      startInLoadingState={true}
      onError={onError}
      originWhitelist={['*']}
      renderLoading={renderLoading}
      source={LEAFLET_HTML_SOURCE}
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      allowFileAccessFromFileURLs={true}
    />
  );
};

LeafletView.defaultProps = {
  renderLoading: () => <LoadingIndicator />,
  mapLayers: DEFAULT_MAP_LAYERS,
  zoom: DEFAULT_ZOOM,
  zoomControl: true,
  doDebug: __DEV__,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
});

export default LeafletView;
