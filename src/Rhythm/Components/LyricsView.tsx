import React from 'react';
import {closest} from '../../common/utils';
import '../../css/LyricsView.css';

interface LyricsViewProps {
    in: boolean;
    playing: boolean;
    current_time: number;
    lyrics: {
        [key:number]: string;
    }
}

interface LyricsViewState {
    current_time: number;
}

export default class LyricsView extends React.Component<LyricsViewProps, LyricsViewState> {
    private values: string[] = Object.values(this.props.lyrics);
    private keys: number[] = Object.keys(this.props.lyrics).map((key) => parseFloat(key));
    private added_keys: number[] = [];
    private ref: HTMLElement | null = null;
    private interval_id: number | null = null;
    state: LyricsViewState = {
        current_time: this.props.current_time
    }

    update_time() {
        if (this.props.playing) {
            if (this.props.current_time !== this.state.current_time) {
                this.setState({current_time: this.props.current_time});
            }
            return;
        }

        if (this.interval_id !== null) {
            window.clearInterval(this.interval_id);
            this.interval_id = null;
        }
    }
    
    componentWillReceiveProps(props: LyricsViewProps) {
        if (props.playing && this.interval_id === null) {
            this.interval_id = window.setInterval(this.update_time.bind(this), 1000);
        } 
    }
    
    render() {
        return (
            <div className='lyrics-viewer' style={{opacity: this.props.in ? '1' : '0'}}>
                <div className='lyrics-content' ref={(c) => this.ref = c}>
                {
                    this.values.map((lyric, index) => {
                        let offset = this.keys[index] - this.state.current_time;
                        offset *= index;
                        return (
                            <h3 style={{transform: `translateY(${Math.floor(offset) + 50}px)`}} className="lyric" key={index}>{lyric}</h3>
                        );
                    })
                }
                </div>
            </div>
        );
    }
}
// export default function LyricsView(props: LyricsViewProps) {
//     const keys = Object.keys(props.lyrics);
//     const values = Object.values(props.lyrics);
//     return (
//         <div className="lyrics-viewer" style={{opacity: props.in ? '1' : '0'}}>
//             <div className="lyrics-content">
//             {
//                 values.map((lyric, index) => {
//                     const offset = parseFloat(keys[index]) - props.current_time;
//                     if (Math.abs(offset) < 30) {
//                         return <h3 style={{transform: `translateY(${Math.floor(offset) + 50}px)`}} className="lyric" key={index}>{lyric}</h3>
//                     } else {
//                         return <></>
//                     }
//                 })
//             }
//             </div>
//         </div>
//     );
// }