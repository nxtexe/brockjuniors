import React from 'react';
import './css/App.css';
import About from './Screens/About';
import {dark_theme} from './common/themes';
import { ThemeProvider } from '@material-ui/styles';
import GhostLayer from './Components/GhostLayer';


function App() {
  return (
    <ThemeProvider theme={dark_theme}>
        <About />
        <GhostLayer />
    </ThemeProvider>
  );
}

export default App;
