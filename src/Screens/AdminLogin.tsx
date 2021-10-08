import React from 'react';
import TextField from '../Components/TextField';
import Button from '../Components/Button';
import {ReactComponent as BrockSvg} from '../assets/bjr.svg';
import '../css/Dashboard.css';
import axios from 'axios';

interface AdminLoginProps {
    history : any;
    login : Function;
}

interface AdminLoginState {
    username : string;
    password : string;
}

export default class AdminLogin extends React.Component<AdminLoginProps, AdminLoginState> {
    state = {
        username: '',
        password: ''
    }
    render() {
        return (
            <div className="admin-login">
                <div id="brock-img">
                    <BrockSvg />
                </div>
                <div className="login-form">
                    <h2>Admin Login</h2>
                    <TextField
                        onChange={(e) => {
                            this.setState({username: e.target.value});
                        }}
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
                        placeholder="Password"
                        value={this.state.password}
                        autoComplete="off"
                        id="password"
                        variant="flat"
                    />
                    <Button onClick={async () => {
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
                    }} id="submit" variant="flat">Login</Button>
                </div>
            </div>
        );
    }
}