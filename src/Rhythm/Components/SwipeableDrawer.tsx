import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// import SwipeableViews from 'react-swipeable-views';
import TabPanel from '../../Components/TabPanel';
import PlaylistItem from './PlaylistItem';
import DesktopNavbar from '../../Components/DesktopNavbar';
import PlaylistSearch from './PlaylistSearch';
import IconButton from '../../Components/IconButton';
import {SwipeableDrawer as MuiSwipeableDrawer} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    PlaylistAdd as PlaylistAddIcon
} from '@mui/icons-material';
import {MediaItem, MediaPlayer, MediaQueue} from '../';
import {share} from '../../common/utils';

interface SwipeableDrawerProps {
    liked_queue: MediaQueue;
    curated_queue: MediaQueue;
    media_player: MediaPlayer;
    open_playlist: boolean;
    toggle_playlist: () => void;
    submit_search: () => void;
    
}
interface SwipeableDrawerState {
    open_playlist_item_menu: boolean;
    playlist_item: MediaItem | undefined;
    playlist_item_index: number;
    playlist_page: number;
    open_search_modal: boolean;
    search_query: string;
    searching: boolean;
    playlist_item_anchor: Element | undefined;
    can_close: boolean;
}

export default class SwipeableDrawer extends React.Component<SwipeableDrawerProps, SwipeableDrawerState> {
    state: SwipeableDrawerState = {
        open_playlist_item_menu: false,
        open_search_modal: false,
        playlist_page: 0,
        playlist_item_index: 0,
        search_query: '',
        searching: false,
        playlist_item_anchor: undefined,
        playlist_item: undefined,
        can_close: true
    }

    toggle_search_modal = () => {
        this.setState({open_search_modal: !this.state.open_search_modal});
    }
    close_playlist_item_menu = () => this.setState({open_playlist_item_menu: false});
    playlist_longpress = (e : any, item_index: number) => {
        this.setState({
            open_playlist_item_menu: true,
            playlist_item_anchor: e.target,
            playlist_item_index: item_index
        });
    }

