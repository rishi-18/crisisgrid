import React from 'react';

const Placeholder = ({ name }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{name} Page</h1>
        <p className="text-gray-400 italic">This is a placeholder for the CrisisGrid {name} view.</p>
        <a href="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default Placeholder;
