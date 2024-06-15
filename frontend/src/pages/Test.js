import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { styled } from '@mui/system';
import stockData from '../data/all_stocks.json';
import '../font/font.css'; 

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
  animation: 'ticker 120s linear infinite', // Slower animation speed
  '@keyframes ticker': {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(-100%)' },
  },
});

export default function Test() {
  const [date, setDate] = useState('');
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    const dates = Object.keys(stockData);
    if (dates.length > 0) {
      const latestDate = dates[0];
      setDate(latestDate);

      const items = [];
      for (const symbol in stockData[latestDate]) {
        const { close_price, volume } = stockData[latestDate][symbol];
        items.push({ symbol, close_price, volume });
      }
      setTickerItems(items);
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', my: 4 }} className="custom-font">
        <Typography variant="h4" gutterBottom>
          Real-Time Market Data
        </Typography>
        <Typography variant="h5" gutterBottom>
          Date: {date}
        </Typography>
      </Box>
      <TickerWrapper>
        <Ticker>
          {tickerItems.map((item, index) => (
            <Box key={index} sx={{ display: 'inline-block', mx: 2 }} className="custom-font">
              <Typography variant="body1" display="inline" sx={{ fontWeight: 'bold' }}>
                {item.symbol}: 
              </Typography>
              <Typography variant="body1" display="inline" sx={{ color: 'green', mx: 1 }}>
                ${item.close_price}
              </Typography>
              <Typography variant="body2" display="inline" sx={{ color: 'gray' }}>
                Vol: {item.volume}
              </Typography>
            </Box>
          ))}
        </Ticker>
      </TickerWrapper>
    </Container>
  );
}