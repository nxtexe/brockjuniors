import { MediaQueue } from "./MediaQueue";
import {MediaSource, events} from './MediaSource';
import axios, {AxiosResponse} from 'axios';

interface SearchResult {
    audio: string;
    _id: string;
    name: string;
    artiste: string;
    duration: number;
    lyrics: string;
    cover_art: {
        width: number;
        height: number;
        url: string;
    }
}
interface Lyrics {
    [key:number]: string
}
export interface MediaItem {
    url : string;
    name : string;
    artiste: string;
    lyrics: Lyrics;
    cover_art : {
        width: number,
        height: number,
        url: string
    };
    duration : number;
    audio : HTMLAudioElement;
    source : MediaElementAudioSourceNode;
    _id : string;
    liked : boolean;
}

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
export class MediaPlayer {
    private media_queue : MediaQueue = new MediaQueue();
    private audio_context : AudioContext = new AudioContext({
        latencyHint: 'playback',
        sampleRate: 44100
    });
    private _queue_index : number = 0;
    private _playing : boolean = false;
    private _can_play : boolean = false;
    private media_source : MediaSource = new MediaSource(this.audio_context);
    private _repeat : number = 1;
    private played_once : boolean = false;
    constructor() {
        this.media_source.addEventListener('ended',  this._handle_track_end.bind(this), true);
        this.media_source.addEventListener('error', (e) => {
            if (this.media_source.callbacks.error) this.media_source.callbacks.error(e);
        }, true);

        const actionHandlers = [
            ['play',          this.play.bind(this)],
            ['pause',         this.pause.bind(this)],
            ['previoustrack', this.previous.bind(this)],
            ['nexttrack',     this.next.bind(this)],
            ['stop',          this._MediaPlayer.bind(this)],
            ['seekbackward',  (details : any) => {
                const seek_offset : number = details.seekOffset || 5;
                if (this.media_source.current_time > seek_offset) {
                    this.media_source.current_time -= seek_offset;
                } else {
                    this.media_source.current_time = 0;
                }

                this.update_position_state();
            }],
            ['seekforward',   (details : any) => {
                const seek_offset : number = details.seekOffset || 5;
                if (this.media_source.current_time < this.media_source.duration) {
                    this.media_source.current_time += seek_offset;
                } else {
                    this.media_source.current_time = this.media_source.duration;
                }

                this.update_position_state();
            }],
            ['seekto',        (details : any) => {
                if (details.fastSeek && 'fastSeek' in this.media_source.audio) {
                    this.media_source.audio.fastSeek(details.seekTime);
                    return;
                }
                this.media_source.current_time = details.seekTime;

                this.update_position_state();
            }],
        ];
          
        for (const [action, handler] of actionHandlers) {
            try {
                (window.navigator as any).mediaSession.setActionHandler(action, handler);
            } catch (error) {
                console.log(`The media session action "${action}" is not supported yet.`);
            }
        }
    }

    public _MediaPlayer() {
        //destructor

        this.media_source._MediaSource();

        if (this._playing) {
            this.media_source.pause();
            this._playing = false;
            this.audio_context.close();
        }

        this._queue_index = 0;
        this.media_queue.clear();

        //clear action handlers
        const actionHandlers = [
            ['play'],
            ['pause'],
            ['previoustrack'],
            ['nexttrack'],
            ['stop'],
            ['seekbackward'],
            ['seekforward'],
            ['seekto'],
        ];
          
        for (const [action] of actionHandlers) {
            try {
                (window.navigator as any).mediaSession.setActionHandler(action, null);
            } catch (error) {
                console.log(`The media session action "${action}" is not supported yet.`);
            }
        }

        if ('mediaSession' in window.navigator)  (window.navigator as any).mediaSession.setPositionState(null);
    }

