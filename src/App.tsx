import React from 'react';
import './css/App.css';
import About from './Screens/About';
import Home from './Screens/Home';
import Settings from './Screens/Settings'
import {dark_theme} from './common/themes';
import { ThemeProvider } from '@material-ui/styles';
import GhostLayer from './Components/GhostLayer';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Rythym from './Screens/Rhythm';
import Alert from './Components/Alert';



function App() {
  
  return (
    <ThemeProvider theme={dark_theme}>
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
          </Switch>
        </Router>
    </ThemeProvider>
  );
}

export default App;
