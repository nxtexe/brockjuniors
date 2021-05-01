import React, {useState} from 'react';
import {ButtonBase as Base} from '@material-ui/core';
import {isMobile} from '../common/utils';
import '../css/Button.css';

enum Colours {
    primary,
    secondary
}

export type colours = keyof typeof Colours;

enum Variants {
    default,
    flat,
    contained,
}

export type variants = keyof typeof Variants;

export interface ButtonProps {
    children? : any;
    variant? : variants;
    colour? : colours;
    disabled? : boolean;
    className? : string;
    endIcon? : any;
    startIcon? : any;
    onClick? : React.MouseEventHandler<HTMLButtonElement>;
    disableRipple? : boolean;
    style?: React.CSSProperties | undefined;
    onContextMenu? : React.MouseEventHandler<HTMLButtonElement>;
    onLongPress? : React.TouchEventHandler<HTMLButtonElement>;
    delay? : number;
}
export default function ButtonBase(props : ButtonProps) {
    let timer_id : number;
    const [is_clickable, set_clickable] = useState(true);
    const start_timer = (e : any) => {
        if (props.onLongPress) {
            timer_id = window.setTimeout(() => {
                //only presses that last as long as delay will be considered long press. Else consider as click.
                set_clickable(false);
                
                if (props.onLongPress) {
                    props.onLongPress(e);
                }
            }, props.delay ? props.delay : 500);
        }
    };
    const end_timer = (e : any) => {
        if (props.onLongPress) {
            if (is_clickable && props.onClick && e.button === 0) props.onClick(e);

            setTimeout(() => {
                set_clickable(true);
            }, 500);
            clearTimeout(timer_id);
        }
    };
    return (
        <Base
            style={props.style}
            disableRipple={props.disableRipple}
            onClick={props.onClick}
            disabled={props.disabled || false}
            className={`button-base ${props.colour || 'primary'} ${props.variant || 'default'} ${props.className || ''}`}
            onTouchStart={start_timer}
            onTouchEnd={end_timer}
            onMouseDown={start_timer}
            onMouseUp={end_timer}
            onContextMenu={isMobile() ? undefined : props.onContextMenu}
        >
            {props.startIcon}
            <div className={props.startIcon || props.endIcon ? "children" : undefined}>{props.children}</div>
            {props.endIcon}
        </Base>
    );
}