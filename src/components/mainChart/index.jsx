import { ChartProvider } from '../../context/chartContext';
import './index.css';

export const MainChart = ({ children }) => {
  return (
    <ChartProvider>
      <div className="chart-container">
        {/* Other components that need access to the chart */}
        {children}
      </div>
    </ChartProvider>
  );
};
