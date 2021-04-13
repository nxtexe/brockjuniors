import IconButton from './IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../css/Navbar.css';
import React from 'react';

interface DesktopNavbarProps {
    title? : string;
    onBack : React.MouseEventHandler<HTMLButtonElement>;
}

export default function DesktopNavbar(props : DesktopNavbarProps) {
    return (
        <div className="desktop-nav screen-grid">
            {props.onBack ? 
            <IconButton disableRipple onClick={props.onBack}>
                <ChevronLeftIcon />
            </IconButton>    
            : undefined
            }


            <div className="page-title">
                {props.title}
            </div>
        </div>
    );
}