import React from 'react';
import ReactCardCarousel from "react-card-carousel";
import Blue from '../assets/the-blue-brockening.png';
import Brown from '../assets/the-brown-brockening.png';
import Grey from '../assets/the-grey-brockening.png';

export default class ClothesCarousel extends React.Component {
  static get CONTAINER_STYLE() {
    return {
      position: "relative",
      height: "100%",
      width: "100%",
      display: "flex",
      flex: 1,
      justifyContent: "center",
      alignItems: "middle"
    };
  }

  static get CARD_STYLE() {
    return {
      height: "minmax(90vw, 300px)",
      width: "minmax(90vw, 300px)",
    };
  }

  render() {
    return (
      <div style={ClothesCarousel.CONTAINER_STYLE}>
        <ReactCardCarousel autoplay={true} autoplay_speed={2500}>
          <div style={ClothesCarousel.CARD_STYLE}>
            <img style={{height: 'auto', width: '100%'}} src={Blue} alt="blue" />
          </div>
          <div style={ClothesCarousel.CARD_STYLE}>
            <img style={{height: 'auto', width: '100%'}} src={Brown} alt="brown" />
          </div>
          <div style={ClothesCarousel.CARD_STYLE}>
            <img style={{height: 'auto', width: '100%'}} src={Grey} alt="grey" />
          </div>
        </ReactCardCarousel>
      </div>
    );
  }
}