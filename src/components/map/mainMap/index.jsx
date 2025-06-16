import { MapboxProvider } from '../../../context/mapContext';

export const MainMap = ({ children }) => {
  return (
    <MapboxProvider>
      {/* Other components that need access to the map */}
      {children}
    </MapboxProvider>
  );
};
