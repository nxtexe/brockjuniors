import React, {useState} from 'react';
import '../css/About.css';
import TxhjImg from "../assets/night-life-tahj.jpg";
import NxteImg from "../assets/nxte.jpg";
import NicoImg from '../assets/nicostrudel.jpg';
import BrockImg from '../assets/profile-picture.jpg';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '../Components/IconButton';
import Modal from '@material-ui/core/Modal';
import ClearIcon from '@material-ui/icons/Clear';
import LaunchIcon from '@material-ui/icons/Launch';
import ShareIcon from '@material-ui/icons/Share';
import DesktopNavbar from '../Components/DesktopNavbar';

enum Names {
    nxte,
    txhj,
    brockjuniors,
    nicorude
};

type names = keyof typeof Names;

interface AboutProps {
    history : any;
}
export default function About(props : AboutProps) {
    let image_view_ref : HTMLDivElement | null = null;

    const links = {
        nxte: 'https://www.instagram.com/p/CLniWw6H901/?utm_source=ig_web_copy_link',
        txhj: 'https://www.instagram.com/p/CL8UaU3HjFP/?utm_source=ig_web_copy_link',
        brockjuniors: 'https://www.instagram.com/brockjuniors/',
        nicorude: 'https://www.instagram.com/p/CMd-Mk2Hg-z/?utm_source=ig_web_copy_link',
    };
    const images = {
        nxte: NxteImg,
        txhj: TxhjImg,
        brockjuniors: BrockImg,
        nicorude: NicoImg
    };
    const [link, set_link] = useState('brockjuniors');
    const [show_modal, toggle_modal] = useState(false);

    function handle_click(e : React.MouseEvent<HTMLDivElement, MouseEvent>, name : names) {
        set_link(name);
        toggle_modal(true);
    }
    return (
        <div className="about">
            <DesktopNavbar onBack={() => {
                if (props.history.length) {
                    props.history.goBack();
                } else {
                    props.history.push('/');
                }
            }} title="About" />
            <div className="content">
                <div className="screen-grid">
                    <div className="back-button">
                        <IconButton>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <div className="page-title">
                        <p>About</p>
                    </div>
                    <div className="title">
                        <div className="typing">
                            <h3>Who are we?</h3>
                        </div>
                    </div>
                    <div className="subtitle">
                        <div className="typing">
                            <p>we are brockjuniors.</p>
                        </div>
                    </div>
                    <div className="photo-grid">
                        <div onClick={(e) => handle_click(e, "txhj")}>
                            <img src={TxhjImg} alt="txhj" />
                        </div>
                        <div onClick={(e) => handle_click(e, "nxte")}>
                            <img src={NxteImg} alt="nxte" />
                        </div>
                        <div onClick={(e) => handle_click(e, "brockjuniors")}>
                            <img src={BrockImg} alt="brockjuniors" />
                        </div>
                        <div onClick={(e) => handle_click(e, "nicorude")}>
                            <img src={NicoImg} alt="nicorude" />
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={show_modal}>
                <div className="modal screen-grid">
                    <div className="clear" onClick={() => toggle_modal(false)}>
                        <IconButton>
                            <ClearIcon />
                        </IconButton>
                    </div>
                    <div className="launch" onClick={() => {
                        window.open(links[link as names]);
                    }}>
                        <IconButton>
                            <LaunchIcon />
                        </IconButton>
                    </div>
                    <div className="share">
                        <IconButton>
                            <ShareIcon />
                        </IconButton>
                    </div>
                    <div className="image-view" ref={c => image_view_ref = c}>
                        <img src={images[link as names]} alt={link} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}