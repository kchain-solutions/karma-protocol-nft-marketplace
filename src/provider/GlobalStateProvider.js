import React, { useState } from 'react';
import GlobalStateContext from './GlobalState';

const GlobalStateProvider = ({ children }) => {
    const [globalState, setGlobalState] = useState({
        account: "",
        isConnected: false
    });

    return (
        <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export default GlobalStateProvider;