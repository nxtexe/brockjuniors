import React from 'react';
import './css/App.css';
import About from './Screens/About';
import Home from './Screens/Home';
import AdminLogin from './Screens/AdminLogin';
import Settings from './Screens/Settings'
import GhostLayer from './Components/GhostLayer';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Rythym from './Screens/Rhythm';
import Alert from './Components/Alert';
import AdminDashboard from './Screens/AdminDashboard';
import {ReactComponent as BrockSvg} from './assets/bjr.svg';
import axios from 'axios';

interface AppProps {
}

interface AppState {
  admin_login : boolean;
  loading : boolean;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props : AppProps) {
    super(props);
  }
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
      this.setState({admin_login: false, loading: true});
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
          <GhostLayer />
          <Router>
            <Rythym />
            <Switch>
              <Route exact path="/about" render={(props : any) => {
                return <About {...props} />
              }} />
              <Route exact path="/" render={(props:any) => {
                return <Home {...props} />
              }} />
              <Route exact path="/settings" render={(props:any) => {
                return <Settings {...props} />
              }} />
              <Route exact path="/admin" render={(props:any) => {
                
                if (this.state.loading) {
                  return <div id="brock-img" className="admin-loading"><BrockSvg /></div>
                } else if (this.state.admin_login) {
                  return <AdminDashboard logout={this.admin_logout.bind(this)} {...props} /> 
                } else {
                  return <AdminLogin login={this.admin_login.bind(this)} {...props} />
                }
              }} />
            </Switch>
          </Router>
      </div>
    );
  }
}

export default App;
