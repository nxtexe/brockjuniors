import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import LaunchIcon from '@mui/icons-material/Launch';
import ShareIcon from '@mui/icons-material/Share';
import {Navigation, SharedElement} from 'react-motion-router';
import IconButton from '../Components/IconButton';
import {links, images, Names} from '../assets/AboutData';
import {share} from '../common/utils';


interface AboutModalProps {
    navigation: Navigation;
    route: {
        params: {
            name: Names;
        }
    }
}
export default function AboutModal(props: AboutModalProps) {
    return(
        <div className="about-modal">
            <div className="modal screen-grid">
                <div className="clear">
                    <IconButton onClick={() => props.navigation.go_back()}>
                        <ClearIcon />
                    </IconButton>
                </div>
                <div className="launch">
                    <IconButton onClick={() => {
                        window.open(links[props.route.params.name]);
                    }}>
                        <LaunchIcon />
                    </IconButton>
                </div>
                {
                    "share" in navigator ?
                    <div className="share">
                        <IconButton onClick={() => {
                            share(props.route.params.name, "Who are we? We are BrockJuniors", `${window.location.origin}/about/modal?name=${props.route.params.name}`)
                        }}>
                            <ShareIcon />
                        </IconButton>
                    </div>
                    : undefined
                }
                <div className="image-view">
                    <SharedElement id={props.route.params.name} config={{
                        transform_origin: 'bottom bottom'
                    }}>
                        <img src={images[props.route.params.name]} alt={props.route.params.name} />
                    </SharedElement>
                </div>
            </div>
        </div>
    );
}