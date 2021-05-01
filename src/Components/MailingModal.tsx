import React from 'react';
import Modal, { ModalProps } from '@material-ui/core/Modal';
import TextField from '../Components/TextField';
import Button from '../Components/Button';
import Slide from '@material-ui/core/Slide';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '../Components/IconButton';
import {ValidateEmail} from '../common/utils';
import Alert from './Alert';
import axios from 'axios';

interface MailingModalProps extends Omit<ModalProps, 'children'> {
}
interface MailingModalState {
    email : string;
    loading: boolean;
}
export default class MailingModal extends React.Component<MailingModalProps, MailingModalState> {
    state = {
        email: '',
        loading: false,
    }


    handle_submit = (e : any) => {
        if (!this.state.loading) {
            try {
                this.setState({loading: true}, async () => {
                    const response = await axios.post('/api/mailing', {
                        email: this.state.email
                    });

                    if (response.status === 200) {
                        this.setState({loading: false, email: ''});
                        if (this.props.onClose) this.props.onClose(e, "backdropClick");
                        Alert.alert(
                            "✨Thank You✨",
                            "You've been added to the our mailing list! You'll be the first to receive updates as they happen.",
                        );
                    }
                });
                
    
                
            } catch(e) {
                this.setState({loading: false});
            }
        }

         
    }
    render() {
        return ( 
            <Modal {...this.props}>
                <Slide direction="up" in={this.props.open}>
                    <div className="mailing-modal-content">
                        
                        <div className="close">
                            <IconButton onClick={(e) => {if (this.props.onClose) this.props.onClose(e, "backdropClick")}}>
                                <ClearIcon />
                            </IconButton>
                        </div>
                        <div className="col">
                            <div>
                                <div className="notch"></div>
                            </div>
                            <h6>Join Our Mailing List</h6>
                            <div className="input-group">
                                <TextField
                                    error={!ValidateEmail(this.state.email)}
                                    variant="flat"
                                    onChange={(e) => this.setState({email: e.target.value})}
                                    value={this.state.email}
                                    autoFocus
                                    placeholder='example@email.com'
                                />
                                <Button
                                    disabled={!ValidateEmail(this.state.email)}
                                    className={`submit ${this.state.loading ? 'loading' : ''}`}
                                    variant="flat"
                                    onClick={this.handle_submit}
                                >Submit</Button>
                            </div>
                            <small>Be the first to receive updates when our products become available.</small>
                        </div>
                    </div>
                </Slide>
            </Modal>
        );
    }
}