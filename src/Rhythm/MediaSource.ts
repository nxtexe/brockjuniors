import {isMobile} from '../common/utils';

export interface ICallbacks {
    error?: Function;
    change?: Function;
    play?: Function;
    pause?: Function;
}

enum Eevents {
    error,
    change,
    play,
    pause,
    ended
}
export type events = keyof typeof Eevents;


interface EventListener {
    event : events;
    callback : (this: AudioBufferSourceNode, ev: Event) => any;
    async : boolean;
}
export class MediaSource {
    private audio_context : AudioContext;
    private _source_node : MediaElementAudioSourceNode | null = null;
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
    }

    get source_node() : MediaElementAudioSourceNode {
        this._source_node = this.audio_context.createMediaElementSource(this._audio);
        return this._source_node;
    }

    addEventListener(event : events, callback : (this: AudioBufferSourceNode, ev: Event) => any, async? : boolean) {
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
        /**
         * Code responsible for audio context source creation. This is necessary for playing audio in the background
         * on mobile but currently has an issue with cross origin content. Getting music from another origin
         * is posing a problem with the web audio API where the audio outputs zeros (silence).
         * 
         * Possible solutions?
            1̶.̶ M̶a̶n̶u̶a̶l̶l̶y̶ s̶t̶r̶e̶a̶m̶ c̶o̶n̶t̶e̶n̶t̶ t̶o̶ t̶h̶e̶ w̶e̶b̶ a̶u̶d̶i̶o̶ a̶p̶i̶ u̶s̶i̶n̶g̶ r̶e̶a̶d̶a̶b̶l̶e̶ s̶t̶r̶e̶a̶m̶s̶
            2. Just supply url wrapped using allorigins.win instead of raw url
         */

        
        this.event_listeners.forEach((listener) => {
            this._audio.addEventListener(listener.event, listener.callback, listener.async);
        });

    }

    set source(_source : MediaElementAudioSourceNode) {
        this._source_node = _source;
        this._gain_node = this.audio_context.createGain();
        this._source_node.connect(this._gain_node).connect(this.audio_context.destination);
    }

    public play() : boolean {
        if (!this._playing && this._audio) {
            // this.audio = this._audio;

            if (this.audio_context.state === "suspended") {
                this.audio_context.resume();//NOTE: This is important to comply with chrome autoplay policy. Call after user gesture
            }
            
            this._playing = true;

            this._audio.play()
            .catch((e) => {
                console.log(e)
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
        this._audio.currentTime = _current_time;
        
    }

    get playing() : boolean {
        return this._playing;
    }

    get volume() : number {
        if (this._gain_node) return this._gain_node.gain.value;
        
        return 0;

    }

    set volume(_volume : number) {
        if (this._gain_node) this._gain_node.gain.value = _volume;
    }

    get callbacks() : ICallbacks {
        return this._callbacks;
    }

    get duration() : number {
        return this._audio.duration;
    }

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
        }
    }
}