import React, {ChangeEvent} from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ListIcon from '@material-ui/icons/List';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import '../css/Rhythm.css';
import {MediaPlayer, MediaItem} from '../Rhythm';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import {iOS} from '../common/utils';

interface RhythmProps {

}

interface RhythmState {
    playing : boolean;
    search_query: string;
    show_cover : boolean;
    cover_art : string;
    volume : number;
    current_time: number;
    duration: number;
    name: string;
    scrub_pos : number;
}

export default class Rhythm extends React.Component<RhythmProps, RhythmState> {
    private cover_ref : HTMLImageElement | null = null;
    private audio_ref : HTMLAudioElement | null = null;
    private media_player : MediaPlayer | null = null;
    private current_time_timeout : number = 0;
    state = {
        playing: false,
        search_query: '',
        show_cover: false,
        cover_art: '',
        volume: iOS() ? 0 : 100,
        current_time: 0,
        duration: 0,
        name: '',
        scrub_pos: 0
    }
    async componentDidMount() {
        this.current_time_timeout = window.setInterval(() => {
            if (this.audio_ref && this.state.playing) {
                if (this.media_player && !Number.isNaN(this.media_player?.current_time)) {
                    const scrub_pos : number = (this.media_player?.current_time / this.state.duration) * 100;
                    this.setState({current_time: this.media_player?.current_time, scrub_pos: scrub_pos});
                }
                
            }
        }, 1000);
        try {
            if (this.audio_ref) {
                this.media_player = new MediaPlayer();
                this.media_player.on('pause', () => {
                    this.setState({playing: false});
                });
                this.media_player.on('play', () => {
                    this.setState({playing: true});
                });
                this.media_player.on('change', (media_item : MediaItem) => {
                    this.setState({show_cover: false, playing: true, cover_art: media_item.thumbnail.url, duration: media_item.duration, name: media_item.name});
                    this.cover_ref?.setAttribute('src', media_item.thumbnail.url);
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
                });
            }

            
        } catch (e) {
            console.log(e)
        }
        
    }

    componentWillUnmount() {
        this.media_player?._MediaPlayer();
        window.clearInterval(this.current_time_timeout);
        window.removeEventListener('blur', ()=>{});
    }

    handle_play = async () => {
        try {
            if (!this.state.playing) {
                this.media_player?.play();
                if (this.media_player?.is_playing) {
                    this.setState({playing: true});
                } else {
                    this.setState({playing: false});
                }
            } else {
                
                this.media_player?.pause();
                this.setState({playing: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({playing: false});
        }
    }

    async handle_add_queue() {
        this.audio_ref?.play();
        if (this.state.search_query.length) {
            
            const results = await this.media_player?.search(this.state.search_query);

            this.setState({search_query: '', playing: true});
            if (results) {
                let index : number = 0;
                this.media_player?.on('error', async () => {
                    index += 1;
                    if (index < results.length) {
                        // this.media_player?.pop();
                        try {
                            await this.media_player?.add_to_queue(results[index]);
                            if (this.media_player && !this.media_player?.is_playing) this.media_player?.play();
                        } catch (e) {
                            //
                        }
                        
                        
                    }
                });
                if (results.length) {
                    try {
                        await this.media_player?.add_to_queue(results[index]);
                        if (this.media_player && !this.media_player?.is_playing) this.media_player?.play();
                    } catch (e) {
                        //
                    }
                    
                }
            }
        }
    }

    handle_volume(event: ChangeEvent<{}>, volume: number | number[]) {
        if (this.audio_ref?.muted) {
            this.audio_ref.muted = false;
        }
        if (typeof volume !== "number") {
            this.media_player?.volume(volume[0] / 100);
            this.setState({volume: volume[0]});
        } else {
            this.media_player?.volume(volume / 100);
            this.setState({volume: volume});
        }
    }

    handle_scrub(event: ChangeEvent<{}>, scrub_pos: number | number[]) {
        if (this.media_player) {
            if (typeof scrub_pos !== "number") {
                const current_time : number = (scrub_pos[0] / 100) * this.state.duration; 
                this.media_player.current_time = current_time;

                this.setState({current_time: current_time});
            } else {
                const current_time : number = (scrub_pos / 100) * this.state.duration; 
                this.media_player.current_time = current_time;

                this.setState({current_time: current_time});
            }
        }
    }

    animate_scrub(event: ChangeEvent<{}>, scrub_pos: number | number[]) {
        if (typeof scrub_pos !== "number") {
            const current_time : number = (scrub_pos[0] / 100) * this.state.duration;
            this.setState({scrub_pos: scrub_pos[0], current_time: current_time});
        } else {
            const current_time : number = (scrub_pos / 100) * this.state.duration; 
            this.setState({scrub_pos: scrub_pos, current_time: current_time});
        }
    }

    render() {
        return (
            <div className="rhythm">
                <div className="content">
                    <div className="header">
                        <h2>Brock Juniors Rhythm</h2>
                    </div>
                    <audio loop={true} ref={c => this.audio_ref = c}>
                        <source type="video/mp4" />
                    </audio>
                    <div className="add-field">
                        <TextField color="primary" placeholder="Search..." value={this.state.search_query} variant="outlined" onChange={(e) => {
                            this.setState({search_query: e.target.value});
                        }} />
                        <Button
                            onTouchStart={!iOS() ? undefined : this.handle_add_queue.bind(this)}
                            onClick={iOS() ? undefined : this.handle_add_queue.bind(this)}
                        >
                            Add to Queue
                        </Button>
                    </div>
                    <div className="playlist">
                        <IconButton>
                            <ListIcon />
                        </IconButton>
                    </div>
                    <div className="cover-art">
                        <div id="background" style={{backgroundImage: this.state.show_cover ? `url('${this.state.cover_art}')` : "url('./brock-logo.png')"}}></div>
                        <img
                            style={this.state.show_cover ? undefined : {display: 'none'}}
                            ref={c => {
                                this.cover_ref = c;
                                this.cover_ref?.addEventListener('load', () => {
                                    if (!this.state.show_cover) {
                                        this.setState({show_cover: true});
                                    }
                                }, true);
                            }}
                            alt="cover art" />
                    </div>
                    <div className="song-info">
                        <Typography variant="h6" component="p">
                            {this.state.name}
                        </Typography>
                    </div>
                    <div className="play-pause-controls">
                        <IconButton onClick={() => this.media_player?.previous()}><SkipPreviousIcon /></IconButton>
                        <IconButton onClick={this.handle_play}>
                            {!this.state.playing ? <PlayArrowIcon /> : <PauseIcon />}
                        </IconButton>
                        <IconButton onClick={() => this.media_player?.next()}>
                            <SkipNextIcon />
                        </IconButton>
                    </div>
                    <div className="scrub-controls">
                        <Slider
                            value={this.state.scrub_pos}
                            onChange={this.animate_scrub.bind(this)}
                            onChangeCommitted={this.handle_scrub.bind(this)}
                            aria-labelledby="continuous-slider"
                        />
                        <div id="run-time">
                            <Typography variant="h6" component="p">
                                {moment.utc(this.state.current_time*1000).format('m:ss')}
                            </Typography>
                        </div>
                    </div>
                    <div className="volume-controls">
                        <Grid container spacing={2}>
                            <Grid item>
                            <VolumeDown />
                            </Grid>
                            <Grid item xs>
                            <Slider value={this.state.volume} onChange={this.handle_volume.bind(this)} aria-labelledby="continuous-slider" />
                            </Grid>
                            <Grid item>
                            <VolumeUp />
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}