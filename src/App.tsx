import { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NoaaInterfaceContainer } from './pages/noaaInterface';

import './App.css';

const BASE_PATH = process.env.PUBLIC_URL;
const defaultZoomLocation = [0, 0];
const defaultZoomLevel = 2;
export function App() {
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
