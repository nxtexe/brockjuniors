import React from 'react';
import './css/App.css';
import About from './Screens/About';
import AboutModal from './Screens/AboutModal';
import Home from './Screens/Home';
import Settings from './Screens/Settings'
import {
  Router,
  Stack
} from "react-motion-router";
import Rhythm from './Screens/Rhythm';
import Alert from './Components/Alert';


class App extends React.Component {
  componentDidMount() {
    const splash_screen = document.querySelector('.splash-screen') as HTMLElement;
    if (splash_screen) {
      splash_screen.style.transition = '0.5s';
      splash_screen.ontransitionend = () => {
        document.body.removeChild(splash_screen);
      }
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          splash_screen.style.opacity = '0';
        });
      }, 500);
    }
  }
  render() {
    return (
      <>
          <Alert />
          {/* <Rhythm /> */}
          <Router config={{
            defaultRoute: '/',
            animation: {
              type: "fade",
              duration: 200
            }
          }}>
            <Stack.Screen path="/about/modal" component={AboutModal} defaultParams={{name: "brockjuniors"}} />
            <Stack.Screen path="/about" component={About} />
            <Stack.Screen path="/" component={Home} />
            <Stack.Screen path="/settings" component={Settings} />
          </Router>
      </>
    );
  }
}

export default App;