    update_position_state() {
        if ('setPositionState' in (window.navigator as any).mediaSession) {
            (window.navigator as any).mediaSession.setPositionState({
                duration: this.media_source.duration,
                playbackRate: this.media_source.playback_rate,
                position: this.media_source.current_time
            })
        }
    }

    private _handle_track_end() {
        this._playing = false;
        if (this.media_queue.length) {
            this.next();
        }
        if (this._repeat === 2) {
            if (!this.played_once) {
                this.loop();
                this._playing = true;
                this.played_once = true;
                return;
            } else {
                this.played_once = false;
            }
        } else if (this._repeat === 4) {
            this.loop();
            this._playing = true;
            return;
        }
    }

    public loop() {
        this.media_source.current_time = 0;
        this.play();
    }

    public next() {
        if (this._queue_index < this.media_queue.length - 1) {
            this.pause();

            if (this._repeat === 2) {
                if (!this.played_once) {
                    this.loop();
                    this._playing = true;
                    this.played_once = true;
                    return;
                } else {
                    this.played_once = false;
                }
            } else if (this._repeat === 4) {
                this.loop();
                this._playing = true;
                return;
            }

            this._queue_index += 1;

            const media_item = this.media_queue.media_item(this._queue_index);
            this.media_source.source = media_item.source;
            this.media_source.audio = media_item.audio;
            this.media_source.current_time = 0;

            if (this.media_source.callbacks.change) this.media_source.callbacks.change(media_item);

            this.play();

            return;
        }

        this.loop();
    }

    public previous() {
        if (this._playing) {
            if (this.media_source.current_time > 2) {
                this.media_source.current_time = 0;
                return;
            }

            this.pause();
        }
        
        if (this._queue_index) {
            this._queue_index -= 1;
            const media_item = this.media_queue.media_item(this._queue_index);
            this.media_source.source = media_item.source;
            this.media_source.audio = media_item.audio;
            this.media_source.current_time = 0;
            
            if (this.media_source.callbacks.change) this.media_source.callbacks.change(media_item); 
            
            this.play();
            this._playing = true;
            return;
        }
        this.loop();
    }

    public dequeue() {
        this.media_queue.dequeue();
    }

    public pop() {
        this.media_queue.pop();
    }

    public play() {
        if (this.media_queue.length && this._queue_index < this.media_queue.length) {
            this.media_source.play();

            if (this.media_source.callbacks.play) this.media_source.callbacks.play();
            this._playing = true;
            

            if ('mediaSession' in window.navigator) (window.navigator as any).mediaSession.playbackState = 'playing';
        }
    }

    public pause() {
        this.media_source.pause();
        
        if (this.media_source.callbacks.pause) this.media_source.callbacks.pause();
        this._playing = false;

        if ('mediaSession' in window.navigator)  (window.navigator as any).mediaSession.playbackState = 'paused';
    }

