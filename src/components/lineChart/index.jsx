import { useEffect } from 'react';
import { useChart } from '../../context/chartContext';

export const LineChart = ({
  data,
  labels,
  legend,
  labelX,
  labelY,
  color = "#ff6384",
  index = 0,
  separateY = false,
  separateX = false,
  showLine = false,
}) => {
  // data should be an array of vector points
  // labels should be an array of the vector labels
  const { chart } = useChart();

  useEffect(() => {
    if (!chart || !data || !labels) return;

    // first reset the zoom
    chart.resetZoom();
    chart.options.plugins.tooltip.enabled = true;

    const newDataset = {
      label: legend,
      data: data.map((value, i) => ({ x: new Date(labels[i]), y: value })),
      backgroundColor: color.replace(/[\d.]+\)$/g, '0.2)'),
      borderColor: color,
      showLine: showLine,
      xAxisID: separateX ? `x-${index}` : 'x',
      yAxisID: separateX ? `y-${index}` : 'y',
    };

    // Ensure datasets array exists
    if (!chart.data.datasets) {
      chart.data.datasets = [];
    }

    // Add dataset at the specified index
    chart.data.datasets[index] = newDataset;

    // Update the labels
    // chart.data.labels = labels;

    // update the axis labels
    chart.options.scales.y.display = separateY ? false : true;
    chart.options.scales.x.display = separateX ? false : true;

    // Ensure scales object exists
    if (!chart.options.scales) {
      chart.options.scales = {};
    }

    // Centralized x-axis scale configuration
    const xAxisConfig = {
      type: 'time',
      display: true,
      time: {
        tooltipFormat: 'dd MMM yyyy', // for tooltips
        unit: false, // let it auto-determine
      },
      grid: {
        display: false,
        drawOnChartArea: false,
      },
      ticks: {
        source: 'auto',
        autoSkip: true,
        maxTicksLimit: 10,
      },
      title: {
        text: labelX,
        display: !!labelX,
      },
      adapters: {
        date: {
          zone: 'UTC',
        },
      },
    };

    // Assign the x-axis configuration based on the separateX flag
    chart.options.scales[separateX ? `x-${index}` : 'x'] = xAxisConfig;

    const yAxisConfig = {
      display: true,
      grid: {
        display: true,
        drawOnChartArea: true,
      },
      title: {
        text: labelY,
        display: !!labelY,
      }
    };

    // Assign the x-axis configuration based on the separateX flag
    chart.options.scales[separateX ? `y-${index}` : 'y'] = yAxisConfig;


    // update the chart
    chart.update();

  }, [chart, data, labels, legend, labelX, labelY, color, index]);

  return null;
};
