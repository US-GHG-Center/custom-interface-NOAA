import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DataFrequency, measurementLegend } from '../../constants';

import "./index.css";
import { Menu } from '@mui/material';

export function FrequencyDropdown({ selectedValue, setSelectedValue, style }) {
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <Box id="dropdown" sx={{ minWidth: 120, maxWidth: 240 }} style={style}>
      <FormControl fullWidth>
        <Select
          value={selectedValue}
          onChange={handleChange}
          displayEmpty
          disablePortal
          inputProps={{ 'aria-label': 'Without label' }}
          MenuProps={{
            anchorOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
        >
          <MenuItem key={"all"} value={"all"}>
            All Measurements
          </MenuItem>
          {Object.values(DataFrequency).map((frequency) => (
            <MenuItem key={frequency} value={frequency}>
              {measurementLegend[frequency].text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
