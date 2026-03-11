import React from 'react';
import { FaDownload } from 'react-icons/fa'; // Assuming react-icons is available

const ImportDataBtn = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/export/all-data`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_data.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50"
      title="Download All Data"
    >
      <FaDownload />
    </button>
  );
};

export default ImportDataBtn;