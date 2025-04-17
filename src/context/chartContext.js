import { createContext, useContext, useRef, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import { options } from '../components/mainChart/options';
import { plugin } from '../components/mainChart/customPlugin';
import '../components/mainChart/config';

const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
  const chartContainer = useRef(null);
  const [chart, setChart] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Observer to wait until canvas is visible
  useEffect(() => {
    if (!chartContainer.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(chartContainer.current);

    return () => observer.disconnect();
  }, []);

  // Create the chart only when canvas is visible and mounted
  useEffect(() => {
    if (!isReady || chart || !chartContainer.current) return;

    // Wait until canvas is really ready
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!chartContainer.current) return;

        const dataset = {
          labels: [],
          datasets: [
            {
              label: [],
              data: [],
              showLine: false,
            }
          ]
        };

        const config = {
          type: 'line',
          data: dataset,
          options: options,
          plugins: [plugin],
        };

        const chart_instance = new Chart(chartContainer.current, config);
        setChart(chart_instance);

        return () => {
          chart_instance?.destroy();
        };
      }, 50);
    });
  }, [isReady, chart]);


  return (
    <ChartContext.Provider value={{ chart: chart }}>
      {children}
      <canvas ref={chartContainer} style={{ width: '100%', minHeight: '30%', position: 'absolute' }}></canvas>
    </ChartContext.Provider>
  );
};

export const useChart = () => useContext(ChartContext);
