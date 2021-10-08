import React, {ChangeEvent} from 'react';
import Slide from '@mui/material/Slide';
import IconButton from '../Components/IconButton';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ShareIcon from '@mui/icons-material/Share';
import Slider from '@mui/material/Slider';
import RepeatIcon from '@mui/icons-material/Repeat';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import {ReactComponent as ShuffleIconSmall} from '../assets/Shuffle.svg';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {ReactComponent as ThumbUpSmallIcon} from '../assets/ThumbUpSmall.svg';
import {ReactComponent as ThumbDownSmallIcon} from '../assets/ThumbDownSmall.svg';
import {MediaPlayer, MediaItem, MediaQueue} from '../Rhythm';
import {ReactComponent as RepeatOneSmallIcon} from '../assets/RepeatOne.svg';
import {ReactComponent as RepeatSmallIcon} from '../assets/Repeat.svg';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SwipeableViews from 'react-swipeable-views';
import TabPanel from '../Components/TabPanel';
import PlaylistItem from '../Components/PlaylistItem';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import Modal from '@mui/material/Modal';
import moment from 'moment'
import DefaultCover from '../assets/web_hi_res_512.png';
import {format_from_duration, isMobile, generate_artwork} from '../common/utils';
import DesktopNavbar from '../Components/DesktopNavbar';
import PlaylistSearch from '../Components/PlaylistSearch';
import '../css/Rhythm.css';

interface ShortMediaItem {
    liked: boolean;
    name: string;
    uuid: string;
    duration: number;
    author?: {
        name?: string;
    };
    thumbnail: {
        url: string;
    }
}

interface RhythmProps {

}

interface RhythmState {
    open : boolean;
    search_query : string;
    searching : boolean;
    shuffle_on : boolean;
    playlist_item : ShortMediaItem;
    playlist_item_anchor : any | undefined;
    open_playlist_item_menu : boolean;
    open_drawer : boolean;
    open_search_modal : boolean;
    curated_queue : MediaQueue;
    liked_queue : MediaQueue;
    playing_from : number;
    dislike : boolean;
    playlist_page : number;
    current_time : number;
    buffering: boolean;
    scrub_pos : number;
    volume : number;
    open_playlist : boolean;
    repeat : number;
    media_item : ShortMediaItem;
}

let short_media_item = {
    liked: false,
    uuid: '',
    name: '',
    author: {
        name: ''
    },
    duration: 0,
    thumbnail: {
        url: ''
    }
};

export default class MobileRythym extends React.Component<RhythmProps, RhythmState> {
    private media_player : MediaPlayer = new MediaPlayer();
    private current_time_interval : number = 0;
    private animated_title : HTMLHeadingElement | null = null;
    state = {
        open: false,
        shuffle_on: false,
        searching: false,
        open_playlist_item_menu: false,
        playlist_item: short_media_item,
        playlist_item_anchor: undefined,
        search_query: '',
        playing_from: 0,
        open_drawer: false,
        liked_queue: new MediaQueue(),
        curated_queue: new MediaQueue(),
        open_search_modal: false,
        buffering: false,
        open_playlist: false,
        playlist_page: 0,
        dislike: false,
        repeat: 1,
        current_time: 0,
        scrub_pos: 0,
        volume: 100,
        media_item: short_media_item
    }

