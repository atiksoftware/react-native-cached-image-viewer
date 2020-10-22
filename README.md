# react-native-cached-image-viewer
[![GitHub](https://img.shields.io/badge/Author-atiksoftware-blue)]()
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fatiksoftware%2Freact-native-cached-image-viewer)]()
[![GitHub stars](https://img.shields.io/github/stars/atiksoftware/react-native-cached-image-viewer?color=brightgreen)]()
[![GitHub contributors](https://img.shields.io/github/contributors/atiksoftware/react-native-cached-image-viewer?color=brightgreen)]()
[![GitHub issues](https://img.shields.io/github/issues/atiksoftware/react-native-cached-image-viewer?color=blue)]()

React native Cached Image Viewer component for react-native  

#### `I last used it on React Native v0.63.3`  
  
`This project is not my owned project. `  
I modified [`tuananhluong`](https://github.com/tuananhluong/react-native-cached-images)'s project. As i readed his page , he forked and modified  
[`kfiroo`](https://github.com/kfiroo/react-native-cached-image)'s project.  
ALSO. I copied the following texts from [`kfiroo/react-native-cached-image`](https://github.com/kfiroo/react-native-cached-image) and made some changes

`THANKS FOR ` [`kfiroo`](https://github.com/kfiroo) `AND`  [`tuananhluong`](https://github.com/tuananhluong)

## WHY I MODIFIED
! `react-native-fetch-blob` is deprecated. I used [`rn-fetch-blob`](https://github.com/joltup/rn-fetch-blob) instead.  
! [`@react-native-community/netinfo`](https://github.com/react-native-netinfo/react-native-netinfo) is changed some things.  
! `componentWillReceiveProps` is deprecated. I changed to `componentDidUpdate`  
! `string ref`'s are deprecated. I changed to `createRef()`




This package is greatly inspired by [@jayesbe](https://github.com/jayesbe)'s amazing [react-native-cacheable-image](https://github.com/jayesbe/react-native-cacheable-image) but adds some functionality that we were missing when trying to handle caching images in our react-native app.

## Installation

    npm install react-native-cached-image-viewer --save
    - or -
    yarn add react-native-cached-image-viewer



We use [`rn-fetch-blob`](https://github.com/joltup/rn-fetch-blob#user-content-installation) to handle file system access in this package and it requires an extra step during the installation.  

_You should only have to do this once._

    react-native link rn-fetch-blob

Or, if you want to add Android permissions to AndroidManifest.xml automatically, use this one:

    RNFB_ANDROID_PERMISSIONS=true react-native link rn-fetch-blob

**Grant Permission to External storage for Android 5.0 or lower**

The mechanism for granting Android permissions has slightly different since Android 6.0 released, please refer to [Official Document](https://developer.android.com/training/permissions/requesting.html).

If you're going to access external storage (say, SD card storage) for `Android 5.0` (or lower) devices, you might have to add the following line to `AndroidManifest.xml`.

```diff
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rnfetchblobtest"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
+   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
+   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
+   <uses-permission android:name="android.permission.DOWNLOAD_WITHOUT_NOTIFICATION" />
    ...

```

Also, if you're going to use `Android Download Manager` you have to add this to `AndroidManifest.xml`

```diff
    <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
+           <action android:name="android.intent.action.DOWNLOAD_COMPLETE"/>
    </intent-filter>
```

If you are going to use the `wifiOnly` flag, you need to add this to `AndroidManifest.xml`

```diff
+   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    ...

```

**Grant Access Permission for Android 6.0**

Beginning in Android 6.0 (API level 23), users grant permissions to apps while the app is running, not when they install the app. So adding permissions in `AndroidManifest.xml` won't work for Android 6.0+ devices. To grant permissions in runtime, you might use [PermissionAndroid API](https://facebook.github.io/react-native/docs/permissionsandroid.html).

## Usage

TODO - add usage example

```jsx
import React, { Component } from 'react'
import { ActivityIndicator } from 'react-native'
import {
    CachedImage,
    ImageCacheProvider
} from 'react-native-cached-image-viewer';

const images = [
    'https://example.com/images/1.jpg',
    'https://example.com/images/2.jpg',
    'https://example.com/images/3.jpg',
    // ...
];

export default class Example extends Component {
    render() {
        return (
            <ImageCacheProvider
                urlsToPreload={images}
                onPreloadComplete={() => console.log('hey there')}>

                <CachedImage source={{uri: images[0]}}/>

                <CachedImage source={{uri: images[1]}}/>

				<CachedImage source={{uri: images[2]}}/>

                <CachedImage 
                    style={{
                        width : 40,
                        height : 40,
                    }} 
                    source={{uri: 'https://randomuser.me/api/portraits/women/60.jpg'}}
                    loadingIndicator={ActivityIndicator}
				/>

            </ImageCacheProvider>
        );
    }
}
```

`Sorry if there is something unrelated to the text below. It may be saying something irrelevant or invalid because I copied this text and haven't checked it all`

## API

This package exposes 3 modules:
```jsx
const {
    CachedImage,            // react-native component that is a drop-in replacement for your react-native `Image` components
    ImageCacheProvider,     // a top level component that provides accsess to the underlying `ImageCacheManager` and preloads images
    ImageCacheManager,      // the logic behind cache machanism - ttl, fs, url resolving etc. 
} = require('react-native-cached-image-viewer');
```

### ImageCacheManager
This is where all the cache magic takes place.
The API usually takes a *URL* and a set of [`ImageCacheManagerOptions`](#imagecachemanageroptions).

#### `ImageCacheManager.downloadAndCacheUrl(url: String, options: ImageCacheManagerOptions): Promise<String>`
Check the cache for the the URL (after removing fixing the query string according to `ImageCacheManagerOptions.useQueryParamsInCacheKey`).
If the URL exists in cache and is not expired, resolve with the local cached file path.
Otherwise, download the file to the cache folder, add it to the cache and then return the cached file path.

#### `ImageCacheManager.seedAndCacheUrl(url: String, seedPath: String, options: ImageCacheManagerOptions): Promise<String>`
Check the cache for the the URL (after removing fixing the query string according to `ImageCacheManagerOptions.useQueryParamsInCacheKey`).
If the URL exists in cache and is not expired, resolve with the local cached file path.
Otherwise, copy the seed file into the cache folder, add it to the cache and then return the cached file path.

#### `ImageCacheManager.deleteUrl(url: String, options: ImageCacheManagerOptions): Promise`
Removes the cache entry for the URL and the local file corresponding to it, if it exists.

#### `ImageCacheManager.clearCache(options: ImageCacheManagerOptions): Promise`
Clear the URL cache and remove files in the cache folder (as stated in the `ImageCacheManagerOptions.cacheLocation`)

#### `ImageCacheManager.getCacheInfo(options: ImageCacheManagerOptions): Promise.<{file: Array, size: Number}>`
Returns info about the cache, list of files and the total size of the cache.


### CachedImage
`CachedImage` is a drop in replacement for the `Image` component that will attempt to cache remote URLs for better performance.  
It's main use is to hide the cache layer from the user and provide a simple way to cache images.  
`CachedImage` uses an instance of `ImageCacheManager` to interact with the cache, if there is an instance provided by `ImageCacheProvider` via the context it will be used, otherwise a new instance will be created with the options from the component's props. 

```jsx
<CachedImage
    source={{
        uri: 'https://example.com/path/to/your/image.jpg'
    }}
    style={styles.image}
/>
```

##### Props
* `renderImage` - a function that returns a component, used to override the underlying `Image` component.
* `activityIndicatorProps` - props for the `ActivityIndicator` that is shown while the image is downloaded.
* `defaultSource` - prop to display a background image while the source image is downloaded. This will work even in android, but will not display background image if there you set borderRadius on this component style prop
* `loadingIndicator` - _component_ prop to set custom `ActivityIndicator`.
* `fallbackSource` - prop to set placeholder image. when `source.uri` is null or cached failed, the `fallbackSource` will be display.
* any of the `ImageCacheManagerOptionsPropTypes` props - customize the `ImageCacheManager` for this specific `CachedImage` instance.

### ImageCacheProvider
This is a top-level component with 2 major functions:
1. Provide the customized `ImageCacheManager` to nested `CachedImage`.
2. Preload a set of URLs.

##### Props
* `urlsToPreload` - an array of URLs to preload when the component mounts. default []
* `numberOfConcurrentPreloads` - control the number of concurrent downloads, usually used when the `urlsToPreload` array is very big. default `urlsToPreload.length`
* `onPreloadComplete` - callback for when the preload is complete and all images are cached.

### ImageCacheManagerOptions
A set of options that are provided to the `ImageCacheManager` and provide ways to customize it to your needs.

```jsx
type ImageCacheManagerOptions = {
    headers: PropTypes.object,                      // an object to be used as the headers when sending the request for the url. default {}
    
    ttl: PropTypes.number,                          // the number of seconds each url will stay in the cache. default 2 weeks
    
    useQueryParamsInCacheKey: PropTypes.oneOfType([ // when handling a URL with query params, this indicates how it should be treated:
        PropTypes.bool,                             // if a bool value is given the whole query string will be used / ignored
        PropTypes.arrayOf(PropTypes.string)         // if an array of strings is given, only these keys will be taken from the query string.
    ]),                                             // default false
    
    cacheLocation: PropTypes.string,                // the path to the root of the cache folder. default the device cache dir 
    
    allowSelfSignedSSL: PropTypes.bool,             // true to allow self signed SSL URLs to be downloaded. default false
};

```


## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.
