import React from 'react';
import {isMobile, toggle_ticker} from '../../common/utils';
import {MediaItem} from '../';
import ButtonBase from '../../Components/ButtonBase';
import IconButton from '../../Components/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import moment from 'moment';
import { format_from_duration } from '../../common/utils';
import {SoundBars} from './';

interface PlaylistItemProps {
    media_item : MediaItem;
    item_index: number;
    onClick? : <T, U>(e: T)=> U | void;
    onContextMenu? : <T, U>(e: T)=> U | void;
    playing: boolean | number;
}
export default function PlaylistItem(props : PlaylistItemProps) {
    
    return (
        <div className="playlist-item-container">
            <ButtonBase
                onLongPress={isMobile() ? props.onContextMenu : undefined}
                onContextMenu={props.onContextMenu}
                delay={1000}
                onClick={(e) => {
                    if (props.onClick) {
                        props.onClick(e);
                    }
                }} style={{padding: 0, width: '100%', justifyContent: 'flex-start'}}
            >
                <div className="playlist-item">
                    {props.playing === props.item_index ? <SoundBars /> : undefined}
                    <div className="cover-art">
                        <img src={props.media_item.cover_art.url} alt="cover-art" />
                    </div>
                    <div className="song-info">
                        <div className="title">
                            <h6 ref={toggle_ticker}>{props.media_item.name}</h6>
                        </div>
                        <div className="channel">
                            <p ref={toggle_ticker} className="caption">{props.media_item.artiste}</p>
                        </div>
                        <div className="duration">
                            <small>{moment.utc(props.media_item.duration*1000).format(format_from_duration(props.media_item.duration))}</small>
                        </div>
                    </div>
                    
                </div>
            </ButtonBase>
            {
                isMobile()
                ?
                    <div className="more">
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            if (props.onContextMenu) props.onContextMenu(e);
                        }}>
                            <MoreVertIcon />
                        </IconButton>
                    </div>
                :
                    undefined
            }
        </div>
    );
}