    async componentDidMount() {
        this.media_player.volume = 0.5;

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

        this.media_player.on('change', async (media_item : MediaItem) => {
            if ('mediaSession' in window.navigator) {
                const split_list : string[] = media_item.thumbnail.url.split('.');

                (window.navigator as any).mediaSession.metadata = new (window as any).MediaMetadata({
                    title: media_item.name,
                    artist: media_item.author?.name,
                    album: 'Brock Juniors Rhythm',
                    artwork: [
                        {
                            src: await generate_artwork(media_item.thumbnail.url),
                            sizes: `${media_item.thumbnail.width}x${media_item.thumbnail.height}`,
                            type: `image/png`
                        }
                    ]
                });
            }
            this.setState({media_item: {
                name: media_item.name,
                liked: media_item.liked,
                uuid: media_item.uuid,
                author: {
                    name: media_item.author?.name
                },
                duration: media_item.duration,
                thumbnail: {
                    url: media_item.thumbnail.url
                }
            }});
        });

        const add_to_queue = async (search : string) => {
            let media_items = await this.media_player.search(search);

            let switched = false;
            if (this.state.curated_queue.id !== this.media_player.queue.id) {
                this.media_player.queue = this.state.curated_queue;
                switched = true;
            }
            
            await this.media_player.add_to_queue(media_items[0]);
            if (switched) {
                this.media_player.queue = this.state.liked_queue;
            }
        }

        // const songs = [
        //     'Jet fuel mac miller',
        //     'Baby keem no sense',
        //     'paris texas heavy metal',
        //     'sore yaw tog',
        //     'element kendrick lamar',
        //     'te vas boy pablo',
        //     'a$ap rocky flako loko',
        //     'kelvin s gang gang',
        //     'Drake - When To Say When & Chicago Freestyle',
        //     'giveon heartbreak anniversary'
        // ];

        // this.media_player.queue = this.state.curated_queue;

        // songs.forEach((song) => {
        //     add_to_queue(song);
        // });
        
        this.current_time_interval = window.setInterval(() => {
            if (!Number.isNaN(this.media_player?.current_time) && (!this.state.open_playlist || !isMobile()) && this.state.open) {
                const scrub_pos : number = (this.media_player.current_time / this.state.media_item.duration) * 100;
                this.setState({current_time: this.media_player.current_time, scrub_pos: scrub_pos});
            }
        }, 1000);
    }

    componentWillUnmount() {
        window.removeEventListener('rhythm-open', ()=>{});
        window.removeEventListener('rhythm-close', ()=>{});
        clearInterval(this.current_time_interval);
    }

    static open() {
        const event = new CustomEvent('rhythm-open');

        window.dispatchEvent(event);
    }

    static close() {
        const event = new CustomEvent('rhythm-close');

        window.dispatchEvent(event);
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
        if (this.media_player) {
            if (typeof scrub_pos !== "number") {
                const current_time : number = (scrub_pos[0] / 100) * this.state.media_item.duration; 
                this.media_player.current_time = current_time;

                this.setState({current_time: current_time});
            } else {
                const current_time : number = (scrub_pos / 100) * this.state.media_item.duration; 
                this.media_player.current_time = current_time;

                this.setState({current_time: current_time});
            }
        }
    }

