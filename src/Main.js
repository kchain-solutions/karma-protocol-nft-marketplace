import React, { useEffect, useContext, useState, useCallback } from 'react';
import GlobalStateContext from './provider/GlobalState';
import { Route, Routes } from 'react-router-dom';
import Collections from './routes/Collections';
import NewCollection from './routes/NewCollection';
import AdminConsole from './routes/AdminConsole';
import CollectionDetail from './routes/CollectionDetail';
import NftDetail from './routes/NftDetail';
import IpfsTokenUploader from './routes/IpfsTokenUploader';
import IpfsTokenUpdater from './routes/IpfsTokenUpdater.js';
import Invest from './routes/Invest';

import { Box, Typography } from '@mui/material';

const Main = () => {
    const { globalState } = useContext(GlobalStateContext);
    const [content, setContent] = useState(null);

    const loadContent = useCallback(() => {
        if (globalState.isConnected) {
            setContent(
                <>
                    <Routes>
                        <Route path="/" element={<Collections />} />
                        <Route path="/admin-console" element={<AdminConsole />} />
                        <Route path="/new-collection" element={<NewCollection />} />
                        <Route path="/collection-detail/:collectionAddress" element={<CollectionDetail />} />
                        <Route path="/nft-detail/:collectionAddress/:tokenId" element={<NftDetail />} />
                        <Route path="/ipfs-token-updater/:collectionAddr" element={<IpfsTokenUpdater />} />
                        <Route path="/ipfs-token-uploader/:collectionAddr" element={<IpfsTokenUploader />} />
                        <Route path="/invest" element={<Invest />} />
                    </Routes>
                </>
            );
        } else {
            setContent(
                <>
                    <Routes>
                        <Route path="/" element={<Collections />} />
                        <Route path="/nft-detail/:collectionAddress/:tokenId" element={<NftDetail />} />
                        <Route path="/ipfs-token-updater/:collectionAddr" element={<IpfsTokenUpdater />} />
                        <Route path="/ipfs-token-uploader/:collectionAddr" element={<IpfsTokenUploader />} />
                    </Routes>
                </>
            );
        }
    }, [globalState.isConnected]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    useEffect(() => {
        loadContent();
    }, [loadContent, globalState.isConnected]);

    return (
        <>
            <Box sx={{ minHeight: 650 }} >{content}</Box>
        </>
    );
};

export default Main;
