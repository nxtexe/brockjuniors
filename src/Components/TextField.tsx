import React from 'react';
import InputBase, { InputBaseProps } from '@mui/material/InputBase';

enum Variants {
    default,
    flat,
    contained,
}

export type variants = keyof typeof Variants;

interface TextFieldProps extends InputBaseProps {
    variant? : variants;
    onEnter? : React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}
interface TextFieldState {

}
export default class TextField extends React.Component<TextFieldProps, TextFieldState> {
    render() {
        return (
            <InputBase
                {...this.props}
                onKeyUp={(e) => {
                    if (e.keyCode === 13 && this.props.onEnter) {
                        e.preventDefault();
                        this.props.onEnter(e);
                    }
                }}
                className={`text-field ${this.props.error ? 'error' : ''} ${this.props.variant || 'default'} ${this.props.className || ''}`}
            />
        );
    }
}