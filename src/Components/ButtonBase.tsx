import React from 'react';
import {ButtonBase as Base} from '@material-ui/core';
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
}
export default function ButtonBase(props : ButtonProps) {
    return (
        <Base onClick={props.onClick} disabled={props.disabled || false} className={`button-base ${props.colour || 'primary'} ${props.variant || 'default'} ${props.className || ''}`}>
            {props.startIcon}
            <div className={props.startIcon || props.endIcon ? "children" : undefined}>{props.children}</div>
            {props.endIcon}
        </Base>
    );
}