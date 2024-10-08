import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { styled } from '@mui/system';
import stockData from '../data/all_stocks.json';
import axios from 'axios';

// Styled components
const TickerWrapper = styled('div')({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    padding: '10px 0',
});

const Ticker = styled('div')({
    display: 'inline-block',
    animation: 'ticker linear infinite',
    '@keyframes ticker': {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-50%)' },
    },
    fontSize: '1.2rem',
    whiteSpace: 'nowrap',
});

const TickerItem = styled(Box)({
    display: 'inline-block',
    marginRight: '2rem',
});

export default function Test() {
    const [dateIndex, setDateIndex] = useState(0);
    const [date, setDate] = useState('');
    const [tickerItems, setTickerItems] = useState([]);
    const [previousTickerItems, setPreviousTickerItems] = useState([]);

    const operatingTimes = [
        { day: 1, start: '09:30', end: '16:00' }, // Monday
        { day: 2, start: '09:30', end: '16:00' }, // Tuesday
        { day: 3, start: '09:30', end: '16:00' }, // Wednesday
        { day: 4, start: '09:30', end: '16:00' }, // Thursday
        { day: 5, start: '09:30', end: '16:00' }, // Friday
    ];

    useEffect(() => {
        const dates = Object.keys(stockData).reverse();
        if (dates.length > 0) {
            const updateStockData = () => {
                const currentIndex = dateIndex % dates.length;
                const currentDate = dates[currentIndex];
                setDate(currentDate);

                const items = Object.entries(stockData[currentDate]).map(([symbol, { close_price, volume }]) => ({
                    symbol, close_price, volume
                }));

                setPreviousTickerItems(tickerItems);
                setTickerItems(items);

                const now = new Date();
                const currentDay = now.getDay();
                const currentTime = now.toTimeString().slice(0, 5);
                const isOperating = operatingTimes.some(time => 
                    time.day === currentDay && currentTime >= time.start && currentTime <= time.end
                );

                if (isOperating) {
                    const stockUpdates = calculateChange(items, previousTickerItems).flatMap(item => [
                        Math.round(item.priceChange),
                        Math.round(item.volumeChange)
                    ]);

                    axios.post('http://localhost:8080/update_stock_data', stockUpdates)
                        .then(response => {
                            console.log('Stock data update sent:', response.data);
                        })
                        .catch(error => {
                            console.error('Error sending stock data update:', error);
                        });
                } else {
                    axios.post('http://localhost:8080/go_home')
                        .then(response => {
                            console.log('Go home command sent:', response.data);
                        })
                        .catch(error => {
                            console.error('Error sending go home command:', error);
                        });
                }
            };

            updateStockData(); // Initial call to set the first date's data

            const interval = setInterval(() => {
                setDateIndex(prevIndex => prevIndex + 1); // Increment the dateIndex
            }, 10000); // Update every 10 seconds

            return () => clearInterval(interval); // Cleanup interval on component unmount
        }
    }, [dateIndex]);

    const calculateChange = (current, previous) => {
        if (!previous || !current) return [];
        const currentMap = new Map(current.map(item => [item.symbol, item]));
        const previousMap = new Map(previous.map(item => [item.symbol, item]));

        return current.map(item => {
            const prevItem = previousMap.get(item.symbol);
            const priceChange = prevItem ? ((item.close_price - prevItem.close_price) / prevItem.close_price) * 100 : 0;
            const volumeChange = prevItem ? ((item.volume - prevItem.volume) / prevItem.volume) * 100 : 0;
            return { ...item, priceChange, volumeChange };
        });
    };

    const tickerSections = calculateChange(tickerItems, previousTickerItems);
    const splitItems = (items, numSplits) => {
        const itemsPerSplit = Math.ceil(items.length / numSplits);
        return Array.from({ length: numSplits }, (_, i) =>
            items.slice(i * itemsPerSplit, (i + 1) * itemsPerSplit)
        );
    };

    const tickerSplitSections = splitItems(tickerSections, 3);
    const animationDuration = `${tickerItems.length * 2}s`; // Adjust this value to match the scrolling speed

    return (
        <Container maxWidth={false} disableGutters>
            <Box sx={{ textAlign: 'center', my: 4 }} className="custom-font">
                <Typography variant="h4" gutterBottom>
                    Real-Time Market Data
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Date: {date}
                </Typography>
            </Box>
            {tickerSplitSections.map((items, idx) => (
                <TickerWrapper key={idx}>
                    <Ticker style={{ animationDuration }}>
                        {items.concat(items).map((item, index) => ( // Duplicate items for seamless scrolling
                            <TickerItem key={index}>
                                <Typography variant="h1" display="inline" sx={{ fontWeight: 'bold' }}>
                                    {item.symbol}:
                                </Typography>
                                <Typography variant="h1" display="inline" sx={{ color: item.priceChange >= 0 ? 'green' : 'red', mx: 1 }}>
                                    ${item.close_price} ({item.priceChange >= 0 ? '+' : ''}{item.priceChange.toFixed(2)}%)
                                </Typography>
                                <Typography variant="h1" display="inline" sx={{ color: item.volumeChange >= 0 ? 'green' : 'red' }}>
                                    Vol: {item.volume} ({item.volumeChange >= 0 ? '+' : ''}{item.volumeChange.toFixed(2)}%)
                                </Typography>
                            </TickerItem>
                        ))}
                    </Ticker>
                </TickerWrapper>
            ))}
        </Container>
    );
}
