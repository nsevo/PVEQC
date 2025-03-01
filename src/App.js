import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import TemplateCreator from './pages/TemplateCreator';
import FirewallRules from './pages/FirewallRules';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/template" replace />} />
          <Route path="/template" element={<TemplateCreator />} />
          <Route path="/firewall" element={<FirewallRules />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
