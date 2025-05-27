import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faRotateLeft, faCircleInfo, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "react-tooltip";
import { useState, useEffect } from 'react';
import { useChart } from '../../context/chartContext';

import './index.css';
import "react-tooltip/dist/react-tooltip.css";

const tooltipStyle = {
  backgroundColor: "rgba(255, 255, 255, 1)",
  borderRadius: "8px",
  color: "rgba(0, 0, 0, 0.8)",
  padding: "8px",
  fontSize: ".8rem",
  boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
};

export const ChartTitle = ({ children }) => {
  // Displays the title of the chart using the children prop
  // Uses the useChart hook to access the chart object
  const { chart } = useChart();

  useEffect(() => {
    if (!chart || !children) return;

    chart.config.options.plugins.title.text = children;
    chart.config.options.plugins.title.display = true;

    chart.update();

  }, [chart, children]);

  return null;
};


export const ChartInstruction = () => {
  // Displays instruction for interacting with the chart when the info icon is hovered
  const [showInstructions, setShowInstructions] = useState(false);
  return (
    <div id="chart-instructions-container">
      <FontAwesomeIcon icon={faCircleInfo} onMouseEnter={() => setShowInstructions(true)} onMouseLeave={() => setShowInstructions(false)} />
      {showInstructions && (
        <div id="chart-instructions">
          <p>1. Click and drag, scroll or pinch on the chart to zoom in.</p>
          <p>2. Hover over data points when zoomed in to see the values.</p>
          <p>3. Click on the rectangle boxes on the side to toggle chart.</p>
        </div>
      )}
    </div>
  );
};

export const ClearChart = ({ onDone }) => {
  const { chart } = useChart();

  useEffect(() => {
    if (chart) {
      chart.data.labels = [];
      chart.data.datasets = [];
      chart.update();
    }
    onDone();
  }, [chart, onDone]);

  return null;
};

export const ZoomResetTool = () => {
  // Resets the zoom level of the chart when the reset zoom icon is clicked
  // Uses the useChart hook to access the chart object
  const { chart } = useChart();

  const handleResetZoom = () => {
    if (!chart) return;
    chart.resetZoom();
  };

  return (
    <>
      <FontAwesomeIcon
        id="zoom-reset-button"
        icon={faRotateLeft}
        data-tooltip-id="close-chart-tooltip"
        data-tooltip-content="Reset Chart Zoom"
        onClick={handleResetZoom}
      />
      <Tooltip id="close-chart-tooltip" place="bottom" style={tooltipStyle} />
    </>
  );
};


export const CloseButton = ({ handleClose }) => (
  // Closes the chart when the close icon is clicked
  // Receives the handleClose function as a prop
  <>
    <FontAwesomeIcon
      id="chart-close-button"
      icon={faXmark}
      data-tooltip-id="close-chart-tooltip"
      data-tooltip-content="Close Chart"
      onClick={handleClose}
    />
    <Tooltip id="close-chart-tooltip" place="bottom" style={tooltipStyle} />
  </>
);


export const DataAccessTool = ({ dataAccessLink, tooltip }) => {
  return (
    <>
      <a
        id="data-access-link"
        href={dataAccessLink}
        target="_blank"
        rel="noreferrer"
        data-tooltip-id="data-access-tooltip"
        data-tooltip-content={tooltip}
        className='data-access-tool'
      >
        {tooltip} <FontAwesomeIcon icon={faExternalLink} />
      </a>
      <Tooltip id="data-access-tooltip" place="bottom" style={tooltipStyle} />
    </>
  );
};


export const ChartTools = ({ children }) => {
  // Displays the chart tools
  return (
    <div className="chart-tools-container">
      {children}
    </div>
  );
};


export const ChartToolsLeft = ({ children }) => {
  // Left align chart tools
  return (
    <div id="chart-tools-left">
      <div id="chart-controls">
        {children}
      </div>
    </div>
  );
};


export const ChartToolsRight = ({ children }) => {
  // Right align chart tools
  return (
    <div id="chart-tools-right">
      <div id="chart-controls">
        {children}
      </div>
    </div>
  );
};
