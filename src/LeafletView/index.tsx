import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MapMarker,
  ViewLeafletMessage,
  MapMessage,
  WebViewLeafletEvents,
  MapLayer,
  MapShape,
  OwnPositionMarker,
  OWN_POSTION_MARKER_ID,
} from './types';
import ReactLeaflet from 'leaflet';
import { StyleSheet } from 'react-native';
// import LoadingIndicator from '../LoadingIndicator';
import WebView, { WebViewRef, WebViewMessageEvent }  from 'react-native-webview-alternative';

const LEAFLET_HTML_SOURCE = {
  html: require('../assets/leaflet.html')
};

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
  onLoad?: () => void;
  onMessageReceived?: (message: ViewLeafletMessage) => void;
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
  onLoad,
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

  // if (!renderLoading) {
  //   renderLoading = <LoadingIndicator/>
  // };
  if (!mapLayers) {
    mapLayers = DEFAULT_MAP_LAYERS
  };
  if (!zoom) {
    zoom = DEFAULT_ZOOM;
  };
  if (!zoomControl) {
    zoomControl = true
  };
  if (!doDebug) {
    doDebug = true
  };

  const viewRef = useRef<WebViewRef>(null)

  const [initialized, setInitialized] = useState(false);
  // const [mainMessage, setMainMessage] = useState('')

  const logMessage = useCallback(
    (message: string) => {
      if (doDebug) {
        console.log(message);
        // setMainMessage(message);
      }
    },
    [doDebug]
  );


  const sendMessage = useCallback(
    (payload: MapMessage) => {
      const _message1 = `sending: ${JSON.stringify(payload)}`
      logMessage(_message1);

      const _message2 = `window.postMessage(${JSON.stringify(payload)}, '*');`
      viewRef.current?.injectJavaScript(_message2);
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
      const msg = event?.nativeEvent?.message.toString();// | mainMessage;
      if (!msg) {
        return;
      }

      const message: ViewLeafletMessage = JSON.parse(msg);
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

  // return (
  //   <View
  //     style={styles.container}
  //     ref={viewRef}
  //     onMessage={handleMessage}
  //     domStorageEnabled={true}
  //     startInLoadingState={true}
  //     onError={onError}
  //     originWhitelist={['*']}
  //     renderLoading={renderLoading}
  //     source={LEAFLET_HTML_SOURCE}
  //     allowFileAccess={true}
  //     allowUniversalAccessFromFileURLs={true}
  //     allowFileAccessFromFileURLs={true}
  //   />
  // );

  // For Alternative WebView
  return (
    <WebView
      style={styles.container}
      ref={viewRef}
      onLoad={onLoad}
      onMessage={handleMessage}
      // onMessage={({ nativeEvent: { message } }) => (
      //   setMessage(String(message)), console.log(message, typeof message)
      // )}
      source={LEAFLET_HTML_SOURCE}
    />
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
});

export default LeafletView;
