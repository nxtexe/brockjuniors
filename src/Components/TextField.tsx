import React from 'react';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';

enum Variants {
    default,
    flat,
    contained,
}

export type variants = keyof typeof Variants;

interface TextFieldProps extends InputBaseProps {
    variant : variants;
}
interface TextFieldState {

}
export default class TextField extends React.Component<TextFieldProps, TextFieldState> {
    render() {
        return (
            <InputBase
                {...this.props}
                className={`text-field ${this.props.error ? 'error' : ''} ${this.props.variant || 'default'} ${this.props.className || ''}`}
            />
        );
    }
}