    playlist_click = (item_index: number) => {
        if (this.props.media_player.is_playing) {
            this.props.media_player.pause();
        }

        if (this.state.playlist_page === 0) {
            this.props.media_player.queue = this.props.curated_queue;
        } else if (this.state.playlist_page === 1) {
            this.props.media_player.queue = this.props.liked_queue;
        }

        this.props.media_player.skip_to(item_index);

        this.props.toggle_playlist();
    }

    
    onClose() {
        if (!this.state.playlist_page) {
            this.props.toggle_playlist();
        }
    }
    render() {
        return (
            <MuiSwipeableDrawer
                onTouchStart={(e : any) => {
                    e.defaultMuiPrevented = true;
                }}
                anchor="right"
                className="playlist-drawer"
                open={this.props.open_playlist || !this.state.can_close}
                onOpen={this.props.toggle_playlist}
                onClose={this.onClose.bind(this)}
                hysteresis={0.8}
                disableSwipeToOpen={false}
                disableDiscovery
            >
                <div className="playlist screen-grid">
                    <div className="back">
                        <IconButton onClick={this.props.toggle_playlist}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <div className="page-title">
                        <p>Playlist</p>
                    </div>
                    <DesktopNavbar onBack={this.props.toggle_playlist} title="Playlist" />
                    <Menu
                        id="playlist-item-menu"
                        anchorEl={this.state.playlist_item_anchor}
                        keepMounted
                        open={this.state.open_playlist_item_menu}
                        onClose={this.close_playlist_item_menu}
                    >
                        <div className="song-info">
                            <div className="title">
                                <h6>{this.props.media_player.media_item(this.state.playlist_item_index)?.name}</h6>
                            </div>
                            <div className="channel">
                                <p className="caption">{this.props.media_player.media_item(this.state.playlist_item_index)?.artiste}</p>
                            </div>
                        </div>
                        <MenuItem onClick={() => {
                            this.close_playlist_item_menu();
                            this.playlist_click(this.state.playlist_item_index);
                        }}>Play</MenuItem>
                        <MenuItem onClick={() => {
                            const index = this.state.playlist_item_index;
                            const media_item = this.props.media_player.media_item(index);
                            if (media_item) {
                                this.props.media_player.play_next(media_item._id);  
                            }
                            this.setState({open_playlist_item_menu: false});
                        }}>Play Next</MenuItem>
                        <MenuItem onClick={() => {
                            // if (this.state.playlist_page === 0) {
                            //     if (this.state.curated_queue.media_item(this.state.playlist_item.uuid).liked) {
                            //         this.state.curated_queue.media_item(this.state.playlist_item.uuid).liked = false;
                            //         this.state.liked_queue.remove(this.state.playlist_item.uuid);
                            //     } else {
                            //         this.state.curated_queue.media_item(this.state.playlist_item.uuid).liked = true;
                            //         this.state.liked_queue.enqueue(this.state.curated_queue.media_item(this.state.playlist_item.uuid));
                            //     }
                            // } else {
                            //     this.state.liked_queue.media_item(this.state.playlist_item.uuid).liked = !this.state.liked_queue.media_item(this.state.playlist_item.uuid).liked;
                            //     this.state.liked_queue.remove(this.state.playlist_item.uuid);
                            // }
                        }}>
                            {!this.state.playlist_item?.liked ? 'Like' : 'Unlike'}
                        </MenuItem>
                        {
                            "share" in navigator ?
                            <MenuItem onClick={() => {
                                const index = this.state.playlist_item_index;
                                const media_item = this.props.media_player.media_item(index);
                                if (media_item) {
                                    share(
                                        media_item.name,
                                        "Who are we? We are BrockJuniors",
                                        `${window.location.origin}/?rhythm=${media_item._id}`
                                    );
                                }
                            }}>Share</MenuItem>
                            : undefined
                        }
                    </Menu>
                    <div className="playlist-add" style={this.state.playlist_page !== 1 ? {display: 'none'} : {}}>
                        <IconButton onClick={this.toggle_search_modal}>
                            <PlaylistAddIcon />
                        </IconButton>
                    </div>
                    <Tabs className="playlist-tabs" value={this.state.playlist_page} onChange={(_, index : number) => this.setState({playlist_page: index, can_close: !Boolean(index)})}>
                        <Tab label="Curated" />
                        <Tab label="Liked Songs" />
                    </Tabs>
                    {/* <SwipeableViews className="swipeable-view" index={this.state.playlist_page} onChangeIndex={(index : number) => {
                        console.log(!Boolean(index));
                        this.setState({playlist_page: index, can_close: !Boolean(index)});
                    }} onContextMenu={(e) => e.preventDefault()} hysteresis={0.2}>
                        <TabPanel index={0} className="curated">
                            {this.props.curated_queue.queue.map((mediaset_index : number, queue_index : number) => {
                                const media_item = this.props.media_player.media_item(queue_index);
                                if (media_item) {
                                    return <PlaylistItem
                                                playing={this.props.media_player.is_playing ? this.props.media_player.queue_index : false}
                                                onClick={() => this.playlist_click(queue_index)}
                                                item_index={mediaset_index} media_item={media_item}
                                                key={queue_index} onContextMenu={(e : any) => this.playlist_longpress(e, queue_index)}
                                            />
                                }
                                return <></>
                            })}
                        </TabPanel>
                        <TabPanel index={1} className="liked">
                            {this.props.liked_queue.queue.map((mediaset_index : number, queue_index : number) => {
                                const media_item = this.props.media_player.media_item(queue_index);
                                if (media_item) {
                                    return <PlaylistItem
                                                playing={this.props.media_player.is_playing ? this.props.media_player.queue_index : false}
                                                onClick={() => this.playlist_click(queue_index)}
                                                item_index={mediaset_index} media_item={media_item}
                                                key={queue_index} onContextMenu={(e : any) => this.playlist_longpress(e, queue_index)}
                                            />
                                }
                                return <></>
                            })}
                        </TabPanel>
                    </SwipeableViews> */}
                    
                    <PlaylistSearch
                        in={this.state.open_search_modal}
                        search_query={this.state.search_query}
                        className={`${this.state.searching ? 'loading' : ''}`}
                        onChange={(e) => this.setState({search_query: e.target.value, searching: false})}
                        onClick={this.props.submit_search}
                        onClose={this.toggle_search_modal}
                    />
                
                </div>
            </MuiSwipeableDrawer>
        );
    }
}