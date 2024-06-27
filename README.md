# react-native-leaflet

A LeafletView component using WebView and Leaflet map for React Native applications

Notes: This project is replacement for https://github.com/reggie3/react-native-webview-leaflet, which no longer maintain by author and work only with expo.

[![npm](https://img.shields.io/npm/v/react-native-leaflet-view.svg)](https://www.npmjs.com/package/react-native-leaflet-view)
[![npm](https://img.shields.io/npm/dm/react-native-leaflet-view.svg)](https://www.npmjs.com/package/react-native-leaflet-view)
[![npm](https://img.shields.io/npm/dt/react-native-leaflet-view.svg)](https://www.npmjs.com/package/react-native-leaflet-view)

<img src="images/android.png" height="600">       <img src="images/ios.png" height="600">

## Installation

Install using pnpm the newer version of a combination of best qualities of npm and yarn like this:

```sh
pnpm install --save react-native-leaflet-view
```

or

```sh
pnpm add react-native-leaflet-view
```

## Usage

```js
import { LatLng, LeafletView } from 'react-native-leaflet-view';

<LeafletView
    // The rest of your props, see the list below
/>

```

## Props

| property            | required | type                            | purpose                                                                                                                                                                                                         |
| ------------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| loadingIndicator    | optional | React.ReactElement              | custom component displayed while the map is loading                                                                                                                                                             |
| onError             | optional | function                        | Will receive an error event                                                                                                                                                                                     |
| onLoadEnd           | optional | function                        | Called when map stops loading                                                                                                                                                                                   |
| onLoadStart         | optional | function                        | Called when the map starts to load                                                                                                                                                                              |
| onMessageReceived   | required | function                        | This function receives messages in the form of a WebviewLeafletMessage object from the map                                                                                                                      |
| mapLayers           | optional | MapLayer array                  | An array of map layers                                                                                                                                                                                          |
| mapMarkers          | optional | MapMarker array                 | An array of map markers                                                                                                                                                                                         |
| mapShapes           | optional | MapShape[]                      | An array of map shapes                                                                                                                                                                                          |
| mapCenterPosition   | optional | {lat: [Lat], lng: [Lng]} object | The center position of the map. This coordinate will not be accurate if the map has been moved manually. However, calling the map's setMapCenterPosition function will cause the map to revert to this location |
| ownPositionMarker   | optional | Marker                          | A special marker that has an ID of OWN_POSTION_MARKER_ID                                                                                                                                                        |  |
| zoom                | optional | number                          | Desired zoom value of the map                                                                                                                                                                                   |
| doDebug             | optional | boolean                         | A flag for debug message logging                                                                                                                                                                               |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

# Steps as Publishing Repo as Pacakage
1. Make sure you're logged in to your npm account with `npm login` and then link the npm package to your github account

    npm link

2. Create or confirm you have an account through NPM. 
3. Make sure you have an organization available through npm. You'll be publishing this package with this organization as the main scoped registry.
3. Re-check all the links in the package.json are accurate. Especially visit each URL listed in the package.json that they go to the correct location.
4. Update the package.json with the publish configuration details. You can purchase paid accounts, but for now we're using the free account to publish unlimited packages.

        ...
        "publishConfig": {
            "access": "public",
            "@geoinformatica_consulting:registry": "https://registry.npmjs.org/"
        },
        ...

5. Confirm you're still logged into the correct npm account with `npm whoami`. If all is well, then execute the publish

        npm publish