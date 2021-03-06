import React from 'react';
import TextField from '../../Components/TextField';
import Button from '../../Components/Button';
import IconButton from '../../Components/IconButton';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Slide from '@mui/material/Slide';
import Modal from '@mui/material/Modal';

interface PlaylistSearchProps {
    search_query : string;
    onChange : React.ChangeEventHandler<HTMLTextAreaElement>;
    className : string;
    onClick : React.MouseEventHandler<HTMLButtonElement>;
    onClose? : React.MouseEventHandler<HTMLButtonElement>;
    in? : boolean;
}
export default class PlaylistSearch extends React.Component<PlaylistSearchProps, {}> {
    private text_field : HTMLInputElement | null = null;

    componentDidMount() {
        const text_field = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
        this.text_field = text_field;
    }
    componentDidUpdate(prev_props : PlaylistSearchProps) {
        if (prev_props.in && this.text_field) {
            this.text_field.focus();
        }
    }
    render() {
        return (
            <Modal className="mobile search-modal" open={this.props.in || false} onClose={this.props.onClose}>
                <Slide direction="up" in={this.props.in}>
                    <div className="search-modal-content">
                        <div className="top-notch"></div>
                        <IconButton className="close" onClick={this.props.onClose}>
                            <ChevronDownIcon />
                        </IconButton>
                        <div className="input-group">
                            <TextField
                                variant="flat"
                                autoFocus
                                placeholder="Search..."
                                type="search"
                                autoComplete="false"
                                autoCapitalize="false"
                                value={this.props.search_query}
                                onChange={this.props.onChange}
                                onEnter={(e) => {
                                    this.props.onClick(e as any);
                                    if (this.text_field) this.text_field.blur();
                                }}
                            />
                            <Button
                                className={this.props.className}
                                onClick={this.props.onClick}
                                variant="flat"
                            >
                                    Search
                            </Button>
                        </div>
                    </div>
                </Slide>
            </Modal>
        );
    }
}