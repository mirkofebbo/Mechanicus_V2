import React, { useState, useEffect } from "react";

import { Container, Typography, Box, CircularProgress, Alert } from "@mui/material";

const REACT_APP_FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;

const symbols = [
    'GOOGL', 'AER', 'NVO', 'CERE', 'LBRDK',
    'AMZN', 'CRH', 'ARMK', 'BKNG', 'J',
    'UBER', 'AKTA', 'WRK', 'CBOE', 'EMXC',
    'PCG', 'ACN', 'DASH', 'DHI', 'NKE',
    'TECK', 'RUN', 'AZN', 'LQD', 'IBKR'
];

export default function MotorControl() {
    const [latestMessages, setLatestMessages] = useState({});
    const [previousPrices, setPreviousPrices] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const socket = new WebSocket(`wss://ws.finnhub.io?token=${REACT_APP_FINNHUB_API_KEY}`);

        socket.addEventListener('open', function () {
            console.log('Connection opened');
            symbols.forEach(symbol => {
                socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
            });
            setIsLoading(false);
            setError(null);
        });

        socket.addEventListener('message', function (event) {
            try {
                const data = JSON.parse(event.data);
                if (data && data.type === 'trade' && Array.isArray(data.data)) {
                    const newMessages = {};
                    const newPreviousPrices = { ...previousPrices };
                    data.data.forEach(trade => {
                        if (trade && typeof trade.p === 'number' && typeof trade.s === 'string' && typeof trade.t === 'number' && typeof trade.v === 'number') {
                            newPreviousPrices[trade.s] = latestMessages[trade.s] ? latestMessages[trade.s].p : trade.p;
                            newMessages[trade.s] = trade;
                        }
                    });
                    setLatestMessages(prevMessages => ({ ...prevMessages, ...newMessages }));
                    setPreviousPrices(newPreviousPrices);
                } else {
                    console.error('Invalid data format', data);
                }
            } catch (error) {
                console.error('Error parsing message', error);
                setError('Error parsing incoming data');
            }
        });

        socket.addEventListener('close', function () {
            console.log('Connection closed');
            handleSocketError();
        });

        socket.addEventListener('error', function (error) {
            console.error('WebSocket error: ', error);
            setError('WebSocket error');
            handleSocketError();
        });

        return () => {
            console.log('Component unmounting, closing WebSocket');
            socket.close();
        };
    }, [retryCount]);

    const handleSocketError = () => {
        if (retryCount < 5) {
            console.log(`Retrying WebSocket connection (${retryCount + 1}/5)`);
            setTimeout(() => {
                setRetryCount(retryCount + 1);
            }, 3000);
        } else {
            setError('Failed to connect to WebSocket after multiple attempts');
        }
    };

    const renderItemsInCircle = () => {
        const radius = 250;
        const centerX = 150;
        const centerY = 150;

        const items = Object.keys(latestMessages).map((symbol, index) => {
            const angle = (index / symbols.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const rotateAngle = (angle * 180 / Math.PI) + 0;

            return (
                <Box
                    key={symbol}
                    sx={{
                        position: 'absolute',
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: `translate(-50%, -50%) rotate(${rotateAngle}deg)`,
                        textAlign: 'left',
                        textJustify: 'left',
                    }}
                >
                    <Typography style={{
                        color: latestMessages[symbol].p > previousPrices[symbol] ? 'green' : 'red'
                    }}>
                        {`${latestMessages[symbol].s}:${latestMessages[symbol].p}`}
                    </Typography>

                    {/* <Typography>{`Volume: ${latestMessages[symbol].v}`}</Typography> */}
                    {/* <Typography>{`Time: ${new Date(latestMessages[symbol].t).toLocaleTimeString()}`}</Typography> */}
                </Box>
            );
        });

        return (
            <Box
                sx={{
                    position: 'relative',
                    width: '300px',
                    height: '300px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    border: '1px solid #ccc'
                }}
            >
                {items}
            </Box>
        );
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Real-Time Market Data
            </Typography>
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    {error && <Alert severity="error">{error}</Alert>}
                    {Object.keys(latestMessages).length > 0 ? (
                        renderItemsInCircle()
                    ) : (
                        <Typography>No data received yet.</Typography>
                    )}
                </>
            )}
        </Container>
    );
}