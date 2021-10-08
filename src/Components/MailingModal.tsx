import React from 'react';
import Modal, { ModalProps } from '@mui/material/Modal';
import TextField from '../Components/TextField';
import Button from '../Components/Button';
import Slide from '@mui/material/Slide';
import ClearIcon from '@mui/icons-material/Clear';
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
            this.setState({loading: true}, async () => {
                try {
                    const response = await axios.post('/api/mailing', {
                        email: this.state.email
                    });
    
                    if (response.status === 200) {
                        this.setState({loading: false, email: ''});
                        if (this.props.onClose) this.props.onClose(e, "backdropClick");
                        Alert.alert(
                            "✨Thank You✨",
                            "You've been added to our mailing list! You'll be the first to receive updates as they happen.",
                        );
                    }
                    this.setState({loading: false});
                } catch (e : any) {
                    this.setState({loading: false, email: ''});
                    if (this.props.onClose) this.props.onClose(e, "backdropClick");
                    Alert.alert(
                        "You're Already Updated!",
                        "Your email is already on our mailing list. Is this a mistake?",
                        [
                            {
                                text: "Yes",
                                title: "Yes",
                                style: "Ok",
                                onClick: () => {
                                    axios.post('/api/mailing/remove', {
                                        data: [{email: this.state.email}]
                                    })
                                    .then(() => {
                                        Alert.alert(
                                            "You're All Set!",
                                            "Your email has been removed from our mailing list! We hope you'll join us again soon. 👋🏾"
                                        )
                                    })
                                    .catch(() => {});
                                }
                            },
                            {
                                text: "No",
                                title: "No",
                                style: "cancel",
                                onClick: () => {}
                            }
                        ]
                    )
                    this.setState({loading: false});
                }
                
            });
                   
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
                                    onEnter={this.handle_submit}
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