import React from 'react';
import {closest, iOS} from '../../common/utils';
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
    private raf_id: number = 0;
    private observer = new IntersectionObserver(this.observe.bind(this), {
        rootMargin: '-50px 0px -20% 0px',
        threshold: .5
    });
    private intersecting_map: {[key:number]: HTMLElement} = {};
    private current_scroll: number = 0;
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
    
    async componentDidMount() {
        LyricsView.keys = Object.keys(this.props.lyrics).map((key) => parseFloat(key));
        LyricsView.values = Object.values(this.props.lyrics);

        if (iOS()) {
            await import("scroll-behavior-polyfill");
        }
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
                this.setState({loading: true}, () => {
                    window.setTimeout(() => {
                        this.setState({loading: false});
                    }, 100);
                })
            }
        }
    }

    observe(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        if (this.props.playing && !this.props.scrubbing) {
            entries.map((entry: IntersectionObserverEntry, index: number) => {
                if (entry.isIntersecting) {
                    this.intersecting_map[index] = (entry.target as HTMLElement);
                } else {
                    (entry.target as HTMLElement).style.transform = '';
                    delete this.intersecting_map[index];
                }
                return entry;
            });
        }
    }

    // animated_scroll() {
    //     if (this.ref && !this.props.scrubbing && this.props.playing) {
    //         const ease = 0.075;
    //         const target = this.ref.scrollTop;
    //         const travel_distance = target - this.current_scroll;
    //         const delta = Math.abs(travel_distance) < 0.1 ? 0 : travel_distance * ease;
    //         if (delta) {
    //             this.current_scroll += delta;
    //             this.current_scroll = Math.floor(this.current_scroll);
    //             this.raf_id = window.requestAnimationFrame(this.animated_scroll.bind(this));
    //         } else {
    //             this.current_scroll = target;
    //             window.cancelAnimationFrame(this.raf_id);

    //         }

    //         this.ref.style.transform = `translateY(${-delta}px)`;
    //     }
    // }

    get_scroll_percentage() {
        if (this.ref) {
            return (this.ref.scrollTop / (this.ref.scrollHeight - this.ref.clientHeight)) * 100;
        }
    }

    set_scroll_percentage(percentage: number) {
        if (this.ref) {
            const scroll_top = (percentage / 100) * (this.ref.scrollHeight - this.ref.clientHeight);

            this.ref.style.transform = '';
            this.ref.scrollTop = scroll_top;
            this.current_scroll = scroll_top;
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
                <div className="intersection-root"></div>
                <div className='lyrics-content' ref={(c) => this.ref = c} style={iOS() ? {
                    scrollPaddingTop: '150px',
                    paddingTop: '100px',
                    paddingBottom: '70vh',
                    scrollPaddingBottom: '70vh',
                    scrollBehavior: this.props.scrubbing ? 'unset' : 'smooth',
                } : undefined}>
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
                                        this.observer.observe(ref);
                                        if (this.closest_index === index && this.state.should_scroll && !this.props.scrubbing) {
                                            ref.scrollIntoView({
                                                behavior: 'smooth',
                                                block: iOS() ? 'center' : 'start'
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