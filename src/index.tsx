import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client';
import localforage from 'localforage';
import {toggle_dark_mode} from './common/utils';

if ('serviceWorker' in navigator) {
  //workbox
  navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`, {scope: '/'})
  .then(function(registration) {
    console.log("Workbox registration successful, scope is:", registration.scope);
  })
  .catch(function(err) {
    console.log("Workbox service worker registration failed, error:", err);
  });
}


localforage.getItem('theme')
.then((theme) => {
  if (theme) {
    toggle_dark_mode((theme as string).includes('darko'));
  } else {
    let darko_mode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggle_dark_mode(darko_mode);
  }
})
.catch(e => {
  let darko_mode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  toggle_dark_mode(darko_mode);
});

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


//ASCII art console surprise
console.log(`%c
                                  @@@/                                          
                              @@@    @@                                         
                            @@      @@                                          
                          @@@     @@       @@                                   
                         @@    @@.        @@   @@@@@                            
                        @@  @@            @   @@ /@&    @                       
                       @@@@              @@    @@@@@@@@@@                       
                      @@@ @@@,@@@       @@,    @@    @@*                        
                      @@@(     &@&     @@@          @@     @@                   
                     @@@       @@     @@@          @@     @@                    
                    @@@      (@@   @@@@@          @@    @@                      
                    @@     @@@ (@@@  @@/         @@@@@@*                        
                   @@@@@@@@@@@      @@@                                         
                          (@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,                    
                   @@@@@          @@.                           &@@@@@@*        
               @@@              &@@                                       %@@@@#
             @@               &@@                                               
           ,@@              @@@                                                 
           @@@          @@@@                                                    
             @@@@@@@@@@                                                         
`, 'background: #000000; color: #ffffff');