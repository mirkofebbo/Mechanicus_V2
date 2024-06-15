import React from "react";
import { AppBar, Toolbar, Typography,} from "@mui/material";
import { NavLink } from "react-router-dom";
import theme from '../theme';

export default function Navbar() {

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h4" component="div"
                    sx={{ flexGrow: 0.98 }}>
                    MECHANICUS
                </Typography>
                <div style={{ display: 'flex', gap: '50px' }}>
                    {/* DEBUG PAGE */}
                    <NavLink to="/" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                        <Typography variant="h5"> Debug</Typography>
                    </NavLink>
                    {/* TEST PAGE */}
                    <NavLink to="/test" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                        <Typography variant="h5"> test</Typography>
                    </NavLink>
                </div>
            </Toolbar>
        </AppBar>
    );
}