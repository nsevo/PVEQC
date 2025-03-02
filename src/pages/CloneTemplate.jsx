import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  ClipboardIcon,
  CheckIcon,
  InformationCircleIcon,
  CpuChipIcon,
  CircleStackIcon,
  TrashIcon,
  CommandLineIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CloneTemplate = () => {
  const defaultConfig = {
    templateId: '9000',
    newTemplateName: 'vm-clone',
    diskSize: '20',
    memory: '1024',
    cpuCores: '1',
    cloneType: 'full'
  };

  const [config, setConfig] = useState(() => {
    const savedConfig = localStorage.getItem('cloneTemplateConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      return {
        ...defaultConfig,
        ...parsedConfig,
        templateId: parsedConfig.templateId || defaultConfig.templateId,
        newTemplateName: parsedConfig.newTemplateName || defaultConfig.newTemplateName,
        diskSize: parsedConfig.diskSize || defaultConfig.diskSize,
        memory: parsedConfig.memory || defaultConfig.memory,
        cpuCores: parsedConfig.cpuCores || defaultConfig.cpuCores
      };
    }
    return defaultConfig;
  });

  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Clone Template | PVEQC';
  }, []);

  useEffect(() => {
    localStorage.setItem('cloneTemplateConfig', JSON.stringify(config));
    validateForm();
  }, [config]);

  const validateForm = () => {
    const newErrors = {};
    
    if (config.templateId && (!/^\d+$/.test(config.templateId) || 
        parseInt(config.templateId) < 100 || parseInt(config.templateId) > 999999)) {
      newErrors.templateId = 'Template ID must be between 100 and 999999';
    }

    if (config.newTemplateName && !/^[a-zA-Z0-9-]+$/.test(config.newTemplateName)) {
      newErrors.newTemplateName = 'Template name can only contain letters, numbers, and hyphens';
    }

    if (config.diskSize && parseInt(config.diskSize) < 1) {
      newErrors.diskSize = 'Disk size must be greater than 0GB';
    }

    if (config.memory && parseInt(config.memory) < 512) {
      newErrors.memory = 'Memory must be at least 512MB';
    }

    if (config.cpuCores && (parseInt(config.cpuCores) < 1 || parseInt(config.cpuCores) > 128)) {
      newErrors.cpuCores = 'CPU cores must be between 1 and 128';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 特殊处理数字输入
    if (name === 'templateId') {
      if (value === '' || /^\d+$/.test(value)) {
        setConfig(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }

    // 处理其他数字输入
    if (['diskSize', 'memory', 'cpuCores'].includes(name)) {
      if (value === '' || /^\d*$/.test(value)) {
        setConfig(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }

    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCommand = () => {
    const { templateId, newTemplateName, diskSize, memory, cpuCores, cloneType } = config;
    
    // 基础克隆命令
    let command = `qm clone ${templateId} ${newTemplateName}`;
    
    // 克隆类型
    if (cloneType === 'full') {
      command += ' --full';
    }
    
    // 资源配置
    if (diskSize) command += ` --disk ${diskSize}`;
    if (memory) command += ` --memory ${memory}`;
    if (cpuCores) command += ` --cores ${cpuCores}`;

    return command;
  };

  const copyToClipboard = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generateCommand());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const clearConfiguration = () => {
    setConfig(defaultConfig);
    setCopied(false);
    setErrors({});
    localStorage.removeItem('cloneTemplateConfig');
  };

  const renderInput = (name, label, icon, description, type = 'text', placeholder) => (
    <div>
      <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
        {icon}
        {label}
        <span className="ml-2 text-xs text-gray-500 font-normal">{description}</span>
        {errors[name] && (
          <span className="ml-auto flex items-center text-xs text-red-500">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            {errors[name]}
          </span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={config[name]}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border ${errors[name] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#ec7211] focus:border-[#ec7211]'} transition-colors duration-200`}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Clone Template Generator</h1>
              <span className="px-2 py-1 text-xs font-medium text-[#ec7211] bg-orange-50 border border-orange-100">
                Template Management
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Clone Configuration Guide</h3>
            <p className="mt-2 text-sm text-blue-600">
              Choose full clone for a completely independent virtual machine, or linked clone to save storage space.
              Specify resource allocation for the new virtual machine, including memory, CPU cores, and disk size.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <div className="lg:w-[320px] flex-shrink-0">
          <div className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Configuration</h2>
            </div>
            <div className="p-4 space-y-4">
              {renderInput(
                'templateId',
                'Template ID',
                <ServerIcon className="w-5 h-5 mr-2 text-gray-500" />,
                'Source Template',
                'text',
                'Enter template ID (100-999999)'
              )}

              {renderInput(
                'newTemplateName',
                'New Template Name',
                <ServerIcon className="w-5 h-5 mr-2 text-gray-500" />,
                'Target VM Name',
                'text',
                'Enter new template name'
              )}

              {renderInput(
                'diskSize',
                'Disk Size',
                <CircleStackIcon className="w-5 h-5 mr-2 text-gray-500" />,
                'Storage Size (GB)',
                'number',
                'Enter disk size'
              )}

              {renderInput(
                'memory',
                'Memory',
                <CpuChipIcon className="w-5 h-5 mr-2 text-gray-500" />,
                'RAM Size (MB)',
                'number',
                'Enter memory size'
              )}

              {renderInput(
                'cpuCores',
                'CPU Cores',
                <CpuChipIcon className="w-5 h-5 mr-2 text-gray-500" />,
                'Processor Cores',
                'number',
                'Enter CPU cores'
              )}

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <ServerIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Clone Type
                  <span className="ml-2 text-xs text-gray-500 font-normal">Clone Method</span>
                </label>
                <select
                  name="cloneType"
                  value={config.cloneType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] transition-colors duration-200"
                >
                  <option value="full">Full Clone</option>
                  <option value="linked">Linked Clone</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={clearConfiguration}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#ec7211]"
                >
                  <TrashIcon className="w-4 h-4 mr-2 text-gray-500" />
                  Clear Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-[#232f3e] border border-[#1a1f29]">
            <div className="px-4 py-3 border-b border-[#2d3952]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CommandLineIcon className="w-5 h-5 text-gray-400 mr-2.5" />
                  <h4 className="text-sm font-bold text-white">Clone Command</h4>
                </div>
                <button
                  onClick={copyToClipboard}
                  disabled={Object.keys(errors).length > 0}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 border
                    ${Object.keys(errors).length > 0
                      ? 'bg-gray-500 text-white border-gray-600 cursor-not-allowed'
                      : copied
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
                      Copy Command
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className={`p-4 font-mono text-sm transition-all duration-300 overflow-x-auto whitespace-pre-wrap break-all border
                ${copied
                  ? 'bg-[#1a202c] text-green-300 border-green-600'
                  : 'bg-[#1a202c] text-gray-200 border-gray-700/50'
                }`}>
                {generateCommand()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloneTemplate; 