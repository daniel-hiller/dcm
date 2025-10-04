import { useState, useEffect } from 'react';
import { MasterPasswordDialog } from './components/Auth/MasterPasswordDialog';
import { DisclaimerDialog } from './components/Auth/DisclaimerDialog';
import { UpdateNotification } from './components/UpdateNotification';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ConnectionList } from './components/ConnectionList/ConnectionList';
import { ConnectionInfo } from './components/ConnectionDetail/ConnectionInfo';
import { useConnectionStore } from './store/connectionStore';

function App() {
  const { isAuthenticated, setData, setMasterPassword } = useConnectionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Check if user has accepted disclaimer
    const disclaimerAccepted = localStorage.getItem('dcm_disclaimer_accepted');
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
  };

  const handleAuthenticated = async (password: string) => {
    setIsLoading(true);
    try {
      // Load data from backend
      const result = await window.electronAPI.loadConnections(password);
      
      if (result.success && result.data) {
        setData(result.data);
        setMasterPassword(password);
      } else {
        // First time user - create empty data
        setMasterPassword(password);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  if (showDisclaimer) {
    return <DisclaimerDialog onAccept={handleDisclaimerAccept} />;
  }

  if (!isAuthenticated) {
    return <MasterPasswordDialog onAuthenticated={handleAuthenticated} />;
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading connections...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex">
      <Sidebar />
      <ConnectionList />
      <ConnectionInfo />
      <UpdateNotification />
    </div>
  );
}

export default App;
