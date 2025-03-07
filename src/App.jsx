import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import TemplateCreator from './pages/TemplateCreator';
import FirewallRules from './pages/FirewallRules.jsx';
import CloneTemplate from './pages/CloneTemplate';
import BatchTemplateCreator from './pages/BatchTemplateCreator';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* 根路径重定向到模板生成器 */}
          <Route path="/" element={<Navigate to="/template" replace />} />
          <Route path="/template" element={<TemplateCreator />} />
          <Route path="/batch-template" element={<BatchTemplateCreator />} />
          <Route path="/firewall" element={<FirewallRules />} />
          <Route path="/clone-template" element={<CloneTemplate />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 