import React from 'react';
import {closest} from '../../common/utils';
import '../../css/LyricsView.css';

interface LyricsViewProps {
    in: boolean;
    playing: boolean;
    current_time: number;
    progress: number;
    scrubbing: boolean;
    lyrics: {
        [key:number]: string;
    }
}

interface LyricsViewState {
    current_time: number;
    should_scroll: boolean;
    loading: boolean;
}

export default class LyricsView extends React.Component<LyricsViewProps, LyricsViewState> {
    private static values: string[] = [];
    private static keys: number[] = [];
    private ref: HTMLElement | null = null;
    private closest_index: number = 0;
    state: LyricsViewState = {
        current_time: this.props.current_time,
        should_scroll: false,
        loading: false
    }
    
    
    static getDerivedStateFromProps(props: LyricsViewProps, state: LyricsViewState) {
        if (props.in) {
            if (props.playing) {
                if (props.current_time !== state.current_time) {
                    if (LyricsView.keys.length) {
                        const closest_timestamp = closest(props.current_time, LyricsView.keys);
                        const time_difference = Math.abs(props.current_time - closest_timestamp);
                        if (state.current_time !== closest_timestamp && time_difference < 2) {
                            return {current_time: closest_timestamp, should_scroll: true};
                        }
                    }
                }
            } 
        }
        return null;
    }
    
    componentDidMount() {
        LyricsView.keys = Object.keys(this.props.lyrics).map((key) => parseFloat(key));
        LyricsView.values = Object.values(this.props.lyrics);
    }
    
    componentDidUpdate(prev_props: LyricsViewProps) {
        if (this.props.in) {
            if (this.props.scrubbing) {
                this.set_scroll_percentage(this.props.progress);
            }
            if (this.state.loading) {
                this.set_scroll_percentage(this.props.progress);
            }
            if (prev_props.lyrics !== this.props.lyrics) {
                LyricsView.keys = Object.keys(this.props.lyrics).map((key) => parseFloat(key));
                LyricsView.values = Object.values(this.props.lyrics);
                console.log("Update");
                this.setState({loading: true}, () => {
                    window.setTimeout(() => {
                        this.setState({loading: false});
                    }, 100);
                })
            }
        }
    }

    get_scroll_percentage() {
        if (this.ref) {
            return (this.ref.scrollTop / (this.ref.scrollHeight - this.ref.clientHeight)) * 100;
        }
    }

    set_scroll_percentage(percentage: number) {
        if (this.ref) {
            const scroll_top = (percentage / 100) * (this.ref.scrollHeight - this.ref.clientHeight);

            this.ref.scrollTop = scroll_top;
        }
    }

    lyric_classname(index: number) {
        if (this.props.scrubbing) {
            return '';
        }
        
        const index_difference = index - this.closest_index;
        if (index_difference < 0 && !this.props.scrubbing) {
            return 'behind';
        }

        switch(index_difference) {
            case 0:
                return 'current';

            case 1:
                return 'first';
            
            case 2:
                return 'second';
                
            case 3:
                return 'third';

            default:
                return '';
        }
    }
    
    render() {
        return (
            <div className='lyrics-viewer' style={{opacity: this.props.in ? '1' : '0'}}>
                <div className='lyrics-content' ref={(c) => this.ref = c}>
                {
                    this.state.loading ?
                    undefined
                    :
                    LyricsView.values.map((lyric, index) => {
                        if (LyricsView.keys[index] === this.state.current_time) {
                            this.closest_index = index;
                        }

                        
                        return (
                            <h3
                                ref={(ref) => {
                                    if (ref) {
                                        if (this.closest_index === index && this.state.should_scroll) {
                                            ref.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                            this.setState({should_scroll: false});
                                        }
                                    }
                                }}
                                className={`lyric ${this.props.scrubbing ? '' :'show'} ${this.lyric_classname(index)}`}
                                key={index}
                            >
                                    {lyric}
                            </h3>
                        );
                    })
                }
                </div>
            </div>
        );
    }
}