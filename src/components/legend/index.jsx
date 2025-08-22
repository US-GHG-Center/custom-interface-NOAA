import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import './index.css';

const getMarkerSVG = (color, strokeColor = '#000000') => {
  return (
    <svg fill={color} width="30px" height="30px" viewBox="-51.2 -51.2 614.40 614.40" xmlns="http://www.w3.org/2000/svg">
      <g stroke={strokeColor} strokeWidth="20.24" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"
        />
      </g>
    </svg>
  );
};

export const Legend = ({ legendData }) => {
  return (
    <Box className="legend-container">
      <Typography variant="h6" className="legend-title" sx={{
        fontWeight: 'bold',
        marginBottom: '4px',
        fontSize: '16px'
      }}
      >
        Legend
      </Typography>
      <Divider className="legend-divider" sx={{ marginBottom: '10px' }} />
      {legendData.map((item, index) => (
        <Box key={index} className="legend-item">
          <Box className="legend-marker">
            {getMarkerSVG(item.color)}
          </Box>
          <Typography variant="body2" className="legend-text" sx={{ fontSize: '14px' }}>
            {item.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
