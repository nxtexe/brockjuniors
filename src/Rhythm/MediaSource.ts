import {isMobile} from '../common/utils';

export interface ICallbacks {
    error?: Function;
    change?: Function;
    play?: Function;
    pause?: Function;
    buffering?: Function;
    bufferend?: Function;
    timeupdate?: Function;
}

enum Eevents {
    error,
    change,
    play,
    pause,
    ended,
    buffering,
    bufferend,
    timeupdate
}
export type events = keyof typeof Eevents;


interface EventListener {
    event : keyof HTMLMediaElementEventMap;
    callback : (this: AudioBufferSourceNode, ev: Event) => any;
    async : boolean;
}
export class MediaSource {
    private audio_context : AudioContext;
    private _source_node : MediaElementAudioSourceNode | null = null;
    private _connected: boolean = false;
    private _gain_node : GainNode | null = null;
    private _audio : HTMLAudioElement = new Audio();
    private event_listeners : EventListener[] = [];
    private _playing : boolean = false;
    private _callbacks : ICallbacks = {};
    private _volume : number = 1;
    constructor(audio_context : AudioContext) {
        this.audio_context = audio_context;
        if (isMobile()) {
            window.addEventListener('blur', () => {
                if (this._playing) {
                    this.pause();
                    this.play();
                }
            }, true);
        }
    }

    public _MediaSource() {
        this._callbacks = {};
        this._playing = false;
        this.pause();
        if (this._gain_node) {
            this._source_node?.disconnect(this._gain_node);
            try {
                this._source_node?.disconnect(this.audio_context.destination);

            } catch (e) {
                
            }
            this._connected = false;
        }
    }

    get source_node() : MediaElementAudioSourceNode {
        this._source_node = this.audio_context.createMediaElementSource(this._audio);
        return this._source_node;
    }

    addEventListener(event : keyof HTMLMediaElementEventMap, callback : (this: AudioBufferSourceNode, ev: Event) => any, async? : boolean) {
        this.event_listeners.push({
            event: event,
            callback: callback,
            async: async ? true : false
        });

        this._audio.addEventListener(event, callback, async);
    }

    get audio() : HTMLAudioElement {
        return this._audio;
    }

    get playback_rate() : number {
        return this._audio.playbackRate;
    }

    set audio(_audio : HTMLAudioElement) {
        if (this._playing) {
            this.pause();
            this._playing = false;
        }

        this._audio = _audio;
        this.volume = this._volume;

        this._audio.addEventListener('waiting', (e) => {
            if (this._callbacks.buffering) this._callbacks.buffering(e);
        }, true);
        this._audio.addEventListener('loadeddata', (e) => {
            if (this._callbacks.bufferend) this._callbacks.bufferend(e);
        }, true);

        this._audio.addEventListener('timeupdate', (e) => {
            if (this._callbacks.timeupdate) this._callbacks.timeupdate(e);
        }, true);
        /**
         * Code responsible for audio context source creation. This is necessary for playing audio in the background
         * on mobile but currently has an issue with cross origin content. Getting music from another origin
         * is posing a problem with the web audio API where the audio outputs zeros (silence).
         * 
         * Possible solutions?
            1̶.̶ M̶a̶n̶u̶a̶l̶l̶y̶ s̶t̶r̶e̶a̶m̶ c̶o̶n̶t̶e̶n̶t̶ t̶o̶ t̶h̶e̶ w̶e̶b̶ a̶u̶d̶i̶o̶ a̶p̶i̶ u̶s̶i̶n̶g̶ r̶e̶a̶d̶a̶b̶l̶e̶ s̶t̶r̶e̶a̶m̶s̶
            2̶.̶ J̶u̶s̶t̶ s̶u̶p̶p̶l̶y̶ u̶r̶l̶ w̶r̶a̶p̶p̶e̶d̶ u̶s̶i̶n̶g̶ a̶l̶l̶o̶r̶i̶g̶i̶n̶s̶.̶w̶i̶n̶ i̶n̶s̶t̶e̶a̶d̶ o̶f̶ r̶a̶w̶ u̶r̶l̶
            3. Just supply url hosted at cdn.brockjuniors.com/audio
         */

        
        this.event_listeners.forEach((listener) => {
            this._audio.addEventListener(listener.event, listener.callback, listener.async);
        });

    }

    set source(_source : MediaElementAudioSourceNode) {
        if (this._connected && this._gain_node) {
            this._source_node?.disconnect(this._gain_node);

            try {
                this._source_node?.disconnect(this.audio_context.destination);
            } catch (e) {

            }
            this._connected = false;
        }
        this._source_node = _source;
        this._gain_node = this.audio_context.createGain();

        const bass_filter = this.audio_context.createBiquadFilter();
        bass_filter.type = "lowshelf";
        bass_filter.frequency.value = 10;
        bass_filter.gain.value = 10;

        const treble_filter = this.audio_context.createBiquadFilter();
        treble_filter.type = "highshelf";
        treble_filter.frequency.value = 20;
        treble_filter.gain.value = 20;
        this._source_node
        .connect(this._gain_node)
        .connect(this.audio_context.destination);
        this._connected = true;
        // .connect(bass_filter)
        // .connect(treble_filter)
    }

    public play() : boolean {
        if (!this._playing && this._audio) {
            // this.audio = this._audio;

            if (this.audio_context.state === "suspended") {
                //NOTE: This is important to comply with chrome autoplay policy. Call after user gesture
                this.audio_context.resume();
            }
            
            this._playing = true;

            this._audio.play()
            .catch((e) => {
                if (this._callbacks.error) this._callbacks.error(e);
            });

            

            return true;
        }

        return false;
    }

    public pause() {
        if (this._playing) {
            this._audio.pause();
            this._playing = false;
        }
    }

    get current_time() : number {
        return this._audio.currentTime;
    }

    set current_time(_current_time : number) {
        // if (!this._audio.paused) {
        //     this._audio.oncanplay = () => {
        //         this._audio.play();
        //         this._audio.oncanplay = null;
        //     }
        // }
        if (_current_time !== this.current_time) {
            if (_current_time < this._audio.duration) {
                this._audio.currentTime = _current_time;
            } else {
                this._audio.currentTime = this._audio.duration;
            }
        }
    }

    get playing() : boolean {
        return this._playing;
    }

    get volume() : number {
        // if (this._gain_node) return this._gain_node.gain.value;
        
        return this._audio.volume;

    }

    set volume(_volume : number) {
        // this._volume = _volume;
        // this._audio.volume = _volume;
        if (this._gain_node) this._gain_node.gain.value = _volume;
    }

    get callbacks() : ICallbacks {
        return this._callbacks;
    }

    get duration() : number {
        return this._audio.duration;
    }

    /**
     * call before adding songs
     */
    public on(event : events, callback : Function) : void {
        switch(event) {
            case "change":
                this._callbacks.change = callback;
                break;

            case "error":
                this._callbacks.error = callback;
                break;
            
            case "play":
                this._callbacks.play = callback;
                break;
                
            case "pause":
                this._callbacks.pause = callback;
                break;
            
            case "timeupdate":
                this._callbacks.timeupdate = callback;
                break;
            
            case "buffering":
                this._callbacks.buffering = callback;
                break;
            
            case "bufferend":
                this._callbacks.bufferend = callback;
                break;
        }
    }
}