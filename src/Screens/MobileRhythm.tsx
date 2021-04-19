import React from 'react';
import Slide from '@material-ui/core/Slide';
import AppBar from '../Components/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
import MobileDrawer from '../Components/MobileDrawer';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '../Components/IconButton';
import ChevronDownIcon from '@material-ui/icons/KeyboardArrowDown';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ShareIcon from '@material-ui/icons/Share';
import Slider from '@material-ui/core/Slider';
import RepeatIcon from '@material-ui/icons/Repeat';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import CoverArt from '../assets/album-art.jpg';
import '../css/Rhythm.css';

interface RhythmProps {

}

interface RhythmState {
    open : boolean;
    open_drawer : boolean;
}

export default class MobileRythym extends React.Component<RhythmProps, RhythmState> {
    state = {
        open: true,
        open_drawer: false
    }

    componentDidMount() {
        window.addEventListener('rhythm-open', () => {
            this.setState({open: true});
        }, true);
        window.addEventListener('rhythm-close', () => {
            this.setState({open: false});
        }, true);
    }

    componentWillUnmount() {
        window.removeEventListener('rhythm-open', ()=>{});
        window.removeEventListener('rhythm-close', ()=>{});
    }

    static open() {
        const event = new CustomEvent('rhythm-open');

        window.dispatchEvent(event);
    }

    static close() {
        const event = new CustomEvent('rhythm-close');

        window.dispatchEvent(event);
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
                        <div className="title">
                            <p>
                                BROCK JUNIORS
                            </p>
                        </div>
                        <div className="playlist">
                            <IconButton>
                                <PlaylistPlayIcon />
                            </IconButton>
                        </div>
                        <div className="cover-art">
                            <div style={{backgroundImage: `url(${CoverArt})`}}>
                            </div>
                        </div>
                        <div className="song-info">
                            <div className="title">
                                <h6>Element</h6>
                            </div>
                            <div className="channel">
                                <p className="caption">Kendrick Lamar</p>
                            </div>
                        </div>
                        <div className="like">
                            <IconButton>
                                <ThumbUpIcon />
                            </IconButton>
                        </div>
                        <div className="share">
                            <IconButton>
                                <ShareIcon />
                            </IconButton>
                        </div>
                        <div className="dislike">
                            <IconButton>
                                <ThumbDownIcon />
                            </IconButton>
                        </div>
                        <div className="current-time">
                            <p className="caption">0:00</p>
                        </div>
                        <div className="current-time-slider">
                            <Slider value={0} onChange={() => {}} />
                        </div>
                        <div className="duration">
                            <p className="caption">3:21</p>
                        </div>
                        <div className="repeat">
                            <IconButton>
                                <RepeatIcon />
                            </IconButton>
                        </div>
                        <div className="previous">
                            <IconButton disabled>
                                <SkipPreviousIcon />
                            </IconButton>
                        </div>
                        <div className="play">
                            <IconButton>
                                <PlayArrowIcon />
                            </IconButton>
                        </div>
                        <div className="next">
                            <IconButton>
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                        <div className="shuffle">
                            <IconButton>
                                <ShuffleIcon />
                            </IconButton>
                        </div>
                        <div className="volume-down">
                            <VolumeDownIcon />
                        </div>
                        <div className="volume-slider">
                            <Slider value={0} onChange={() => {}} />
                        </div>
                        <div className="volume-up">
                            <VolumeUpIcon />
                        </div>
                    </div>
                </div>
            </Slide>
        );
    }
}