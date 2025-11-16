import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-orange-600"></div>
    </div>
  );
};

export default Loader;
