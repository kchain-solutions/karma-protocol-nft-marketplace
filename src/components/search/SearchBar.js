import { TextField, Typography, Box } from "@mui/material"
import { useEffect, useState } from "react";
import GlobalStateContext from '../../provider/GlobalState'
import { useContext } from 'react';

const SearchBar = ({ text, label }) => {

    const [inputValue, setInputValue] = useState("");
    const { globalState, setGlobalState } = useContext(GlobalStateContext);

    useEffect(() => {
        console.log("Input changed to: ", inputValue);
        setGlobalState({ ...globalState, stockSelected: inputValue });
    }, [inputValue]);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    }

    return (
        <Box>
            <TextField id="standard-basic" label="Standard" variant="standard" value={inputValue} onChange={handleChange} />
        </Box>
    );
}

export default SearchBar;