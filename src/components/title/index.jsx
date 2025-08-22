import { Typography } from '@mui/material';
import { greenhouseGases, measurementLegend } from '../../constants';
import './index.css';

export const Title = ({ title, frequency, ghg }) => {
  return (
    <>
      <Typography
        variant='h6'
        component='div'
        className='title-text'
        sx={{
          fontWeight: 'bold',
        }}
      >
        {title}: {ghg && greenhouseGases[ghg].fullName} {frequency && frequency !== 'all' && `${measurementLegend[frequency].text}`}
      </Typography>
    </>
  );
};
