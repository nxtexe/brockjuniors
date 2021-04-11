import { MediaQueue } from "./MediaQueue";
import moment from 'moment';
import ytsr from 'ytsr';
import ytdl from 'ytdl-core';
import {iOS} from '../common/utils';
import {MediaSource, events} from './MediaSource';

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
}

export class MediaPlayer {
    private media_queue : MediaQueue = new MediaQueue();
    private audio_context : AudioContext = new AudioContext();
    private queue_index : number = 0;
    private _playing : boolean = false;
    
    private media_source : MediaSource = new MediaSource(this.audio_context);
    constructor() {        
        const url : string = './rhythm-join.mp3';
        const rhythm_audio : HTMLAudioElement = new Audio(url);
        
        rhythm_audio.onloadedmetadata = () => {
            this.media_queue.enqueue({
                url: url,
                name: 'Rhythm Join',
                thumbnail: {
                    url: '',
                    width: 0,
                    height: 0
                },
                duration: rhythm_audio.duration,
                author: {
                    name: 'Brock Juniors',
                    channelID: '',
                    url: ''
                },
                audio: rhythm_audio,
                source: this.audio_context.createMediaElementSource(rhythm_audio)
            });
        };
                

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

    private resolve_audio_buffer(url : string) : Promise<AudioBuffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url);
                const array_buffer : ArrayBuffer = await response.arrayBuffer();
    
                const audio_buffer : AudioBuffer = await this.audio_context.decodeAudioData(array_buffer);
    
                resolve(audio_buffer);
            } catch(e) {
                reject(e);
            }
        });
    }

    private cors_resolve_audio_buffer(url : string) : Promise<AudioBuffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
                const array_buffer : ArrayBuffer = await response.arrayBuffer();
    
                const audio_buffer : AudioBuffer = await this.audio_context.decodeAudioData(array_buffer);
    
                resolve(audio_buffer);
            } catch(e) {
                reject(e);
            }
        });
    }

    public _MediaPlayer() {
        //destructor

        this.media_source._MediaSource();

        if (this._playing) {
            this.media_source.pause();
            this._playing = false;
        }

        this.queue_index = 0;
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
    }

    public next() {
        if (this.queue_index < this.media_queue.length - 1) {
            this.queue_index += 1;
            this.media_source.pause();
            // this.audio_ref.setAttribute('src', this.media_queue.queue[this.queue_index].url);
            this.media_source.source = this.media_queue.queue[this.queue_index].source;
            this.media_source.audio = this.media_queue.queue[this.queue_index].audio;
            this.media_source.current_time = 0;

            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this.queue_index]);

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
        
        if (this.queue_index) {
            this.queue_index -= 1;
            this.media_source.source = this.media_queue.queue[this.queue_index].source;
            this.media_source.audio = this.media_queue.queue[this.queue_index].audio;
            this.media_source.current_time = 0;
            
            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this.queue_index]); 
            
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
        if (this.media_queue.length && this.queue_index < this.media_queue.length) {
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
                            this.media_queue.enqueue(media_item);
                        }
                        
                        if ((!this.media_queue.length || this.queue_index >= this.media_queue.length - 1 || this.media_queue.length === 2) && !this._playing) {
                            this.media_source.source = this.media_queue.queue[this.queue_index].source;
                            this.media_source.audio = this.media_queue.queue[this.queue_index].audio;
                            
                            if (this.media_source.callbacks.change) this.media_source.callbacks.change(this.media_queue.queue[this.queue_index]); 
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

    public volume(volume : number) {
        this.media_source.volume = volume;
    }

    set current_time(currentTime : number) {
        this.media_source.current_time = currentTime;
    }

    get current_time() : number {
        return this.media_source.current_time;
    }

    get is_playing() : boolean {
        return this._playing;
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
                    duration: duration,
                    name: result.title,
                    thumbnail: {
                        width: result.bestThumbnail?.width,
                        height: result.bestThumbnail?.height,
                        url: result.bestThumbnail?.url
                    },
                    url: result.url,
                    author: result.author
                };
            });
        } else {
            return [];
        }
    }


    public on(event : events, callback : Function) : void {
        this.media_source.on(event, callback);
    }
    
}