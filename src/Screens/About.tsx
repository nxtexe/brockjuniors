import React, {useState} from 'react';
import '../css/About.css';
import {links, images, Names} from '../assets/AboutData';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '../Components/IconButton';
import DesktopNavbar from '../Components/DesktopNavbar';
import {Navigation, SharedElement} from 'react-motion-router';

interface AboutProps {
    navigation: Navigation;
}
export default function About(props : AboutProps) {
    
    const [link, set_link] = useState('brockjuniors');
    const [show_modal, toggle_modal] = useState(false);

    function handle_click(e : React.MouseEvent<HTMLDivElement, MouseEvent>, name: Names) {
        props.navigation.navigate('/about/modal', {
            name: name
        });
        // set_link(name);
        // toggle_modal(true);
    }

    const on_back = () => {
        props.navigation.go_back();
    }
    return (
        <div className="about">
            <DesktopNavbar onBack={on_back} title="About" />
            <div className="content">
                <div className="screen-grid">
                    <div className="back-button">
                        <IconButton onClick={on_back}>
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
                        {
                            Object.keys(images).map((key: string, index: number) => {
                                return (
                                    <div onClick={(e) => handle_click(e, (key as Names))} key={index}>
                                        <SharedElement id={key}>
                                            <img src={images[(key as Names)]} alt={key} />
                                        </SharedElement>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>

            
        </div>
    );
}