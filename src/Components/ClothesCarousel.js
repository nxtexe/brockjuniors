// import React from 'react';
// import ReactCardCarousel from "react-card-carousel";
// import Blue from '../assets/images/carousel-1.png';
// import Brown from '../assets/images/carousel-2.png';
// import Grey from '../assets/images/carousel-3.png';

// export default class ClothesCarousel extends React.Component {
//   static get CONTAINER_STYLE() {
//     return {
//       position: "relative",
//       height: "100%",
//       width: "100%",
//       display: "flex",
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "middle"
//     };
//   }

//   static get CARD_STYLE() {
//     return {
//       height: "minmax(90vw, 300px)",
//       width: "minmax(90vw, 300px)",
//     };
//   }

//   render() {
//     return (
//       <div style={ClothesCarousel.CONTAINER_STYLE}>
//         <ReactCardCarousel autoplay={this.props.autoplay ? true : false} autoplay_speed={2500}>
//           <div style={ClothesCarousel.CARD_STYLE}>
//             <img style={{height: 'auto', width: '100%'}} src={Blue} alt="blue" />
//           </div>
//           <div style={ClothesCarousel.CARD_STYLE}>
//             <img style={{height: 'auto', width: '100%'}} src={Brown} alt="brown" />
//           </div>
//           <div style={ClothesCarousel.CARD_STYLE}>
//             <img style={{height: 'auto', width: '100%'}} src={Grey} alt="grey" />
//           </div>
//         </ReactCardCarousel>
//       </div>
//     );
//   }
// }