import { Typography } from '@mui/material';
import { greenhouseGases, measurementLegend } from '../../constants';
import './index.css';

export const Title = ({ title, frequency, ghg }) => {
  const getSubtitle = () => {
    let text = '';
    if (ghg && greenhouseGases[ghg]) {
      text += greenhouseGases[ghg].fullName;
    }
    if (frequency === 'all') {
      text += ' Concentration Measurements';
    } else if (frequency && measurementLegend[frequency]) {
      text += ` ${measurementLegend[frequency].text}`;
    }
    return text;
  };

  return (
    <div className='title-text'>
      <div className='title-header'>{title}</div>
      <div className='title-subheader'>{getSubtitle()}</div>
    </div>
  );
};
