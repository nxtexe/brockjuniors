import React from 'react';
import DesktopNavbar from '../Components/DesktopNavbar';
import IconButton from '../Components/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import {toggle_dark_mode} from '../common/utils';
import localforage from 'localforage';
import '../css/Settings.css';
import {Navigation} from 'react-motion-router';

interface SettingsProps {
    navigation: Navigation;
}

interface SettingsState {
    darko_mode: boolean;
    push_notifs: boolean;
    email_notifs: boolean;
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {
    state = {
        darko_mode: true,
        push_notifs: false,
        email_notifs: false
    }

    componentDidMount() {
        let darko_mode = false;
        let push_notifs = false;

        localforage.getItem('push_notifications').then((_push_notifs) => {
            if (_push_notifs) {
                push_notifs = true;
            } else {
                push_notifs = false;
            }
            this.setState({push_notifs: push_notifs});
        }).catch(e => {
            this.setState({push_notifs: false});
        })
        localforage.getItem('theme').then((theme) => {
            if (theme) {
                darko_mode = (theme as string).includes('darko');
            } else {
                darko_mode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            this.setState({darko_mode: darko_mode});
        }).catch(e => {
            darko_mode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setState({darko_mode: darko_mode});
        });

        
        
    }
    on_back = () => {
        this.props.navigation.go_back();
    }
    toggle_theme = () => {
        this.setState({darko_mode: !this.state.darko_mode}, () => {
            toggle_dark_mode(this.state.darko_mode);
        });
    }
    toggle_push_notifs = () => {
        this.setState({push_notifs: !this.state.push_notifs}, () => {
            localforage.setItem('push_notifications', this.state.push_notifs);
        });
    }

    render() {
        return (
            <div className="settings">
                <DesktopNavbar onBack={this.on_back} title="Settings" />
                <div className="content">
                    <div className="screen-grid">
                        <div className="back-button">
                            <IconButton onClick={this.on_back}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </div>
                        <div className="page-title">
                            <p>Settings</p>
                        </div>
                        <div className="settings-section">
                            <p className="section-title">Appearance</p>
                            <div className="toggle">
                                <p className="caption">Darko Mode</p>
                                <Switch
                                    checked={this.state.darko_mode}
                                    color="primary"
                                    name="darko-mode"
                                    onChange={this.toggle_theme}
                                />
                            </div>
                            <Divider />
                            <p className="section-title">Notifications</p>
                            {/* <div className="toggle">
                                <p className="caption">Email Notifications</p>
                                <Switch
                                    checked={this.state.email_notifs}
                                    color="primary"
                                    name="email-notifications"
                                />
                            </div> */}
                            <div className="toggle">
                                <p className="caption">Push Notifications</p>
                                <Switch
                                    checked={this.state.push_notifs}
                                    color="primary"
                                    name="push-notifications"
                                    onChange={this.toggle_push_notifs}
                                />
                            </div>
                        </div>
                        <div className="app-version">
                            <p>BROCKJUNIORS</p>
                            <p className='caption'>v2022.{process.env.REACT_APP_VERSION}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}