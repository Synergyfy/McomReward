
import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-primary">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Sales</h2>
          <p className="text-3xl font-bold">$56,789</p>
        </div>
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Activities</h2>
          <p className="text-3xl font-bold">582</p>
        </div>
      </div>
    </div>
  );
}
