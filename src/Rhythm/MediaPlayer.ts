import { MediaQueue } from "./MediaQueue";
import moment from 'moment';
import ytsr from 'ytsr';
import ytdl from 'ytdl-core';
import {iOS} from '../common/utils';
import {MediaSource, events} from './MediaSource';
import { v4 as uuid4 } from 'uuid';

export interface SearchResult {
    type: string;
    items?: SearchResult[];
    bestAvatar?: {
        height: number,
        width: number,
        url: string
    };
    avatars?: SearchResult["bestAvatar"][];
    channelID?: string;
    descriptionShort?: string;
    description?: string;
    name?: string;
    url?: string;
    videos: SearchResult[];
    author?: {
        name: string;
        channelID: string;
        url: string;
    };
    bestThumbnail?: SearchResult["bestAvatar"];
    duration?: string;
    id?: string;
    title?: string;
}

export interface MediaItem {
    url : string;
    name : string;
    thumbnail : {
        width: number,
        height: number,
        url: string
    };
    duration : number;
    author: SearchResult["author"];
    audio : HTMLAudioElement;
    source : MediaElementAudioSourceNode;
    uuid : string;
    liked : boolean;
}

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
export class MediaPlayer {
    private media_queue : MediaQueue = new MediaQueue();
    private audio_context : AudioContext = new AudioContext();
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
            if (this._repeat === 1) {
                this.next();
            } else if (this._repeat === 2) {
                if (!this.played_once) {
                    this.media_source.current_time = 0;
                    this.play();
                    this._playing = true;
                    this.played_once = true;
                } else {
                    this.played_once = false;
                    this.next();
                }
            } else if (this._repeat === 4) {
                this.media_source.current_time = 0;
                this.play();
                this._playing = true;
            }
        }
    }

    public next() {
        if (this._queue_index < this.media_queue.length - 1) {
            this._queue_index += 1;
            this.media_source.pause();
            // this.audio_ref.setAttribute('src', this.media_queue.queue[this._queue_index].url);
            this.media_source.source = this.media_queue.queue[this._queue_index].source;
            this.media_source.audio = this.media_queue.queue[this._queue_index].audio;
            this.media_source.current_time = 0;

            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]);

            // this.audio_ref.play();
            this.media_source.play();

            if (this.media_source.callbacks.play) this.media_source.callbacks.play();
            this._playing = true;
        }
    }

    public previous() {
        if (this._playing) {
            if (this.media_source.current_time > 2) {
                this.media_source.current_time = 0;
                return;
            }

            this.media_source.pause();
        }
        
        if (this._queue_index) {
            this._queue_index -= 1;
            this.media_source.source = this.media_queue.queue[this._queue_index].source;
            this.media_source.audio = this.media_queue.queue[this._queue_index].audio;
            this.media_source.current_time = 0;
            
            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]); 
            
            this.media_source.play();
            this._playing = true; 
        }
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

    public async add_to_queue(media_item : MediaItem) {
        const info = await ytdl.getInfo(media_item.url, {
            requestOptions: {
                transform: (parsed : any) => {
                    return {
                        host: 'api.allorigins.win',
                        path: `/raw?url=${parsed.href}`
                    }
                }
            }
        });

        const formats = info.formats.filter((format) => {
            return format.mimeType?.includes('video/mp4;') && format.hasAudio && format.itag === 18;
        });

        return new Promise(async (resolve, reject) => {
            if (formats.length) {                
                const url = formats[0].url;
    
                media_item.url = url;
                
                try {
                    const audio_test : HTMLAudioElement = new Audio();
                    // audio_test.crossOrigin = "anonymous"; //to play audio using audio context
                    audio_test.addEventListener('error', (e) => {
                        if (this.media_source.callbacks.error) this.media_source.callbacks.error(e);
                        reject(e);
                    }, true);

                    
                    const play_callback = async () => {
                        
                        if (!media_item.source && !media_item.audio) {
                            media_item.source = this.audio_context.createMediaElementSource(audio_test);
                        
                            media_item.audio = audio_test;
                            media_item.duration = audio_test.duration;
                            console.log(audio_test.duration)
                            this.media_queue.enqueue(media_item);

                            if (this.media_queue.length === 1) this._can_play = true;
                        }
                        
                        if ((!this.media_queue.length || this._queue_index >= this.media_queue.length - 1 || this.media_queue.length === 2) && !this._playing) {
                            this.media_source.source = this.media_queue.queue[this._queue_index].source;
                            this.media_source.audio = this.media_queue.queue[this._queue_index].audio;
                            
                            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]); 
                        }

                        resolve(undefined);
                    }

                    iOS() ? audio_test.addEventListener('loadedmetadata', play_callback) : audio_test.addEventListener('canplay', play_callback);
                    
                    audio_test.crossOrigin = "anonymous";
                    audio_test.setAttribute('src', `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
                } catch (e) {
                    reject(e);
                }
                
            } else {
                const error : Error = new Error('Not Found');
                reject(error);
            }
        })
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
        return this.media_queue.queue[this._queue_index];
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

    async search(name : string) : Promise<MediaItem[]> {
        const search_results = await (ytsr as any)(name, {
            limit: 15,
            pages: 1,
            requestOptions: {
                transform: (parsed : any) => {
                    //format from:
                    //https://www.youtube.com/results?gl=US&hl=en&search_query=Kendrick%20Lamar
                    //to:
                    //https://www.youtube.com/results?search_query=Kendrick+Lamar

                    const formatted : string = parsed.href.replace(/%20/g, '+').replace(/gl=US&hl=en&/g, '');
                    return {
                        host: 'api.allorigins.win',
                        path: `/raw?url=${formatted}`
                    }
                }
            }
        });


        if (search_results.items.length) {
            return search_results.items.filter((result : SearchResult) => {
                return result.type === 'video';
            }).map((result : SearchResult) => {
                //convert from 00:00 to seconds
                const duration : number = moment(result.duration, 'mm:ss').diff(moment().startOf('day'), 'seconds');

                return {
                    duration: duration - 1,
                    name: result.title,
                    thumbnail: {
                        width: result.bestThumbnail?.width,
                        height: result.bestThumbnail?.height,
                        url: result.bestThumbnail?.url
                    },
                    url: result.url,
                    author: result.author,
                    uuid: uuid4(),
                    liked: false
                };
            });
        } else {
            return [];
        }
    }


    public on(event : events, callback : Function) : void {
        this.media_source.on(event, callback);
    }
    
    public shuffle() {
        this.pause();
        this.media_queue.shuffle();
        if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]);
        this.media_source.source = this.media_queue.queue[this._queue_index].source;
        this.media_source.audio = this.media_queue.queue[this._queue_index].audio;
    }

    public unshuffle() {
        this.pause();
        this.media_queue.unshuffle();
        if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]);
        this.media_source.source = this.media_queue.queue[this._queue_index].source;
        this.media_source.audio = this.media_queue.queue[this._queue_index].audio;
    }

    set repeat(_repeat : number) {
        this._repeat = _repeat;
    }

    public skip_to(uuid : string) {
        this._queue_index = this.media_queue.queue_map[uuid];
        if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]);
        this.media_source.source = this.media_queue.queue[this._queue_index].source;
        this.media_source.audio = this.media_queue.queue[this._queue_index].audio;

        this.play();
    }
    public remove_playing() {
        this.media_queue.remove(this.media_queue.queue[this._queue_index].uuid);
        if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this._queue_index]);
        this.media_source.source = this.media_queue.queue[this._queue_index].source;
        this.media_source.audio = this.media_queue.queue[this._queue_index].audio;
    }
    public remove(uuid : string) {
        this.media_queue.remove(uuid);
    }

    get queue_index() : number {
        return this._queue_index;
    }

    set queue_index(_queue_index : number) {
        this._queue_index = _queue_index;
    }

    public play_next(media_item : MediaItem) {
        const index = this.media_queue.map[media_item.uuid];

        if (index) {
            if ((index + 1) < this.media_queue.length) {
                this.media_queue.swap(media_item.uuid, this.media_queue.queue[this._queue_index + 1].uuid);
            } else {
                const temp = this.media_queue.queue[index];
                this.media_queue.queue.splice(index, 1);
                this.media_queue.enqueue(temp);
            }
        } else {
            this.media_queue.queue.splice(this.queue_index + 1, 0, media_item);
        }

        console.log(this.media_queue.queue)
    }
}