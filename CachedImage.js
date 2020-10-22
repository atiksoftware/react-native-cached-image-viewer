"use strict";

const _ = require("lodash");

import React,{Component} from 'react'
 
import PropTypes from 'prop-types'; // ES6
 
import ImageCacheManagerOptionsPropTypes from './ImageCacheManagerOptionsPropTypes'
 
import ImageCacheManager from './ImageCacheManager'

import { View, ImageBackground, ActivityIndicator, Platform, StyleSheet } from 'react-native' 

const flattenStyle = StyleSheet.flatten;

// const NetInfo = require("@react-native-community/netinfo");
import NetInfo from "@react-native-community/netinfo";

const styles = StyleSheet.create({
    image: {
        backgroundColor: "transparent"
    },
    loader: {
        backgroundColor: "transparent"
    },
    loaderPlaceholder: {
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center"
    }
});

function getImageProps(props) {
    return _.omit(props, [
        "source",
        "defaultSource",
        "fallbackSource",
        "LoadingIndicator",
        "activityIndicatorProps",
        "style",
        "useQueryParamsInCacheKey",
        "renderImage",
        "resolveHeaders"
    ]);
}
 
class CachedImage extends Component {
    static propTypes = {
        renderImage: PropTypes.func.isRequired,
        activityIndicatorProps: PropTypes.object.isRequired,

        // ImageCacheManager options
        ...ImageCacheManagerOptionsPropTypes
    };

    static defaultProps = {
        renderImage: props => (<ImageBackground imageStyle={props.style} ref={this.cachedImageRef} {...props}/>),
        activityIndicatorProps: {}
    };

    static contextTypes = {
        getImageCacheManager: PropTypes.func
    };

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            isCacheable: true,
            cachedImagePath: null,
            networkAvailable: true
        };

        this.getImageCacheManagerOptions = this
            .getImageCacheManagerOptions
            .bind(this);
        this.getImageCacheManager = this
            .getImageCacheManager
            .bind(this);
        this.safeSetState = this
            .safeSetState
            .bind(this);
        this.handleConnectivityChange = this
            .handleConnectivityChange
            .bind(this);
        this.processSource = this
            .processSource
            .bind(this);
        this.renderLoader = this
            .renderLoader
			.bind(this);
			
		this.cachedImageRef = React.createRef();
	}
	
	NetInfoUnsubscribe = null;

    componentDidMount() {
		this._isMounted = true; 
		
		this.NetInfoUnsubscribe = NetInfo.addEventListener(this.handleConnectivityChange); 
		NetInfo.fetch().then(state => {
			this.safeSetState({networkAvailable: state.isConnected});
		});

        this.processSource(this.props.source);
    }

    componentWillUnmount() {
		this._isMounted = false;
		if(this.NetInfoUnsubscribe){
			this.NetInfoUnsubscribe();
		}
    }

    componentDidUpdate(nextProps) { 
        if (!_.isEqual(this.props.source, nextProps.source)) {
            this.processSource(nextProps.source);
        }
    }

    setNativeProps(nativeProps) {
        try {
            this.cachedImageRef.current.setNativeProps(nativeProps);
        } catch (e) {
            console.error(e);
        }
    }

    getImageCacheManagerOptions() {
        return _.pick(this.props, _.keys(ImageCacheManagerOptionsPropTypes));
    }

    getImageCacheManager() {
        // try to get ImageCacheManager from context
        if (this.context && this.context.getImageCacheManager) {
            return this
                .context
                .getImageCacheManager();
        }
        // create a new one if context is not available
        const options = this.getImageCacheManagerOptions();
        return ImageCacheManager(options);
    }

    safeSetState(newState) {
        if (!this._isMounted) {
            return;
        }
        return this.setState(newState);
    }

    handleConnectivityChange(isConnected) {
        this.safeSetState({networkAvailable: isConnected});
    }

    processSource(source) {
        const url = _.get(source, ["uri"], null);
        const options = this.getImageCacheManagerOptions();
        const imageCacheManager = this.getImageCacheManager();

        imageCacheManager
            .downloadAndCacheUrl(url, options)
            .then(cachedImagePath => {
                this.safeSetState({cachedImagePath});
            })
            .catch(err => {
                // console.warn(err);
                this.safeSetState({cachedImagePath: null, isCacheable: false});
            });
    }

    render() {
        if (this.state.isCacheable && !this.state.cachedImagePath) {
            return this.renderLoader();
        }
        const props = getImageProps(this.props);
        const style = this.props.style || styles.image;
        const source = this.state.isCacheable && this.state.cachedImagePath
            ? {
                uri: "file://" + this.state.cachedImagePath
            }
            : this.props.source;
        if (this.props.fallbackSource && !this.state.cachedImagePath) {
            return this
                .props
                .renderImage({
                    ...props,
                    key: `${props.key || source.uri}error`,
                    style,
                    source: this.props.fallbackSource
                });
        }
        return this
            .props
            .renderImage({
                ...props,
                key: props.key || source.uri,
                style,
                source
            });
    }

    renderLoader() {
        const imageProps = getImageProps(this.props);
        const imageStyle = [this.props.style, styles.loaderPlaceholder];

        const activityIndicatorProps = _.omit(this.props.activityIndicatorProps, ["style"]);
        const activityIndicatorStyle = this.props.activityIndicatorProps.style || styles.loader;

        const LoadingIndicator = this.props.loadingIndicator;

        const source = this.props.defaultSource;

        // if the imageStyle has borderRadius it will break the loading image view on
        // android so we only show the ActivityIndicator
        if (!source || (Platform.OS === "android" && flattenStyle(imageStyle).borderRadius)) {
            if (LoadingIndicator) {
                return (
                    <View style={[imageStyle, activityIndicatorStyle]}>
                        <LoadingIndicator {...activityIndicatorProps}/>
                    </View>
                );
            }
            return (<ActivityIndicator
                {...activityIndicatorProps}
                style={[imageStyle, activityIndicatorStyle]}/>);
        }
        // otherwise render an image with the defaultSource with the ActivityIndicator
        // on top of it
        return this
            .props
            .renderImage({
                ...imageProps,
                style: imageStyle,
                key: source.uri,
                source,
                children: LoadingIndicator
                    ? (
                        <View style={[imageStyle, activityIndicatorStyle]}>
                            <LoadingIndicator {...activityIndicatorProps}/>
                        </View>
                    )
                    : (<ActivityIndicator {...activityIndicatorProps} style={activityIndicatorStyle}/>)
            });
    }
}

module.exports = CachedImage;
