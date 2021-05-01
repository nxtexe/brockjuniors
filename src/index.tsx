import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

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

const body : HTMLBodyElement = document.getElementsByTagName('body')[0] as HTMLBodyElement;
body.className= 'darko-mode';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
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