import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import {ReactComponent as BJR} from '../assets/icons/bjr.svg';
import {Navigation} from 'react-motion-router';
import '../css/MobileDrawer.css';

interface MobileDrawerProps {
    open? : boolean;
    onClose? : React.ReactEventHandler<{}>;
    onOpen? : React.ReactEventHandler<{}>;
    navigation?: Navigation;
}
function MobileDrawer(props : MobileDrawerProps) {
    return (
        <div>
            <SwipeableDrawer
                className="drawer"
                anchor="right"
                open={props.open || false}
                onClose={(e) => {if (props.onClose) props.onClose(e)}}
                onOpen={(e) => {if (props.onOpen) props.onOpen(e)}}
                >
                    <div
                        role="presentation"
                        onClick={props.onClose}
                        onKeyDown={props.onClose}
                    >
                        <div className="brand">
                            <BJR />
                        </div>
                        <div className="content">
                            <Divider />
                            <List>
                                <ListItem button key="About" onClick={() => props.navigation?.navigate('/about')}>
                                    <ListItemText primary="About" />
                                </ListItem>
                                <ListItem button key="Settings" onClick={() => props.navigation?.navigate('/settings')}>
                                    <ListItemText primary="Settings" />
                                </ListItem>
                            </List>

                            
                        </div>
                        
                        
                    </div>
                    <div className="fine-print">
                        <small>&copy; BROCK JUNIORS</small>
                    </div>
            </SwipeableDrawer>
        </div>
    );
}

export default MobileDrawer;