    animate_scrub(event: Event, scrub_pos: number | Array<number>, activeThumb: number) {
        if (typeof scrub_pos !== "number") {
            const current_time : number = (scrub_pos[0] / 100) * this.state.media_item.duration;
            this.setState({scrub_pos: scrub_pos[0], current_time: current_time});
        } else {
            const current_time : number = (scrub_pos / 100) * this.state.media_item.duration; 
            this.setState({scrub_pos: scrub_pos, current_time: current_time});
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

    playlist_longpress = (e : any, media_item : MediaItem) => {
        this.setState({
            open_playlist_item_menu: true,
            playlist_item_anchor: e.target,
            playlist_item: media_item
        });
    }


    playlist_click = (media_item : MediaItem | ShortMediaItem) => {
        if (this.media_player.is_playing) {
            this.media_player.pause();
        }

        if (this.state.playlist_page !== this.state.playing_from) {
            if (this.state.playlist_page === 0) {
                this.media_player.queue = this.state.curated_queue;
                this.setState({playing_from: 0});
            } else if (this.state.playlist_page === 1) {
                this.media_player.queue = this.state.liked_queue;
                this.setState({playing_from: 1});
            }  
        } 

        this.media_player.skip_to(media_item.uuid);

        this.setState({open_playlist: false});
    }

    toggle_search_modal = () => {
        this.setState({open_search_modal: !this.state.open_search_modal});
    }

    close_playlist_item_menu = () => this.setState({open_playlist_item_menu: false});

    submit_search = () => {
        if(!this.state.searching) {
            this.setState({searching: true}, async () => {
                const [media_item] = await this.media_player.search(this.state.search_query);
                if (media_item) {
                    let switched = false;
                    if (this.state.liked_queue.id !== this.media_player.queue.id) {
                        this.media_player.queue = this.state.liked_queue;
                        switched = true;
                    }
                    media_item.liked = true;
                    await this.media_player.add_to_queue(media_item);

                    if (switched) {
                        this.media_player.queue = this.state.curated_queue;
                    }
                    this.setState({search_query: '', searching: false}, () => {
                        this.toggle_search_modal();
                    });
                }
            });
        }
    }
    render() {
        return (
            <Slide direction="up" in={this.state.open} mountOnEnter unmountOnExit>
                <div className="rhythm">
                    <div className="screen-grid">
                        <div className="back">
                            <IconButton onClick={() => MobileRythym.close()}>
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
                        <div className="cover-art">
                            <div style={{backgroundImage: `url(${this.media_player.queue.length ? this.state.media_item.thumbnail.url : DefaultCover})`}}>
                                {this.media_player.queue.length ? this.state.media_item.name : 'default'}
                            </div>
                        </div>
                        <div className="song-info">
                            <div className="title">
                                <h6 ref={c => this.animated_title = c}>{this.media_player.queue.length ? this.state.media_item.name : 'Nothing to Play - Try Queueing Something from Liked Playlist'}</h6>
                            </div>
                            <div className="channel">
                                <p className="caption">{this.media_player.queue.length ? this.state.media_item.author.name : 'Brock Juniors'}</p>
                            </div>
                        </div>
                        <div className={`like ${this.state.media_item.liked ? 'active' : ''}`}>
                            <IconButton disabled={!this.media_player.queue.length ? true : false} onClick={() => {
                                if (this.media_player.now_playing.liked) {
                                    this.media_player.now_playing.liked = false;
                                    this.state.liked_queue.remove(this.media_player.now_playing.uuid);
                                } else {
                                    this.media_player.now_playing.liked = true;
                                    this.state.liked_queue.enqueue(this.media_player.now_playing);
                                }
                                this.setState({media_item: {
                                    ...this.state.media_item,
                                    liked: !this.state.media_item.liked
                                }});
                            }}>
                                {this.state.media_item.liked ? <ThumbUpSmallIcon /> : <ThumbUpIcon />}
                            </IconButton>
                        </div>
                        <div className="share">
                            <IconButton disabled={!this.media_player.queue.length ? true : false}>
                                <ShareIcon />
                            </IconButton>
                        </div>
                        <div className={`dislike ${this.state.dislike ? 'active' : ''}`}>
                            <IconButton disabled={!this.media_player.queue.length ? true : false} onClick={() => {
                                this.media_player.remove_playing();
                            }}>
                            {this.state.dislike ? <ThumbDownSmallIcon /> : <ThumbDownIcon />}
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
                                <p className="caption">{moment.utc(this.state.media_item.duration*1000).format(format_from_duration(this.state.media_item.duration))}</p>
                            </div>
                        </div>
                        <div className={`repeat ${this.state.repeat === 1 ? '' : 'active'}`}>
                            <IconButton onClick={this.handle_repeat}>
                                {/* if repeat = 1 then no repeat, if repeat = 2 then repeat once, if repeat = 4 then repeat infinitely */}
                                {this.state.repeat === 1 ? <RepeatIcon /> : this.state.repeat === 1 << 1 ? <RepeatOneSmallIcon /> : <RepeatSmallIcon />}
                            </IconButton>
                        </div>
                        <div className="previous">
                            <IconButton disabled={!this.media_player.can_previous} onClick={() => this.media_player.previous()}>
                                <SkipPreviousIcon />
                            </IconButton>
                        </div>
                        <div className="play">
                            <IconButton onClick={() => this.media_player.is_playing ? this.media_player.pause() : this.media_player.play()} disabled={!this.media_player.can_play}>
                                {this.media_player.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </div>
                        <div className="next">
                            <IconButton disabled={!this.media_player.can_next} onClick={() => this.media_player.next()}>
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                        <div className={`shuffle ${this.state.shuffle_on ? 'active' : ''}`}>
                            <IconButton onClick={this.toggle_shuffle}>
                                {this.state.shuffle_on ? <ShuffleIconSmall /> : <ShuffleIcon />}
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
                    <SwipeableDrawer onTouchStart={(e : any) => {
                        e.defaultMuiPrevented = true;
                    }} anchor="right" className="playlist-drawer" open={this.state.open_playlist} onOpen={this.toggle_playlist} onClose={this.toggle_playlist}>
                        <div className="playlist screen-grid">
                            <div className="back">
                                <IconButton onClick={this.toggle_playlist}>
                                    <ChevronLeftIcon />
                                </IconButton>
                            </div>
                            <div className="page-title">
                                <p>Playlist</p>
                            </div>
                            <DesktopNavbar onBack={this.toggle_playlist} title="Playlist" />
                            <Menu
                                id="playlist-item-menu"
                                anchorEl={this.state.playlist_item_anchor}
                                keepMounted
                                open={this.state.open_playlist_item_menu}
                                onClose={this.close_playlist_item_menu}
                            >
                                <div className="song-info">
                                    <div className="title">
                                        <h6>{this.state.playlist_item.name}</h6>
                                    </div>
                                    <div className="channel">
                                        <p className="caption">{this.state.playlist_item.author.name}</p>
                                    </div>
                                </div>
                                <MenuItem onClick={() => {
                                    this.playlist_click(this.state.playlist_item);
                                    this.close_playlist_item_menu();
                                }}>Play</MenuItem>
                                <MenuItem onClick={() => {
                                    // if (this.state.playlist_page === 0) {
                                    //     this.media_player.play_next(this.state.curated_queue.media_item(this.state.playlist_item.uuid));
                                    // } else {
                                    //     this.media_player.play_next(this.state.liked_queue.media_item(this.state.playlist_item.uuid));
                                    // }
                                    // this.setState({open_playlist_item_menu: false});
                                }}>Play Next</MenuItem>
                                <MenuItem onClick={() => {
                                    if (this.state.playlist_page === 0) {
                                        if (this.state.curated_queue.media_item(this.state.playlist_item.uuid).liked) {
                                            this.state.curated_queue.media_item(this.state.playlist_item.uuid).liked = false;
                                            this.state.liked_queue.remove(this.state.playlist_item.uuid);
                                        } else {
                                            this.state.curated_queue.media_item(this.state.playlist_item.uuid).liked = true;
                                            this.state.liked_queue.enqueue(this.state.curated_queue.media_item(this.state.playlist_item.uuid));
                                        }
                                    } else {
                                        this.state.liked_queue.media_item(this.state.playlist_item.uuid).liked = !this.state.liked_queue.media_item(this.state.playlist_item.uuid).liked;
                                        this.state.liked_queue.remove(this.state.playlist_item.uuid);
                                    }
                                }}>
                                    {!this.state.playlist_item.liked ? 'Like' : 'Unlike'}
                                </MenuItem>
                                <MenuItem onClick={() => {
                                    if (this.state.playlist_page === 0) {
                                        this.state.curated_queue.remove(this.state.playlist_item.uuid);
                                    } else {
                                        this.state.liked_queue.remove(this.state.playlist_item.uuid)
                                    }
                                    this.setState({open_playlist_item_menu: false});
                                }}>
                                    Dislike
                                </MenuItem>
                                <MenuItem onClick={() => {}}>Share</MenuItem>
                            </Menu>
                            <div className="playlist-add" style={this.state.playlist_page !== 1 ? {display: 'none'} : {}}>
                                <IconButton onClick={this.toggle_search_modal}>
                                    <PlaylistAddIcon />
                                </IconButton>
                            </div>
                            <Tabs className="playlist-tabs" value={this.state.playlist_page} onChange={(_, index : number) => this.setState({playlist_page: index})}>
                                <Tab label="Curated" />
                                <Tab label="Liked Songs" />
                            </Tabs>
                            <SwipeableViews className="swipeable-view" index={this.state.playlist_page} onChangeIndex={(index : number) => this.setState({playlist_page: index})} onContextMenu={(e) => e.preventDefault()}>
                                <TabPanel index={0} className="curated">
                                    {this.state.curated_queue.queue.map((item : MediaItem, index : number) => {
                                        return <PlaylistItem onClick={this.playlist_click} media_item={item} key={index} onLongPress={(e : any) => this.playlist_longpress(e, item)} />
                                    })}
                                </TabPanel>
                                <TabPanel index={1} className="liked">
                                    {this.state.liked_queue.queue.map((item : MediaItem, index : number) => {
                                        return <PlaylistItem onClick={this.playlist_click} media_item={item} key={index} onLongPress={(e : any) => this.playlist_longpress(e, item)} />
                                    })}
                                </TabPanel>
                            </SwipeableViews>
                            <Modal className="mobile search-modal" open={this.state.open_search_modal} onClose={this.toggle_search_modal}>
                                <Slide direction="up" in={this.state.open_search_modal}>
                                    <PlaylistSearch
                                        search_query={this.state.search_query}
                                        className={`${this.state.searching ? 'loading' : ''}`}
                                        onChange={(e) => this.setState({search_query: e.target.value, searching: false})}
                                        onClick={this.submit_search}
                                    />
                                </Slide>
                            </Modal>
                        </div>
                    </SwipeableDrawer>
                    <div className={`desktop search-modal ${this.state.open_search_modal && this.state.open_playlist ? 'open' : 'close'}`}>
                        <PlaylistSearch
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