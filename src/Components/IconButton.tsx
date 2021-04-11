import React from 'react';
import ButtonBase, {ButtonProps} from './ButtonBase';
import '../css/Button.css';

export default function IconButton(props : ButtonProps) {
    return (
        <ButtonBase {...props} className={`_icon-button ${props.className || ''}`}></ButtonBase>
    );
}