import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  ClipboardIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const CloudInit = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Cloud-Init Generator | PVEQC';
  }, []);

  const generateYAMLConfig = () => {
    let yaml = '#cloud-config\n\n';
    
    yaml += '# Root Login Configuration\n';
    yaml += 'ssh_pwauth: true\n';
    yaml += 'disable_root: false\n\n';
    yaml += 'runcmd:\n';
    yaml += '  - #!/bin/bash\n';
    yaml += '  - sudo sed -i \'s/^#\\?PermitRootLogin.*/PermitRootLogin yes/g\' /etc/ssh/sshd_config\n';
    yaml += '  - sudo sed -i \'s/^#\\?PasswordAuthentication.*/PasswordAuthentication yes/g\' /etc/ssh/sshd_config\n';
    yaml += '  - sudo service sshd restart\n';

    return yaml;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateYAMLConfig());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Cloud-Init Configuration Generator</h1>
              <span className="px-2 py-1 text-xs font-medium text-[#ec7211] bg-orange-50 border border-orange-100">
                VM Initialization
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Configuration Guide</h3>
            <p className="mt-2 text-sm text-blue-600">
              This configuration will enable root SSH login for the system.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4">
          <div className="bg-[#232f3e] border border-[#1a1f29]">
            <div className="px-4 py-3 border-b border-[#2d3952]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CloudIcon className="w-5 h-5 text-gray-400 mr-2.5" />
                  <h4 className="text-sm font-bold text-white">Configuration Preview</h4>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 border
                    ${copied
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-[#ec7211] text-white hover:bg-[#ec7211]/90 border-[#ec7211]'
                    }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Copy Config</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="p-4 font-mono text-sm bg-[#1a202c] text-gray-200 border border-gray-700/50 overflow-x-auto whitespace-pre">
                {generateYAMLConfig()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudInit; 