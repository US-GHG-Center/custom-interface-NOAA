import { MapboxProvider } from '../../../context/mapContext';

export const MainMap = ({ children,config }) => {
  return (
    <MapboxProvider config={config}>
      {/* Other components that need access to the map */}
      {children}
    </MapboxProvider>
  );
};
