import '../css/About.css';
import TahjImg from "../assets/night-life-tahj.jpg";
import NxteImg from "../assets/nxte.jpg";
import NicoImg from '../assets/nicostrudel.jpg';
import BrockImg from '../assets/profile-picture.jpg';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '../Components/IconButton';
import GhostLayer from '../Components/GhostLayer';

export default function About() {
    return (
        <div className="about">
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
                        <div>
                            <img src={TahjImg} alt="txhj" />
                        </div>
                        <div>
                            <img src={NxteImg} alt="nxte" />
                        </div>
                        <div>
                            <img src={BrockImg} alt="brockjuniors" />
                        </div>
                        <div onClick={(e) => {
                            const bounding_client_rect = (e as any).target.parentNode.getBoundingClientRect();
                            const node = (e as any).target.parentNode.cloneNode(true);
                            const computed_style = window.getComputedStyle((e as any).target.parentNode);
                            
                            GhostLayer.start_handoff(node, computed_style, bounding_client_rect);
                        }}>
                            <img src={NicoImg} alt="nicorude" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}