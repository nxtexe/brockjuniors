import { createMuiTheme } from '@material-ui/core/styles';

const dark_theme = createMuiTheme({
    palette: {
        primary: {
            main: '#292929',
            light: '#8E8E8E',
            dark: '#000000'
        },
        secondary: {
            light: '#FFFFFF',
            main: '#333333',
            dark: '#8E8E8E'
        },
        error: {
            light: '#F03A64',
            main: '#F50038',
            dark: '#88001F',
        },
        warning: {
            light: '#F1B448',
            main: '#F5A20F',
            dark: '#B97A0C'
        },
        info: {
            light: '#B573ED',
            main: '#8602F5',
            dark: '#681BA8',
        },
        success: {
            light: '#33F58F',
            main: '#42B478',
            dark: '#1BA85E'
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#8E8E8E'
        },
        background: {
            paper: '#292929',
            default: '#292929'
        }
    }
});

const light_theme = createMuiTheme({
    palette: {
        primary: {
            light: '#FFFFFF',
            main: '#D8D8D8',
            dark: '#8E8E8E'
        },
        secondary: {
            light: '#8E8E8E',
            main: '#292929',
            dark: '#000000'
        },
        error: {
            light: '#F03A64',
            main: '#F50038',
            dark: '#88001F',
        },
        warning: {
            light: '#F1B448',
            main: '#F5A20F',
            dark: '#B97A0C'
        },
        info: {
            light: '#B573ED',
            main: '#8602F5',
            dark: '#681BA8',
        },
        success: {
            light: '#33F58F',
            main: '#42B478',
            dark: '#1BA85E'
        },
        text: {
            primary: '#000000',
            secondary: '#8E8E8E'
        },
        background: {
            paper: '#FFFFFF',
            default: '#FFFFFF'
        }
    }
});

export {light_theme, dark_theme};