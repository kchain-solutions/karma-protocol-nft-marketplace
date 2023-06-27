import { useContext, useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Paper } from '@mui/material';
import GlobalStateContext from '../../provider/GlobalState'
import ConnectButton from '../wallet/ConnectButton';
import { isAuthorizedMember, isAuthorizedCreator } from '../../utils/contractInterface'
import { Link } from 'react-router-dom';
import { linkStyle } from '../../style/muiStyle';
import logo_image from './logo_bar.png'

const Header = () => {
    const [adminConsoleLink, setAdminConsoleLink] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [newCollectionLink, setNewCollectionLink] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const { globalState, setGlobalState } = useContext(GlobalStateContext);

    const updateValues = async () => {
        console.log("header.js: updateValues");
        const id = setInterval(getUserAuth, 10000);
        setIntervalId(id);
        console.log("Header.js setInterval ", intervalId);
    }

    const getUserAuth = async () => {
        console.log("header.js: ethersProvider: ", globalState.ethersProvider)
        if (globalState.ethersProvider) {
            try {
                const isAdmin = await isAuthorizedMember(globalState.ethersProvider);
                const isCreator = await isAuthorizedCreator(globalState.ethersProvider);
                setIsAdmin(isAdmin);
                setIsCreator(isCreator);
            } catch (error) {
                console.error('Headers.js getUserAuth: ', error);
            }
        }
        else {
            setIsAdmin(false);
            setIsCreator(false);
        }
    }

    useEffect(() => {
        console.log("header.js: isConnected: ", globalState.isConnected);
        if (globalState.isConnected) {
            getUserAuth();
        }
        else {
            if (intervalId) {
                console.log("Header.js clearInterval ", intervalId);
                setIsAdmin(false);
                setIsCreator(false);
                clearInterval(intervalId);
            }
        }
    }, [globalState.isConnected]);

    useEffect(() => {
        console.log("header.js: account: ", globalState.account);
        getUserAuth();
    }, [globalState.account]);

    useEffect(() => {
        setGlobalState({ ...globalState, isAdmin });
    }, [isAdmin]);

    useEffect(() => {
        setGlobalState({ ...globalState, isCreator });
    }, [isCreator]);

    useEffect(() => {
        console.log("header.js: provider: ", globalState.ethersProvider);
        if (globalState.ethersProvider)
            updateValues();
        return () => {
            clearInterval(intervalId);
        }
    }, [globalState.ethersProvider]);

    useEffect(() => {
        if (isAdmin) {
            setAdminConsoleLink(<>
                <Box sx={{ flexGrow: 1 }}> <Link to="/admin-console" style={linkStyle}> <Typography variant="h6" sx={{ color: 'primary.main' }} > Admin console </Typography></Link></Box>
            </>);
        } else {
            setAdminConsoleLink(null);
        }

        if (isCreator) {
            setNewCollectionLink(<>
                <Box sx={{ flexGrow: 1 }}> <Link to="/new-collection" style={linkStyle}> <Typography variant="h6" sx={{ color: 'primary.main' }} > Create collection </Typography></Link></Box>
            </>);
        }
        else {
            setNewCollectionLink(null);
        }
    }, [isAdmin, isCreator]);

    return (
        <>
            <Paper elevation={3} >
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Link to="/" style={{ ...linkStyle, flexGrow: 8 }}>
                                <Box display="flex" alignItems="center">
                                    <Box sx={{ width: 50, height: 50, marginRight: 2 }}>
                                        <img
                                            src={logo_image}
                                            alt="description_of_image"
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </Box>
                                    <Typography variant="h4" sx={{ color: 'white' }}> KARMA </Typography>
                                </Box>
                            </Link>
                            <Link to="/" style={{ ...linkStyle, flexGrow: 1 }}> <Typography variant="h6" sx={{ color: 'primary.main' }}> Collections </Typography> </Link>
                            {adminConsoleLink}
                            {newCollectionLink}
                            <ConnectButton />
                        </Toolbar>
                    </AppBar>
                </Box >
            </Paper >
        </>
    );
}

export default Header;