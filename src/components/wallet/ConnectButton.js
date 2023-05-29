import React, { useEffect, useState, useContext } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import GlobalStateContext from '../../provider/GlobalState';
import { ethers } from "ethers";
import { Button } from '@mui/material';



const ConnectButton = () => {
    const [account, setAccount] = useState(null);
    const [metamaskProvider, setMetamaskProvider] = useState(null);
    const [isConnected, setConnection] = useState(false);
    const [ethersProvider, setEthersProvider] = useState(null);
    const { globalState, setGlobalState } = useContext(GlobalStateContext);

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
            console.log('ConnectButton.js Please connect to MetaMask.');
        } else {
            setMetamaskProvider(await detectEthereumProvider());
            console.log("ConnectButton.js Account connected ", accounts);
            setAccount(accounts[0]);
            if (ethersProvider && isConnected) {
                setGlobalState({ ...globalState, account: accounts[0], ethersProvider, isConnected });
            }

        }
    };

    useEffect(() => {
        let provider = null;
        const init = async () => {
            provider = await detectEthereumProvider();
            if (provider) {
                try {
                    provider.on('accountsChanged', handleAccountsChanged);
                } catch (error) {
                    console.error("Connectbutton.js init: ", error);
                }
            } else {
                console.log('ConnectButton.js Please install MetaMask!');
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (metamaskProvider) {
            setEthersProvider(new ethers.BrowserProvider(metamaskProvider));
        }
        else
            setEthersProvider(null);

    }, [metamaskProvider]);

    useEffect(() => {
        if (ethersProvider) {
            console.log("ConnectButton.js ethersProvider", ethersProvider);
            ethersProvider.getSigner().then(signer => {
                console.log("ConnectBotton.js signer", signer);
                setGlobalState({ ...globalState, account: signer.address, ethersProvider });
                setAccount(signer.address);
            });
        }
    }, [ethersProvider]);

    useEffect(() => {
        console.log("ConnectBotton.js account changed", account);
    }, [account]);

    useEffect(() => {
        setGlobalState({ ...globalState, isConnected });
    }, [isConnected]);

    //Update global state when account change
    const connectWallet = async () => {
        if (!isConnected) {
            detectEthereumProvider().then((provider) => {
                console.log('ConnectButton.js metamask provider');
                if (provider) {
                    setMetamaskProvider(provider);
                }
                else
                    console.log('ConnectButton.js Please install MetaMask!');
            }).catch((error) => {
                console.error("Metamask connection error: ", error);
            });
        } else {
            setAccount(null);
            setMetamaskProvider(null);
        }
        setConnection(!isConnected);
    };


    return (
        <Button variant="contained" onClick={connectWallet}>
            {isConnected ? `Disconnect: ${account}` : 'Connect to MetaMask'}
        </Button>
    );
};

export default ConnectButton;
