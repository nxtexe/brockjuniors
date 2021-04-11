import React from 'react';
import './css/App.css';
import Home from './Screens/Home';
import {dark_theme} from './common/themes';
import { ThemeProvider } from '@material-ui/styles';



function App() {
  return (
    <ThemeProvider theme={dark_theme}>
        <Home />
    </ThemeProvider>
  );
}

export default App;
