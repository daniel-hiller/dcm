import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerDialogProps {
  onAccept: () => void;
}

export const DisclaimerDialog: React.FC<DisclaimerDialogProps> = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem('dcm_disclaimer_accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border-2 border-yellow-600 max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-4 p-6 border-b border-yellow-600">
          <div className="bg-yellow-600 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Important Security Notice</h2>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4 text-gray-300">
            <p className="text-lg font-semibold text-yellow-400">
              Please read this notice carefully:
            </p>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="font-bold text-white mb-2">🔒 Encryption & Master Password</h3>
              <p>
                DCM uses AES-256 encryption to protect your connection data and passwords. 
                All sensitive data is encrypted with your master password.
              </p>
            </div>

            <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border-2 border-red-600">
              <h3 className="font-bold text-red-400 mb-2">⚠️ IMPORTANT: Password Loss</h3>
              <p className="mb-2">
                <strong>If you forget your master password, data recovery is IMPOSSIBLE!</strong>
              </p>
              <p>
                There is no backdoor, no "forgot password" link, and no way to decrypt 
                the database without the correct master password.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="font-bold text-white mb-2">💡 Recommendations</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Choose a strong master password that you can remember</li>
                <li>Write down your password in a secure location</li>
                <li>Consider using a password manager</li>
                <li>Create regular backups of your database file</li>
              </ul>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="font-bold text-white mb-2">📁 Data Storage</h3>
              <p>
                Your database is stored locally on your computer. You have full 
                control over the storage location and can backup or move the file.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-white font-medium text-sm">
              I have read and understood the security notice. I understand that 
              my data will be irretrievably lost if I lose my master password.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              accepted
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            I Understand and Continue
          </button>
        </div>
      </div>
    </div>
  );
};
