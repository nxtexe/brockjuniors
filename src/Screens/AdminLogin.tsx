import React from 'react';
import TextField from '../Components/TextField';
import Button from '../Components/Button';
import {ReactComponent as BrockSvg} from '../assets/bjr.svg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '../Components/IconButton';
import '../css/Dashboard.css';
import axios from 'axios';

interface AdminLoginProps {
    history : any;
    login : Function;
}

interface AdminLoginState {
    username : string;
    password : string;
    show_password : boolean;
}

export default class AdminLogin extends React.Component<AdminLoginProps, AdminLoginState> {
    private _isMounted = false;
 
    state = {
        username: '',
        password: '',
        show_password: false,
    }

    componentDidMount() {
        this._isMounted = true;
    }

    submit = async () => {
        if (this.state.username.length && this.state.password.length) {
            try {
                await axios.post('/api/login/admin', {username: this.state.username, password: this.state.password});
                
                this.props.login();
                
            } catch (e: any) {
                if (e.response && e.response.status === 401) {
                    alert("Password or username incorrect");
                } else {
                    alert("Network Error");
                    console.log(e);
                }
                
            }
        } else {
            alert('Enter a username & password');
        }
    }

    handleClickShowPassword = () => {
        const password = this.state.password;
        if (this._isMounted) {
            
            this.setState({...this.state, password: ''}, () => {
                this.setState({...this.state, show_password: !this.state.show_password}, () => {
                    setTimeout(() => this.setState({...this.state, password: password}), 5)
                });
            });
        
            
        }
        
    };
    render() {
        return (
            <div className="admin-login">
                <div id="brock-img">
                    <BrockSvg />
                </div>
                
                <div className="login-form">
                    <div id="title">
                        <h2>Admin Login</h2>
                    </div>
                    <TextField
                        onChange={(e) => {
                            this.setState({username: e.target.value});
                        }}
                        onEnter={this.submit}
                        value={this.state.username}
                        placeholder="Username"
                        autoComplete="off"
                        id="username"
                        variant="flat"
                    />
                    <TextField
                        onChange={(e) => {
                            this.setState({password: e.target.value});
                        }}
                        onEnter={this.submit}
                        placeholder="Password"
                        value={this.state.password}
                        autoComplete="off"
                        type={this.state.show_password ? "text" : "password"}
                        id="password"
                        variant="flat"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton 
                                    tabindex={5}
                                    aria-label="toggle password visibility"
                                    onClick={this.handleClickShowPassword}
                                    onMouseDown={(e : any) => e.preventDefault()}
                                >
                                    {this.state.show_password ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                        
                    />
                    <Button onClick={this.submit} id="submit" variant="flat">Login</Button>
                </div>
            </div>
        );
    }
}