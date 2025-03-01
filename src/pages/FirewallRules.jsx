import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ClipboardIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const FirewallRules = () => {
  const defaultRules = [
    { port: '22', protocol: 'tcp', description: 'Allow SSH', enabled: true },
    { port: '8006', protocol: 'tcp', description: 'Allow PVE Web UI', enabled: true },
    { port: '443', protocol: 'tcp', description: 'Allow HTTPS (API)', enabled: true },
    { port: '80', protocol: 'tcp', description: 'Allow HTTP (Certificate Management)', enabled: true },
    { port: '5900:5999', protocol: 'tcp', description: 'Allow VNC Access', enabled: true },
    { port: '5404:5405', protocol: 'udp', description: 'Allow Proxmox Cluster Communication', enabled: true },
    { port: '3128', protocol: 'tcp', description: 'Allow Proxmox Proxy Port', enabled: true },
    { port: '60000', protocol: 'tcp', description: 'Allow Proxmox Remote Access', enabled: true }
  ];

  const [rules, setRules] = useState(defaultRules);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Firewall Rules | PVEQC';
  }, []);

  const generateFirewallConfig = () => {
    let config = '[RULES]\n';
    rules.forEach(rule => {
      if (rule.enabled) {
        config += `IN ACCEPT -p ${rule.protocol} --dport ${rule.port}\n`;
      }
    });
    return config;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateFirewallConfig());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const toggleRule = (index) => {
    const newRules = [...rules];
    newRules[index].enabled = !newRules[index].enabled;
    setRules(newRules);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Firewall Rules Generator</h1>
              <span className="px-2 py-1 text-xs font-medium text-[#ec7211] bg-orange-50 border border-orange-100">
                Cluster Wide
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Configuration File Location</h3>
            <p className="mt-1 text-sm text-blue-700 font-mono">/etc/pve/firewall/cluster.fw</p>
            <p className="mt-2 text-sm text-blue-600">
              After copying the configuration, paste it into this file to apply the firewall rules.
              The rules will be applied cluster-wide.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <div className="lg:w-[320px] flex-shrink-0">
          <div className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-medium text-gray-900">Firewall Rules</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {rules.map((rule, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(index)}
                        className="h-4 w-4 text-[#ec7211] focus:ring-[#ec7211] border-gray-300"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rule.description}</p>
                        <p className="text-xs text-gray-500">
                          Port: {rule.port} ({rule.protocol.toUpperCase()})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-medium text-gray-900">Rule Descriptions</h2>
              </div>
              <div className="p-4 space-y-2">
                {rules.filter(rule => rule.enabled).map((rule, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-500 font-mono whitespace-nowrap">Port {rule.port}:</span>
                    <span className="text-gray-700">{rule.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#232f3e] border border-[#1a1f29]">
              <div className="px-4 py-3 border-b border-[#2d3952]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-2.5" />
                    <h4 className="text-sm font-medium text-white">Firewall Configuration</h4>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 border
                      ${copied
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-[#ec7211] text-white hover:bg-[#ec7211]/90 border-[#ec7211]'
                      }`}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="w-4 h-4 mr-2" />
                        Copy Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="p-4 font-mono text-sm bg-[#1a202c] text-gray-200 border border-gray-700/50 overflow-x-auto whitespace-pre">
                  {generateFirewallConfig()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirewallRules; 