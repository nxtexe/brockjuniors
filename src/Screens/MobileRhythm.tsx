import React, {ChangeEvent} from 'react';
import Slide from '@material-ui/core/Slide';
import IconButton from '../Components/IconButton';
import ChevronDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ShareIcon from '@material-ui/icons/Share';
import Slider from '@material-ui/core/Slider';
import RepeatIcon from '@material-ui/icons/Repeat';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import {ReactComponent as ShuffleIconSmall} from '../assets/Shuffle.svg';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import {ReactComponent as ThumbUpSmallIcon} from '../assets/ThumbUpSmall.svg';
import {ReactComponent as ThumbDownSmallIcon} from '../assets/ThumbDownSmall.svg';
import {MediaPlayer, MediaItem, MediaQueue} from '../Rhythm';
import {ReactComponent as RepeatOneSmallIcon} from '../assets/RepeatOne.svg';
import {ReactComponent as RepeatSmallIcon} from '../assets/Repeat.svg';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import TabPanel from '../Components/TabPanel';
import PlaylistItem from '../Components/PlaylistItem';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import Modal from '@material-ui/core/Modal';
import TextField from '../Components/TextField';
import Button from '../Components/Button';
import moment from 'moment'
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

        this.media_player.on('change', (media_item : MediaItem) => {
            if ('mediaSession' in window.navigator) {
                const split_list : string[] = media_item.thumbnail.url.split('.');

                (window.navigator as any).mediaSession.metadata = new (window as any).MediaMetadata({
                    title: media_item.name,
                    artist: media_item.author?.name,
                    album: 'Brock Juniors Rhythm',
                    artwork: [
                        {
                            src: media_item.thumbnail.url,
                            sizes: `${media_item.thumbnail.width}x${media_item.thumbnail.height}`,
                            type: `image/${split_list[split_list.length - 1]}`
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
            if (!Number.isNaN(this.media_player?.current_time) &&!this.state.open_playlist && this.state.open) {
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
    handle_scrub(event: ChangeEvent<{}>, scrub_pos: number | number[]) {
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

    animate_scrub(event: ChangeEvent<{}>, scrub_pos: number | number[]) {
        if (typeof scrub_pos !== "number") {
            const current_time : number = (scrub_pos[0] / 100) * this.state.media_item.duration;
            this.setState({scrub_pos: scrub_pos[0], current_time: current_time});
        } else {
            const current_time : number = (scrub_pos / 100) * this.state.media_item.duration; 
            this.setState({scrub_pos: scrub_pos, current_time: current_time});
        }
    }

    handle_volume(event: ChangeEvent<{}>, volume: number | number[]) {
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
            playlist_item: {
                name: media_item.name,
                uuid: media_item.uuid,
                liked: media_item.liked,
                author: {
                    name: media_item.author?.name
                },
                duration: media_item.duration,
                thumbnail: {
                    url: media_item.thumbnail.url
                }
            }
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

        this.media_player.skipt_to(media_item.uuid);

        this.setState({open_playlist: false});
    }

    toggle_search_modal = () => {
        this.setState({open_search_modal: !this.state.open_search_modal});
    }

    close_playlist_item_menu = () => this.setState({open_playlist_item_menu: false});
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
                        <div className="title">
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
                            <div style={this.state.media_item.thumbnail.url.length ? {backgroundImage: `url(${this.state.media_item.thumbnail.url})`} : {}}>
                                {this.state.media_item.name}
                            </div>
                        </div>
                        <div className="song-info">
                            <div className="title">
                                <h6>{this.state.media_item.name}</h6>
                            </div>
                            <div className="channel">
                                <p className="caption">{this.state.media_item.author.name}</p>
                            </div>
                        </div>
                        <div className={`like ${this.state.media_item.liked ? 'active' : ''}`}>
                            <IconButton onClick={() => {
                                if (this.media_player.now_playing.liked) {
                                    this.media_player.now_playing.liked = false;
                                    this.state.liked_queue.remove(this.media_player.now_playing);
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
                            <IconButton>
                                <ShareIcon />
                            </IconButton>
                        </div>
                        <div className={`dislike ${this.state.dislike ? 'active' : ''}`}>
                            <IconButton disabled={!this.media_player.queue.length ? true : false} onClick={() => {
                                this.media_player.remove();
                            }}>
                            {this.state.dislike ? <ThumbDownSmallIcon /> : <ThumbDownIcon />}
                            </IconButton>
                        </div>
                        <div className="current-time">
                            <p className="caption">{moment.utc(this.state.current_time*1000).format('m:ss')}</p>
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
                            <p className="caption">{moment.utc(this.state.media_item.duration*1000).format('m:ss')}</p>
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
                        console.log(e.defaultMuiPrevented)
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
                                <MenuItem onClick={() => {}}>Play Next</MenuItem>
                                <MenuItem onClick={() => {}}>{!this.state.playlist_item.liked ? 'Like' : 'Unlike'}</MenuItem>
                                <MenuItem onClick={() => {}}>Dislike</MenuItem>
                                <MenuItem onClick={() => {}}>Share</MenuItem>
                            </Menu>
                            <div className="playlist-add" style={this.state.playlist_page !== 1 ? {display: 'none'} : {}}>
                                <IconButton onClick={this.toggle_search_modal}>
                                    <PlaylistAddIcon />
                                </IconButton>
                            </div>
                            <Tabs value={this.state.playlist_page} onChange={(_, index : number) => this.setState({playlist_page: index})}>
                                <Tab label="Curated" />
                                <Tab label="Liked Songs" />
                            </Tabs>
                            <SwipeableViews className="swipeable-view" index={this.state.playlist_page} onChangeIndex={(index : number) => this.setState({playlist_page: index})}>
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
                            <Modal className="search-modal" open={this.state.open_search_modal} onClose={this.toggle_search_modal}>
                                <Slide direction="up" in={this.state.open_search_modal}>
                                        
                                    <div className="search-modal-content">
                                        <div className="top-notch"></div>
                                        <div className="input-group">
                                            <TextField
                                                variant="flat"
                                                autoFocus
                                                placeholder="Search..."
                                                value={this.state.search_query}
                                                onChange={(e) => this.setState({search_query: e.target.value})}
                                            />
                                            <Button
                                                className={`${this.state.searching ? 'loading' : ''}`}
                                                onClick={() => {
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
                                                }}
                                                variant="flat"
                                            >
                                                    Search
                                            </Button>
                                        </div>
                                    </div>
                                </Slide>
                            </Modal>
                        </div>
                    </SwipeableDrawer>
                    
                </div>
            </Slide>
        );
    }
}