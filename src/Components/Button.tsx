import React from 'react';
import ButtonBase, {ButtonProps} from './ButtonBase';

export default function Button(props : ButtonProps) {
    return (
        <ButtonBase {...props}></ButtonBase>
    );
}