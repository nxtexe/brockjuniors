import React from 'react';
import DesktopNavbar from '../Components/DesktopNavbar';
import '../css/Home.css';
import Button from '../Components/Button';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import ClothesCarousel from '../Components/ClothesCarousel';
import IconButton from '../Components/IconButton';
import AppBar from '../Components/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
import MobileDrawer from '../Components/MobileDrawer';
import ClearIcon from '@material-ui/icons/Clear';
import MobileRhythm from './Rhythm';
import MailingModal from '../Components/MailingModal';

interface HomeProps {
    history : any;
}

interface HomeState {
    open_drawer : boolean;
    open_rhythm : boolean;
    open_mailing_modal : boolean;
}
export default class Home extends React.Component<HomeProps, HomeState> {
    private tickers : JSX.Element[] = [];
    constructor(props : HomeProps) {
        super(props);

        for (let i = 0; i < 24; i++) {
            this.tickers.push(
                <div key={i} className="wrap" style={{bottom: `${(i / 24) * 100}%`}}>
                    <div className="ticker" style={{animationDelay: `${Math.random() * 10}s`}}>
                        <div className="ticker-block">
                            <p>
                            BROCK JUNIORS
                            </p>
                            <p>
                            BROCK JUNIORS
                            </p>
                            <p>
                            BROCK JUNIORS
                            </p>
                            <p>
                            BROCK JUNIORS
                            </p>
                            <p>
                            BROCK JUNIORS
                            </p>
                        </div>
                    </div>
                </div>
            );                            
        }

    }
    state = {
        open_drawer: false,
        open_rhythm: false,
        open_mailing_modal: false
    }

    componentDidMount() {
        window.addEventListener('rhythm-close', () => {
            this.setState({open_rhythm: false});
        }, true);
    }

    toggle_rhythm = () => {
        this.setState({open_rhythm: !this.state.open_rhythm}, () => {
            if (this.state.open_rhythm) {
                MobileRhythm.open();
            } else {
                MobileRhythm.close();
            }
        });
    }
    render() {
        return (
            <div className="home">
                <DesktopNavbar adornments={[
                    <Button onClick={() => this.props.history.push('/about')} disableRipple>About</Button>,
                    <Button onClick={() => this.props.history.push('/settings')} disableRipple>Settings</Button>,
                    <Button onClick={this.toggle_rhythm} variant="contained" endIcon={<MusicNoteIcon />}>Music</Button>
                ]} />
                <AppBar adornments={[
                    <IconButton onClick={() => this.setState({open_drawer: !this.state.open_drawer})}>
                        {this.state.open_drawer ? <ClearIcon /> : <MenuIcon />}
                    </IconButton>
                ]} />
                <MobileDrawer open={this.state.open_drawer} onClose={() => this.setState({open_drawer: false})}/>
                <div className="content">
                    <div className="screen-grid">
                        <div className="title-wrap">
                            <div>
                                <h1>BROCK JUNIORS</h1>
                                <h2>BROCK JUNIORS</h2>
                            </div>
                        </div>
                        <div className="subtitle-wrap">
                            <div>
                                <h2>Coming Soon</h2>
                                <p className="sub2">Coming Soon</p>
                            </div>
                        </div>
                        <div className="clothes-carousel">
                            <ClothesCarousel autoplay={!this.state.open_rhythm} />
                        </div>
                        <div className="mailing-list">
                            <Button onClick={() => this.setState({open_mailing_modal: true})}>Join our mailing list</Button>
                        </div>
                    </div>
                    <div className={`tickers ${this.state.open_rhythm ? 'paused' : ''}`}>
                        {this.tickers}
                    </div>
                </div>
                <IconButton className="music" onClick={this.toggle_rhythm}>
                    <MusicNoteIcon />
                </IconButton>
                <MailingModal open={this.state.open_mailing_modal} onClose={() => this.setState({open_mailing_modal: false})} />
            </div>
        );
    }
}