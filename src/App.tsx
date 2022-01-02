import React from 'react';
import './css/App.css';
import About from './Screens/About';
import AboutModal from './Screens/AboutModal';
import Home from './Screens/Home';
import AdminLogin from './Screens/AdminLogin';
import Settings from './Screens/Settings'
import {
  Router,
  Stack
} from "react-motion-router";
import Rythym from './Screens/Rhythm';
import Alert from './Components/Alert';
import AdminDashboard from './Screens/AdminDashboard';
import {ReactComponent as BrockSvg} from './assets/icons/bjr.svg';
import axios from 'axios';

interface AppProps {
}

interface AppState {
  admin_login : boolean;
  loading : boolean;
}

class App extends React.Component<AppProps, AppState> {
  state = {
    admin_login: false,
    loading: true
  }

  componentDidMount() {
    axios.get('/api/admin')
    .then(() => {
      
      this.setState({admin_login: true, loading: false});
    })
    .catch(() => {
      this.setState({admin_login: false, loading: false});
    });
  }

  admin_login() {
    this.setState({admin_login: true});
  }
  admin_logout() {
    this.setState({admin_login: false});
  }
  render() {
    return (
      <div>
          <Alert />
          <Rythym />
          <Router config={{
            default_route: '/',
            animation: {
              type: "fade",
              duration: 200
            }
          }}>
            <Stack.Screen path="/about/modal" component={AboutModal} default_params={{name: "brockjuniors"}} />
            <Stack.Screen path="/about" component={About} />
            <Stack.Screen path="/" component={Home} />
            <Stack.Screen path="/settings" component={Settings} />
            {
              this.state.loading ?
              (
                <div id="brock-img" className="admin-loading"><BrockSvg /></div>
              )
              :
              (
                <Stack.Screen path="/admin" component={
                  this.state.admin_login ?
                (
                  AdminDashboard                   
                )
                :
                (
                  AdminLogin
                )
                } default_params={!this.state.admin_login ? {login: this.admin_login}:undefined} />
                
              )
            }
          </Router>
      </div>
    );
  }
}

export default App;