    public async add_to_queue(_id: string): Promise<boolean>;
    public async add_to_queue(id_list : string[]): Promise<boolean>;
    public async add_to_queue(_id: any, id_list?: any): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                let response: AxiosResponse<SearchResult[]>;
                if (_id.forEach) {
                    response = await axios.post<SearchResult[]>('/songs/data', _id);
                } else {
                    response = await axios.get<SearchResult[]>(`/songs/data/${_id}`);
                }

                
                if (response.status === 200 && response.data) {
                    response.data.forEach(async (result: SearchResult) => {
                        const lyrics = await axios.get<Lyrics>(result.lyrics);
                        const audio = new Audio();
                        audio.crossOrigin = "anonymous";
                        audio.preload = 'metadata';
                        audio.src = result.audio;
                        const media_item: MediaItem = {
                            url: result.audio,
                            name: result.name,
                            artiste: result.artiste,
                            cover_art: {
                                url: result.cover_art.url,
                                width: result.cover_art.width,
                                height: result.cover_art.height
                            },
                            lyrics: lyrics.data || {},
                            duration: result.duration,
                            _id: result._id,
                            liked: false,
                            audio: audio,
                            source: this.audio_context.createMediaElementSource(audio)
                        }

                        this.media_queue.enqueue(media_item);
        
                        if (this.media_queue.length === 1) this._can_play = true;
                                
                                
                        if ((!this.media_queue.length || this._queue_index >= this.media_queue.length - 1 || this.media_queue.length === 2) && !this._playing) {
                            this.media_source.source = this.media_queue.media_item(this._queue_index).source;
                            this.media_source.audio = this.media_queue.media_item(this._queue_index).audio;
                            
                            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.media_item(this._queue_index)); 
                        }
                    });
                    resolve(true);
                }
            } catch(e) {
                reject(e);
                // const error : Error = new Error('Not Found');
                // reject(error);
            }
        });
    }

    public media_item(index: number): MediaItem | undefined {
        return this.media_queue.media_item(index);
    }

    set volume(_volume : number) {
        this.media_source.volume = _volume;
    }

    set current_time(currentTime : number) {
        this.media_source.current_time = currentTime;
    }

    set queue(media_queue : MediaQueue) {
        this.media_queue = media_queue;
    } 

    get now_playing() : MediaItem {
        return this.media_queue.media_item(this._queue_index);
    }
    get queue() : MediaQueue {
        return this.media_queue;
    }

    get current_time() : number {
        return this.media_source.current_time;
    }

    get is_playing() : boolean {
        return this._playing;
    }
    get can_play() : boolean {
        return this._can_play;
    }
    get can_next() : boolean {
        return this._queue_index < this.media_queue.length - 1;
    }
    get can_previous() : boolean {
        return this._queue_index > 0;
    }

    async search(name : string) {
        
    }


    public on(event : events, callback : Function) : void {
        this.media_source.on(event, callback);
    }
    
    public shuffle() {
        this.pause();
        this.media_queue.shuffle();
        const media_item = this.media_queue.media_item(this._queue_index);
        if (this.media_source.callbacks.change) this.media_source.callbacks.change(media_item);
        this.media_source.source = media_item.source;
        this.media_source.audio = media_item.audio;
    }

    public unshuffle() {
        this.pause();
        this.media_queue.unshuffle();
        const media_item = this.media_queue.media_item(this._queue_index);
        if (this.media_source.callbacks.change) this.media_source.callbacks.change(media_item);
        this.media_source.source = media_item.source;
        this.media_source.audio = media_item.audio;
    }

    set repeat(_repeat : number) {
        this._repeat = _repeat;
    }

    public skip_to(item_index: number) {
        this.pause();
        const media_item = this.media_item(item_index);
        if (item_index !== this._queue_index && media_item) {
            this._queue_index = item_index;
            
            if (this.media_source.callbacks.change) this.media_source.callbacks.change(media_item);
            this.media_source.source = media_item.source;
            this.media_source.audio = media_item.audio;
            this.media_source.current_time = 0.0;
        } else {
            this.media_source.current_time = 0.0;
        }
        this.play();
    }
    // public remove_playing() {
    //     this.media_queue.remove(media_item.uuid);
    //     if (this.media_source.callbacks.change) this.media_source.callbacks.change(media_item);
    //     this.media_source.source = media_item.source;
    //     this.media_source.audio = media_item.audio;
    // }
    // public remove(uuid : string) {
    //     this.media_queue.remove(uuid);
    // }

    get queue_index() : number {
        return this._queue_index;
    }

    set queue_index(_queue_index : number) {
        this._queue_index = _queue_index;
    }

    public play_next(_id: string) {
        const index = this.media_queue.find(_id);

        if (index !== undefined) {
            if ((this.queue_index + 1) === this.media_queue.length) {
                this.media_queue.enqueue(index);
            } else {
                this.media_queue.insert(this.queue_index + 1, index);
                console.log(this.media_queue.queue);
            }
        }
    }
}