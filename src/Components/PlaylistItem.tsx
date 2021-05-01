import React from 'react';
import {MediaItem} from '../Rhythm';
import ButtonBase from './ButtonBase';
import moment from 'moment';

interface PlaylistItemProps {
    media_item : MediaItem;
    onClick? : (media_item : MediaItem) => void;
    onLongPress? : React.TouchEventHandler<HTMLButtonElement>;
}
export default function PlaylistItem(props : PlaylistItemProps) {
    return (
        <ButtonBase
            onLongPress={props.onLongPress}
            delay={1500}
            onClick={() => {
                if (props.onClick) props.onClick(props.media_item);
            }} style={{padding: 0, width: '100%', justifyContent: 'flex-start'}}
        >
            <div className="playlist-item">
                <div className="cover-art">
                    <img src={props.media_item.thumbnail.url} alt="cover-art" />
                </div>
                <div className="song-info">
                    <div className="title">
                        <h6>{props.media_item.name}</h6>
                    </div>
                    <div className="channel">
                        <p className="caption">{props.media_item.author?.name}</p>
                    </div>
                    <div className="duration">
                        <small>{moment.utc(props.media_item.duration*1000).format('m:ss')}</small>
                    </div>
                </div>
                
            </div>
        </ButtonBase>
    );
}