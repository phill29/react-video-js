/*eslint-disable no-unused-vars*/
import React, { PropTypes, Component } from 'react';
/*eslint-disable no-unused-vars*/
import vjs from 'video.js';
import classnames from 'classnames';

import addEvent from './utils/add-event-listener';
import removeEvent from './utils/remove-event-listener';

import ZvUiBigPlayButton from './components/zvuiBigPlayButton';

const BASE_CLASS = 'zvui-product-video';
const VJS_BASE_CLASS= 'video-js';
const VJS_DEFAULT_SKIN_CLASS = 'vjs-default-skin';
const VJS_CENTER_PLAY_CLASS = 'vjs-big-play-centered';

const VJS_FRAMEWORK_DEFAULT = {
    width: 480,
    height: 693,
    preload: 'auto',
    autoplay: false,
    controls: true,
    muted: true,
    controlBar: {
        playToggle: false,
        fullscreenToggle: false,
        currentTimeDisplay: false,
        timeDivider: false,
        durationDisplay: false,
        remainingTimeDisplay: false,
        progressControl: {
            seekBar: {
                seekHandle: false,
            },
        },
        volumeMenuButton: false,
        playbackRateMenuButton: false,
        audioTrackButton: false,
        captionsButton: false,
        chaptersButton: false,
        descriptionsButton: false,
        subtitlesButton: false,
    }
};

const NOOP = () => {};


class ProductVideo extends Component {
    state = {};

    static defaultProps = {
        uid: '',
        source: '',
        poster: '',
        skin: 'default',
        bigPlayButton: true,
        customSkinClass: '',
        loop: false,
        options: VJS_FRAMEWORK_DEFAULT,
        onReady: NOOP,
        resize: false,
        dispose: false,
        events: {},
    };

    componentWillMount = () => {
        this.setState({
            uid: this.getRandomID(),
        });
    };

    componentDidMount = () => {
        this.setUpPlayer();
    };

    componentWillReceiveProps = (nextProps) => {
        const {
            source: oldSource = '',
        } = this.props;

        const {
            source: newSource = '',
        } = nextProps;

        if ((newSource !== oldSource) && (oldSource !== '')) {
            this._updatePlayerSrc(newSource);
        }
    };

    shouldComponentUpdate = () => {

    };

    componentWillUnMount = () => {

    };

    _buildPlayerOptions = () => {
        const {
            options,
            resize,
            height,
            width,
        } = this.props;

        const {
            width: defaultWidth,
            height: defaultHeight,
        } = VJS_FRAMEWORK_DEFAULT;

        return Object.assign({}, VJS_FRAMEWORK_DEFAULT, options, {
            height: resize ? 'auto' : (height || defaultHeight),
            width: resize ? 'auto' : (width || defaultWidth),
        });
    };

    _updatePlayerSrc = (source) => {
        const {
            _player,
        } = this;

        _player.src(source);
    };

    _playerReady = () => {
        const {
            onEnded,
            onPlay,
            onPause,
            loop,
        } = this.props;

        this._player.on('play', () => {
            this._elToggle('bigPlayButton', false);

            this._elToggle('posterImage', false);

            this._elToggle('_zvuiButton', true);

            if (onPlay && typeof onPlay === 'function') {
                onPlay.call(this, this._player);
            }
        });

        this._player.on('pause', () => {
            this._elToggle('bigPlayButton', true);
            this._elToggle('_zvuiButton', false);

            if (onPause && typeof onPause === 'function') {
                onPause.call(this, this._player);
            }
        });

        this._player.on('ended', () => {
            this._elToggle('bigPlayButton', true);

            this._elToggle('posterImage', true);

            if (!loop && onEnded && typeof onEnded === 'function') {
                onEnded.call(this, this._player);
            }
        });
    };

    _elToggle = (obj, flag) => {
        const {
            [obj]: {
                el_: targetEl = null,
            } = {},
        } = this._player;

        const {
            [obj]: {
                el_: targetParentEl = null
            } = {}
        } = this;

        if (targetEl) {
            targetEl.style.display = (flag ? 'block' : 'none');
        }

        if (targetParentEl) {
            targetParentEl.style.display = (flag ? 'block' : 'none');
        }
    };

    insertComponents = () => {
        const player = this.getProductPlayer();

        this._zvuiButton = new ZvUiBigPlayButton(this._player);
        this._player.addChild(this._zvuiButton);
    };

    setUpPlayer = () => {
        const {
            source,
            onEnded,
            onPlay,
            onPause,
            loop,
        } = this.props;

        const options = this._buildPlayerOptions();

        this._player = vjs(this.refs[BASE_CLASS], options);

        this.insertComponents();

        this._player.ready(this._playerReady);

        setTimeout(() => {
            this._updatePlayerSrc(source);
        }, 50);
    };

    unloadPlayer = () => {
        this._player.dispose();
    };

    getProductPlayer = () => {
        return this._player;
    };

    getRandomID = () => Math.floor((Math.random() * 16749) + 1);

    render = () => {
        const {
            children,
            skin,
            customSkinClass,
            bigPlayButton,
            poster,
        } = this.props;

        const {
            uid,
        } = this.state;

        return (
            <video
                ref={BASE_CLASS}
                id={`${BASE_CLASS}-${uid}`}
                className={classnames(BASE_CLASS, VJS_BASE_CLASS, {
                    [VJS_DEFAULT_SKIN_CLASS]: (skin === 'default'),
                    [customSkinClass]: (skin !== 'default'),
                    [VJS_CENTER_PLAY_CLASS]: bigPlayButton,
                })}
                poster={poster || null}
                >
                {children}
            </video>
        );
    };
}

ProductVideo.propTypes = {
    source: PropTypes.string,
    poster: PropTypes.string,
    children: PropTypes.element,
    skin: PropTypes.string,
    bigPlayButton: PropTypes.bool,
    customSkinClass: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    loop: PropTypes.bool,
    onReady: PropTypes.func,
    resize: PropTypes.bool,
    eventListeners: PropTypes.object,
    options: PropTypes.object,
    onEnded: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
};

export default ProductVideo;
