import React from 'react';
import axios from 'axios';
import {User} from '../models/user';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface AdminDashboardProps {

}

interface AdminDashboardState {
    mailing_list : User[];
}


const columns : GridColDef[] = [
    {
        field: 'id',
        headerName: "ID",
        width: 300
    },
    {
        field: 'email',
        headerName: "Email",
        width: 400
    }
];

export default class AdminDashboard extends React.Component<AdminDashboardProps, AdminDashboardState> {
    state = {
        mailing_list: [
        ]
    }
    async componentDidMount() {
        try {
            const response = await axios.get<User[]>('/api/mailing');

            this.setState({mailing_list: response.data});
        } catch (e) {

        }
    }
    render() {
        return (
            <div className="admin-dashboard">
                <div className="screen-grid">
                    <div className="page-title">
                        <h2>Mailing List</h2>
                    </div>
                    <div className="data-grid">
                        <DataGrid
                            rows={this.state.mailing_list}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            checkboxSelection
                        />
                    </div>
                </div>
            </div>
        );
    }
}