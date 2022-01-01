import TxhjImg from "./images/about-txhj.jpg";
import NxteImg from "./images/about-nxte.jpg";
import NicoImg from './images/about-nicorude.jpg';
import BrockImg from './images/about-bjr.jpg';

enum NamesEnum {
    nxte,
    txhj,
    brockjuniors,
    nicorude
};

export type Names = keyof typeof NamesEnum;

export const links = {
    nxte: 'https://www.instagram.com/nxte.py',
    txhj: 'https://www.instagram.com/montxhj',
    brockjuniors: 'https://www.instagram.com/brockjuniors/',
    nicorude: 'https://www.instagram.com/nicorude',
};
export const images = {
    nxte: NxteImg,
    txhj: TxhjImg,
    brockjuniors: BrockImg,
    nicorude: NicoImg
};