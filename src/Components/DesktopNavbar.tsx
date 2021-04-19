import IconButton from './IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../css/Navbar.css';
import React from 'react';
import {ReactComponent as BJR} from '../assets/bjr.svg';

interface DesktopNavbarProps {
    title? : string;
    onBack? : React.MouseEventHandler<HTMLButtonElement>;
    adornments? : any[];
}

export default function DesktopNavbar(props : DesktopNavbarProps) {
    return (
        <div className="desktop-nav-wrap">
            <div className="desktop-nav screen-grid">
                {props.onBack ? 
                <IconButton className="navbar-back" disableRipple onClick={props.onBack}>
                    <ChevronLeftIcon />
                </IconButton>    
                : 
                <div className="nav-brand">
                    <BJR />
                </div>
                }


                <div className="page-title">
                    {props.title}
                </div>
                <div className="adornments">
                    {props.adornments?.map((adornment, index) => {
                        return <div key={index} className="adornment">{adornment}</div>
                    })}
                </div>
            </div>
        </div>
    );
}