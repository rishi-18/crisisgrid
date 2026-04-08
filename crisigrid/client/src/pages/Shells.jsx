import React from 'react';

export const DashboardPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Command Dashboard</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-600">Real-time situational awareness overview will go here.</p>
    </div>
  </div>
);

export const ResourcesPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Camp Inventories</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-600">Detailed list of food, water, medicine across all camps.</p>
    </div>
  </div>
);

export const VolunteersPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Volunteer Force</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-600">Personnel management and deployment tracking.</p>
    </div>
  </div>
);

export const AnalyticsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Intelligent Analytics</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-600">Supply-demand gap analysis and trend forecasting.</p>
    </div>
  </div>
);

export const AlertsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Emergency Alerts</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-600">Critical notifications regarding stock levels and camp capacity.</p>
    </div>
  </div>
);
