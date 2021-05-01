import React from 'react';
import './css/App.css';
import About from './Screens/About';
import Home from './Screens/Home';
import {dark_theme} from './common/themes';
import { ThemeProvider } from '@material-ui/styles';
import GhostLayer from './Components/GhostLayer';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import MobileRythym from './Screens/MobileRhythm';
import Alert from './Components/Alert';

function App() {
  return (
    <ThemeProvider theme={dark_theme}>
        <Alert />
        <GhostLayer />
        <Router>
          <MobileRythym />
          <Switch>
            <Route exact path="/about" render={(props : any) => {
              return <About {...props} />
            }} />
            <Route exact path="/" render={(props:any) => {
              return <Home {...props} />
            }}>
            </Route>
          </Switch>
        </Router>
    </ThemeProvider>
  );
}

export default App;
