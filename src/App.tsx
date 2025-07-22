import { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NoaaInterfaceContainer } from './pages/noaaInterface';

import './App.css';

const BASE_PATH = process.env.PUBLIC_URL;
const defaultZoomLocation = [-98.771556, 32.967243];
const defaultZoomLevel = 4;
function App() {
  return (
    <Fragment>
      <BrowserRouter basename={BASE_PATH}>
        <Routes>
          <Route
            path='/'
            element={
              <NoaaInterfaceContainer
                defaultZoomLocation={defaultZoomLocation}
                defaultZoomLevel={defaultZoomLevel}
              />
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}
