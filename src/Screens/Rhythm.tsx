import React from 'react';
import Slide from '@mui/material/Slide';
import IconButton from '../Components/IconButton';
import {share} from '../common/utils';
import {
    PlaylistPlay as PlaylistPlayIcon,
    KeyboardArrowDown as ChevronDownIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Share as ShareIcon,
    Repeat as RepeatIcon,
    PlayArrow as PlayArrowIcon,
    Pause as PauseIcon,
    SkipPrevious as SkipPreviousIcon,
    SkipNext as SkipNextIcon,
    Shuffle as ShuffleIcon,
    VolumeDown as VolumeDownIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import {SwipeableDrawer, LyricsView} from '../Rhythm/Components';
import Slider from '@mui/material/Slider';
import {ReactComponent as ShuffleSmallIcon} from '../assets/icons/ShuffleSmall.svg';
import {ReactComponent as ThumbUpSmallIcon} from '../assets/icons/ThumbUpSmall.svg';
import {ReactComponent as ThumbDownSmallIcon} from '../assets/icons/ThumbDownSmall.svg';
import {MediaPlayer, MediaItem, MediaQueue} from '../Rhythm';
import {ReactComponent as RepeatOneSmallIcon} from '../assets/icons/RepeatOneSmall.svg';
import {ReactComponent as RepeatSmallIcon} from '../assets/icons/RepeatSmall.svg';
import {ReactComponent as LyricsIcon} from '../assets/icons/Lyrics.svg';
import {ReactComponent as LyricsSmallIcon} from '../assets/icons/LyricsSmall.svg';
import moment from 'moment'
import DefaultCover from '../assets/images/web_hi_res_512.png';
import {format_from_duration, toggle_ticker, shared_element_transition} from '../common/utils';
import DesktopPlaylistSearch from '../Components/DesktopPlaylistSearch';
import '../css/Rhythm.css';


interface RhythmState {
    open : boolean;
    search_query : string;
    searching : boolean;
    shuffle_on : boolean;
    open_drawer : boolean;
    open_search_modal : boolean;
    curated_queue : MediaQueue;
    liked_queue : MediaQueue;
    playing_from : number;
    lyrics : boolean;
    playlist_page : number;
    current_time : number;
    buffering: boolean;
    scrub_pos : number;
    volume : number;
    open_playlist : boolean;
    repeat : number;
    media_item : MediaItem | undefined;
    scrubbing: boolean;
    is_playing: boolean;
}


interface RhythmPlayEvent {
    _id: string;
}

export default class Rhythm extends React.Component<{}, RhythmState> {
    static ready: boolean = false;
    private media_player : MediaPlayer = new MediaPlayer();
    private current_time_interval : number = 0;
    private animated_title : HTMLHeadingElement | null = null;
    private curated_queue : MediaQueue = new MediaQueue();
    private liked_queue : MediaQueue = new MediaQueue();
    private cover_art: HTMLElement | null = null;
    private lyrics_cover_art: HTMLElement | null = null;
    private ref: HTMLElement | null = null;
    state: RhythmState = {
        open: false,
        shuffle_on: false,
        searching: false,
        search_query: '',
        playing_from: 0,
        open_drawer: false,
        liked_queue: new MediaQueue(),
        curated_queue: new MediaQueue(),
        open_search_modal: false,
        buffering: false,
        open_playlist: false,
        playlist_page: 0,
        lyrics: false,
        repeat: 1,
        current_time: 0,
        scrub_pos: 0,
        volume: 100,
        media_item: undefined,
        scrubbing: false,
        is_playing: false
    }

    async componentDidMount() {
        this.media_player.volume = 0.5;

        window.addEventListener('rhythm-play', ((e: CustomEvent<RhythmPlayEvent>) => {
            let index: number | undefined = this.media_player.queue.find(e.detail._id);
            if (index !== undefined) {
                this.media_player.queue_index = index;
                return;
            }
            this.media_player.add_to_queue(e.detail._id)
            .then(() => {
                if (this.media_player.queue.length) {
                    this.media_player.skip_to(this.media_player.queue.length - 1);
                }
            });

            
        }) as EventListener, true);

        window.addEventListener('rhythm-open', () => {
            this.setState({open: true});
        }, true);
        window.addEventListener('rhythm-close', () => {
            this.setState({open: false});
        }, true);
        
        this.media_player.on('buffering', () => {
            this.setState({buffering: true});
        });
        this.media_player.on('bufferend', () => {
            this.setState({buffering: false});
        });

        this.media_player.on('play', () => {
            this.setState({is_playing: true});
        });

        this.media_player.on('pause', () => {
            this.setState({is_playing: false});
        });

        this.media_player.on('change', async (media_item : MediaItem) => {
            if ('mediaSession' in window.navigator) {
                const split_list : string[] = media_item.cover_art.url.split('.');

                (window.navigator as any).mediaSession.metadata = new (window as any).MediaMetadata({
                    title: media_item.name,
                    artist: media_item.artiste,
                    album: 'Brock Juniors Rhythm',
                    artwork: [
                        {
                            src: media_item.cover_art.url,
                            sizes: `${media_item.cover_art.width}x${media_item.cover_art.height}`,
                            type: `image/${split_list.pop()}`
                        }
                    ]
                });
            }
            this.setState({media_item: media_item});
        });

        // const add_to_queue = async (search : string) => {
        //     let media_items = await this.media_player.search(search);

        //     let switched = false;
        //     if (this.state.curated_queue.id !== this.media_player.queue.id) {
        //         this.media_player.queue = this.state.curated_queue;
        //         switched = true;
        //     }
            
        //     await this.media_player.add_to_queue(media_items[0]);
        //     if (switched) {
        //         this.media_player.queue = this.state.liked_queue;
        //     }
        // }

        const songs = [
            '649CF62F5046A5A4CDACD9FD69E4EF87E9BA7518',
            '1E29EDF43897FF544CF2F5C21242E25D7BA59FBD',
        ];

        this.media_player.queue = this.state.curated_queue;

        
        
        this.media_player.on('timeupdate', () => {
            if (!Number.isNaN(this.media_player?.current_time) && !this.state.scrubbing && this.state.media_item) {
                const scrub_pos : number = (this.media_player.current_time / this.state.media_item.duration) * 100;
                this.setState({current_time: this.media_player.current_time, scrub_pos: scrub_pos});
            }
        });

        await this.media_player.add_to_queue(songs);
        Rhythm.ready = true;
        
        const event = new CustomEvent('rhythm-ready');

        window.dispatchEvent(event);
    }

    componentWillUnmount() {
        window.removeEventListener('rhythm-open', ()=>{});
        window.removeEventListener('rhythm-close', ()=>{});
        clearInterval(this.current_time_interval);
        this.media_player._MediaPlayer();
    }

    static open() {
        const event = new CustomEvent('rhythm-open');

        window.dispatchEvent(event);
    }

    static close() {
        const event = new CustomEvent('rhythm-close');

        window.dispatchEvent(event);
    }

    static set onready(_onready: Function | null) {
        window.addEventListener('rhythm-ready', () => {
            if (_onready) {
                _onready();
            }
            window.removeEventListener('rhythm-ready', () => {});
        }, true);
    }

    toggle_playlist = () => {
        this.setState({open_playlist: !this.state.open_playlist});
    }

    toggle_shuffle = () => {
        if (this.state.shuffle_on) {
            this.media_player.unshuffle();
            this.setState({shuffle_on: false});
        } else {
            this.media_player.shuffle();
            this.setState({shuffle_on: true});
        }

    }
    handle_scrub(event: React.SyntheticEvent | Event, scrub_pos: number | Array<number>) {
        console.log(scrub_pos);
        if (this.media_player && this.state.media_item) {
            if (typeof scrub_pos !== "number") {
                const current_time : number = (scrub_pos[0] / 100) * this.state.media_item.duration; 
                this.media_player.current_time = current_time;

                this.setState({current_time: current_time, scrubbing: false});
            } else {
                const current_time : number = (scrub_pos / 100) * this.state.media_item.duration; 
                this.media_player.current_time = current_time;

                this.setState({current_time: current_time, scrubbing: false});
            }
        }
    }

    animate_scrub(event: Event, scrub_pos: number | Array<number>, activeThumb: number) {
        if (!this.state.scrubbing) {
            this.setState({scrubbing: true});
        }
        if (this.state.media_item) {
            if (typeof scrub_pos !== "number") {
                const current_time : number = (scrub_pos[0] / 100) * this.state.media_item.duration;
                this.setState({scrub_pos: scrub_pos[0], current_time: current_time});
            } else {
                const current_time : number = (scrub_pos / 100) * this.state.media_item.duration; 
                this.setState({scrub_pos: scrub_pos, current_time: current_time});
            }
        }
    }

    handle_volume(event: Event, volume: number | Array<number>, activeThumb: number) {
        // if (this.media_player.muted) {
        //     this.media_player.muted = false;
        // }
        if (typeof volume !== "number") {
            this.media_player.volume = (volume[0] / 100) / 2;
            this.setState({volume: volume[0]});
        } else {
            this.media_player.volume = (volume / 100) / 2;
            this.setState({volume: volume});
        }
    }

    handle_repeat = () => {
        if (this.state.repeat < 4) {
            this.setState({repeat: this.state.repeat << 1}, () => {
                this.media_player.repeat = this.state.repeat;
            });
        } else {
            this.setState({repeat: 1}, () => {
                this.media_player.repeat = this.state.repeat;
            });
        }
    }

    toggle_search_modal = () => {
        this.setState({open_search_modal: !this.state.open_search_modal});
    }

    submit_search = () => {
        // if(!this.state.searching) {
        //     this.setState({searching: true}, async () => {
        //         const [media_item] = await this.media_player.search(this.state.search_query);
        //         if (media_item) {
        //             let switched = false;
        //             if (this.state.liked_queue.id !== this.media_player.queue.id) {
        //                 this.media_player.queue = this.state.liked_queue;
        //                 switched = true;
        //             }
        //             media_item.liked = true;
        //             await this.media_player.add_to_queue(media_item);

        //             if (switched) {
        //                 this.media_player.queue = this.state.curated_queue;
        //             }
        //             this.setState({search_query: '', searching: false}, () => {
        //                 this.toggle_search_modal();
        //             });
        //         }
        //     });
        // }
    }

    toggle_play() {
        this.media_player.is_playing ? this.media_player.pause() : this.media_player.play();
    }

    toggle_lyrics() {
        // toggle lyrics
        if (this.ref && this.lyrics_cover_art && this.cover_art) {
            if (this.state.lyrics) {
                shared_element_transition(this.lyrics_cover_art, this.cover_art, this.ref, 250);
                if (this.lyrics_cover_art.firstChild && this.cover_art.firstChild) {
                    shared_element_transition((this.lyrics_cover_art.firstChild as HTMLElement), (this.cover_art.firstChild as HTMLElement), this.ref, 250);
                }
            } else {
                shared_element_transition(this.cover_art, this.lyrics_cover_art, this.ref, 300);
                if (this.lyrics_cover_art.firstChild && this.cover_art.firstChild) {
                    shared_element_transition((this.cover_art.firstChild as HTMLElement), (this.lyrics_cover_art.firstChild as HTMLElement), this.ref, 300);
                }
            }
        }
        this.setState({lyrics: !this.state.lyrics});
    }
    
    static play(_id: string) {
        const event = new CustomEvent<RhythmPlayEvent>('rhythm-play', {
            detail: {
                _id: _id
            }
        });

        window.dispatchEvent(event);
    }
    render() {
        return (
            <Slide direction="up" in={this.state.open} mountOnEnter unmountOnExit>
                <div className={`rhythm ${this.state.lyrics ? 'lyrics-view' : ''}`} ref={(c) => this.ref = c}>
                <LyricsView playing={this.state.is_playing} current_time={this.state.current_time} lyrics={this.media_player.now_playing?.lyrics || {}} in={this.state.lyrics} />
                    <div className="screen-grid">
                        <div className="back">
                            <IconButton onClick={() => Rhythm.close()}>
                                <ChevronDownIcon />
                            </IconButton>
                        </div>
                        <div className="page-title">
                            <p>
                                BROCK JUNIORS
                            </p>
                        </div>
                        <div className="playlist">
                            <IconButton onClick={this.toggle_playlist}>
                                <PlaylistPlayIcon />
                            </IconButton>
                        </div>
                        <div className={`cover-art`} ref={(c) => this.cover_art = c}>
                            <img src={this.media_player.queue.length ? this.state.media_item?.cover_art?.url : DefaultCover} alt={this.media_player.queue.length ? this.state.media_item?.name : 'default'} />
                        </div>
                        <div className={`cover-art lyrics-view`} ref={(c) => this.lyrics_cover_art = c}>
                            <img src={this.media_player.queue.length ? this.state.media_item?.cover_art?.url : DefaultCover} alt={this.media_player.queue.length ? this.state.media_item?.name : 'default'} />
                        </div>
                        <div className="song-info">
                            <div className="title">
                                <h6 ref={toggle_ticker}>{this.media_player.queue.length ? this.state.media_item?.name : 'Nothing to Play - Try Queueing Something from Liked Playlist'}</h6>
                            </div>
                            <div className="channel">
                                <p ref={toggle_ticker} className="caption">{this.media_player.queue.length ? this.state.media_item?.artiste : 'Brock Juniors'}</p>
                            </div>
                        </div>
                        <div className={`like ${this.state.media_item?.liked ? 'active' : ''}`}>
                            <IconButton disabled={!this.media_player.queue.length ? true : false} onClick={() => {
                                if (this.media_player.now_playing.liked) {
                                    this.media_player.now_playing.liked = false;
                                    // this.state.liked_queue.remove(this.media_player.now_playing.uuid);
                                } else {
                                    this.media_player.now_playing.liked = true;
                                    this.state.liked_queue.enqueue(this.media_player.now_playing);
                                }
                                if (this.state.media_item) {
                                    this.setState({media_item: {
                                        ...this.state.media_item,
                                        liked: !this.state.media_item.liked
                                    }});
                                }
                            }}>
                                {this.state.media_item?.liked ? <ThumbUpSmallIcon /> : <ThumbUpIcon />}
                            </IconButton>
                        </div>
                        {
                            "share" in navigator ?
                            <div className="share">
                                <IconButton
                                    onClick={() => {
                                        if (this.state.media_item) {
                                            share(
                                                this.state.media_item?.name,
                                                "Who are we? We are BrockJuniors",
                                                `${window.location.origin}/?rhythm=${this.state.media_item?._id}`
                                            );
                                        }
                                    }}
                                    disabled={!this.media_player.queue.length ? true : false}
                                >
                                    <ShareIcon />
                                </IconButton>
                            </div>
                            : undefined
                        }
                        <div className={`lyrics ${this.state.lyrics ? 'active' : ''}`}>
                            <IconButton disabled={!this.media_player.queue.length ? true : false} onClick={this.toggle_lyrics.bind(this)}>
                            {this.state.lyrics ? <LyricsSmallIcon /> : <LyricsIcon />}
                            </IconButton>
                        </div>
                        <div className="time-info">
                            <div className="current-time">
                                <p className="caption">{moment.utc(this.state.current_time*1000).format(format_from_duration(this.state.current_time))}</p>
                            </div>
                            <div className="current-time-slider">
                                <Slider
                                    value={this.state.scrub_pos}
                                    onChange={this.animate_scrub.bind(this)}
                                    onChangeCommitted={this.handle_scrub.bind(this)}
                                    aria-labelledby="continuous-slider"
                                />
                            </div>
                            <div className="duration">
                                <p className="caption">{moment.utc((this.state.media_item?.duration || 0) *1000).format(format_from_duration(this.state.media_item?.duration || 0))}</p>
                            </div>
                        </div>
                        <div className={`repeat ${this.state.repeat === 1 ? '' : 'active'}`}>
                            <IconButton onClick={this.handle_repeat}>
                                {/* if repeat = 1 then no repeat, if repeat = 2 then repeat once, if repeat = 4 then repeat infinitely */}
                                {this.state.repeat === 1 ? <RepeatIcon /> : this.state.repeat === 1 << 1 ? <RepeatOneSmallIcon /> : <RepeatSmallIcon />}
                            </IconButton>
                        </div>
                        <div className="previous">
                            <IconButton onClick={() => {this.media_player.previous();}}>
                                <SkipPreviousIcon />
                            </IconButton>
                        </div>
                        <div className={`play ${this.state.is_playing ? '' : 'paused'}`}>
                            <IconButton onClick={() => this.toggle_play()} disabled={!this.media_player.can_play} disableRipple>
                                {this.state.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </div>
                        <div className="next">
                            <IconButton onClick={() => {this.media_player.next();}}>
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                        <div className={`shuffle ${this.state.shuffle_on ? 'active' : ''}`}>
                            <IconButton onClick={this.toggle_shuffle}>
                                {this.state.shuffle_on ? <ShuffleSmallIcon /> : <ShuffleIcon />}
                            </IconButton>
                        </div>
                        <div className="volume-down">
                            <VolumeDownIcon />
                        </div>
                        <div className="volume-slider">
                            <Slider
                                value={this.state.volume}
                                onChange={this.handle_volume.bind(this)}
                                aria-labelledby="continuous-slider" 
                            />
                        </div>
                        <div className="volume-up">
                            <VolumeUpIcon />
                        </div>
                    </div>
                    <SwipeableDrawer
                        liked_queue={this.state.liked_queue}
                        curated_queue={this.state.curated_queue}
                        open_playlist={this.state.open_playlist}
                        media_player={this.media_player}
                        toggle_playlist={this.toggle_playlist}
                        submit_search={this.submit_search}
                    />
                    <div className={`desktop search-modal ${this.state.open_search_modal && this.state.open_playlist ? 'open' : 'close'}`}>
                        <DesktopPlaylistSearch
                            in={this.state.open_search_modal && this.state.open_playlist}
                            search_query={this.state.search_query}
                            className={`${this.state.searching ? 'loading' : ''}`}
                            onChange={(e) => this.setState({search_query: e.target.value, searching: false})}
                            onClick={this.submit_search}
                            onClose={this.toggle_search_modal}
                        />
                    </div>
                </div>
            </Slide>
        );
    }
}