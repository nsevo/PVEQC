import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  ComputerDesktopIcon,
  TrashIcon,
  ClipboardIcon,
  CheckIcon,
  CommandLineIcon,
  CloudArrowDownIcon,
  KeyIcon,
  QueueListIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const BatchTemplateCreator = () => {
  // State variables
  const defaultFormData = {
    vmId: '9000',
    osType: 'ubuntu-22.04.qcow2',
    storage: 'local-lvm',
    bridge: 'vmbr0',
    enableQemuAgent: true,
    enableRootSsh: false,
    autoIncrementVmId: true
  };

  const [formData, setFormData] = useState(() => {
    // Load saved configuration from localStorage, use default if not available
    const savedConfig = localStorage.getItem('batchConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultFormData;
  });
  
  const [selectedOsTypes, setSelectedOsTypes] = useState(() => {
    // Load saved OS selections from localStorage, use empty object if not available
    const savedSelections = localStorage.getItem('batchSelectedOs');
    return savedSelections ? JSON.parse(savedSelections) : {};
  });

  const [batchTemplates, setBatchTemplates] = useState(() => {
    // Load saved template list from localStorage, use empty array if not available
    const savedTemplates = localStorage.getItem('batchTemplates');
    return savedTemplates ? JSON.parse(savedTemplates) : [];
  });
  
  const [batchMergedCommand, setBatchMergedCommand] = useState('');
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    document.title = 'Batch Template Generator | PVEQC';
    
    // If there are saved templates, regenerate commands
    if (batchTemplates.length > 0) {
      updateBatchCommand(batchTemplates);
    }
  }, []);
  
  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem('batchConfig', JSON.stringify(formData));
  }, [formData]);
  
  // Save OS selections to localStorage
  useEffect(() => {
    localStorage.setItem('batchSelectedOs', JSON.stringify(selectedOsTypes));
  }, [selectedOsTypes]);
  
  // Save template list to localStorage
  useEffect(() => {
    localStorage.setItem('batchTemplates', JSON.stringify(batchTemplates));
  }, [batchTemplates]);

  // Basic functions
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'enableQemuAgent' && !checked) {
      // If QEMU Guest Agent is disabled, also disable Root SSH
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        enableRootSsh: false
      }));
    } else if (name === 'vmId' && batchTemplates.length > 0) {
      // When vmId changes and templates exist, recalculate all template IDs
      const newStartingId = parseInt(value, 10);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
      
      // Recalculate all template IDs, starting from the new initial ID
      const updatedTemplates = batchTemplates.map((template, index) => {
        return {
          ...template,
          vmId: (newStartingId + index).toString()
        };
      });
      
      // Update template list
      setBatchTemplates(updatedTemplates);
      
      // Update batch commands
      updateBatchCommand(updatedTemplates);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  // OS options (same as the original page)
  const osOptions = [
    {
      label: 'Ubuntu',
      options: [
        { value: 'ubuntu-24.04.qcow2', label: 'Ubuntu 24.04 LTS' },
        { value: 'ubuntu-22.04.qcow2', label: 'Ubuntu 22.04 LTS' },
        { value: 'ubuntu-20.04.qcow2', label: 'Ubuntu 20.04 LTS' }
      ]
    },
    {
      label: 'Debian',
      options: [
        { value: 'debian-12.qcow2', label: 'Debian 12' },
        { value: 'debian-11.qcow2', label: 'Debian 11' }
      ]
    },
    {
      label: 'CentOS',
      options: [
        { value: 'centos-stream-9.qcow2', label: 'CentOS Stream 9' },
        { value: 'centos-stream-8.qcow2', label: 'CentOS Stream 8' }
      ]
    },
    {
      label: 'Rocky Linux',
      options: [
        { value: 'rocky-9.qcow2', label: 'Rocky Linux 9' },
        { value: 'rocky-8.qcow2', label: 'Rocky Linux 8' }
      ]
    },
    {
      label: 'AlmaLinux',
      options: [
        { value: 'almalinux-9.qcow2', label: 'AlmaLinux 9' },
        { value: 'almalinux-8.qcow2', label: 'AlmaLinux 8' }
      ]
    },
    {
      label: 'Fedora',
      options: [
        { value: 'fedora-41.qcow2', label: 'Fedora 41' }
      ]
    }
  ];

  // OS download links (same as the original page)
  const osDownloadLinks = {
    'ubuntu-24.04.qcow2': {
      download: 'wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img -O ubuntu-24.04.qcow2',
      needDisableSELinux: false,
      packageManager: 'apt'
    },
    'ubuntu-22.04.qcow2': {
      download: 'wget https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img -O ubuntu-22.04.qcow2',
      needDisableSELinux: false,
      packageManager: 'apt'
    },
    'ubuntu-20.04.qcow2': {
      download: 'wget https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img -O ubuntu-20.04.qcow2',
      needDisableSELinux: false,
      packageManager: 'apt'
    },
    'debian-12.qcow2': {
      download: 'wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2 -O debian-12.qcow2',
      needDisableSELinux: false,
      packageManager: 'apt'
    },
    'debian-11.qcow2': {
      download: 'wget https://cloud.debian.org/images/cloud/bullseye/latest/debian-11-genericcloud-amd64.qcow2 -O debian-11.qcow2',
      needDisableSELinux: false,
      packageManager: 'apt'
    },
    'centos-stream-9.qcow2': {
      download: 'wget https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2 -O centos-stream-9.qcow2',
      needDisableSELinux: false,
      packageManager: 'dnf',
      isRHELBased: true
    },
    'centos-stream-8.qcow2': {
      download: 'wget https://cloud.centos.org/centos/8-stream/x86_64/images/CentOS-Stream-GenericCloud-8-latest.x86_64.qcow2 -O centos-stream-8.qcow2',
      needDisableSELinux: false,
      packageManager: 'dnf',
      isRHELBased: true
    },
    'rocky-9.qcow2': {
      download: 'wget https://dl.rockylinux.org/pub/rocky/9/images/x86_64/Rocky-9-GenericCloud.latest.x86_64.qcow2 -O rocky-9.qcow2',
      needDisableSELinux: true,
      packageManager: 'dnf',
      isRHELBased: true
    },
    'rocky-8.qcow2': {
      download: 'wget https://dl.rockylinux.org/pub/rocky/8/images/x86_64/Rocky-8-GenericCloud.latest.x86_64.qcow2 -O rocky-8.qcow2',
      needDisableSELinux: true,
      packageManager: 'dnf',
      isRHELBased: true
    },
    'almalinux-9.qcow2': {
      download: 'wget https://repo.almalinux.org/almalinux/9/cloud/x86_64/images/AlmaLinux-9-GenericCloud-latest.x86_64.qcow2 -O almalinux-9.qcow2',
      needDisableSELinux: true,
      packageManager: 'dnf',
      isRHELBased: true
    },
    'almalinux-8.qcow2': {
      download: 'wget https://repo.almalinux.org/almalinux/8/cloud/x86_64/images/AlmaLinux-8-GenericCloud-latest.x86_64.qcow2 -O almalinux-8.qcow2',
      needDisableSELinux: true,
      packageManager: 'dnf',
      isRHELBased: true
    },
    'fedora-41.qcow2': {
      download: 'wget https://download.fedoraproject.org/pub/fedora/linux/releases/41/Cloud/x86_64/images/Fedora-Cloud-Base-Generic-41-1.4.x86_64.qcow2 -O fedora-41.qcow2',
      needDisableSELinux: true,
      packageManager: 'dnf',
      isRHELBased: true
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({
        ...prev,
        [key]: true
      }));
      setTimeout(() => {
        setCopiedStates(prev => ({
          ...prev,
          [key]: false
        }));
      }, 3000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Clear batch templates
  const clearBatchTemplates = () => {
    // Clear template list and related states
    setBatchTemplates([]);
    setBatchMergedCommand('');
    setCopiedStates({});
    
    // Restore VM ID in the form to the original value
    const savedConfig = localStorage.getItem('batchConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : defaultFormData;
    
    setFormData(prev => ({
      ...prev,
      vmId: config.vmId
    }));
    
    // Keep all selected system states unchanged
    // Don't modify selectedOsTypes, ensuring each system's uniqueness
  };
  
  // Clear all batch settings including configuration
  const clearAllBatchSettings = () => {
    // Remove all batch-related configurations from localStorage
    localStorage.removeItem('batchConfig');
    localStorage.removeItem('batchSelectedOs');
    localStorage.removeItem('batchTemplates');
    
    // Reset all states
    setFormData(defaultFormData);
    setSelectedOsTypes({});
    setBatchTemplates([]);
    setBatchMergedCommand('');
    setCopiedStates({});
  };

  // Handle OS type selection
  const handleOsTypeSelect = (osType) => {
    // Get previous selection state
    const wasSelected = selectedOsTypes[osType];
    
    // Update selection state
    const newSelectedTypes = {
      ...selectedOsTypes,
      [osType]: !wasSelected
    };
    
    setSelectedOsTypes(newSelectedTypes);
    
    if (wasSelected) {
      // If previously selected, now deselecting, remove the OS from template list
      const updatedTemplates = batchTemplates.filter(template => template.osType !== osType);
      setBatchTemplates(updatedTemplates);
      updateBatchCommand(updatedTemplates);
    } else {
      // If previously not selected, now selecting, add this new OS
      // Check if this system is already in the template list
      const existingTemplateIndex = batchTemplates.findIndex(t => t.osType === osType);
      
      if (existingTemplateIndex !== -1) {
        // If already exists, update its configuration (using current form data) but keep original VM ID
        const updatedTemplates = [...batchTemplates];
        const originalVmId = updatedTemplates[existingTemplateIndex].vmId;
        
        updatedTemplates[existingTemplateIndex] = {
          ...formData,
          vmId: originalVmId,
          osType,
          id: updatedTemplates[existingTemplateIndex].id
        };
        
        setBatchTemplates(updatedTemplates);
        updateBatchCommand(updatedTemplates);
      } else {
        // If not exists, add new template
        const startVmId = getStartingVmId();
        
        // Create a new template
        const newTemplate = {
          ...formData,
          vmId: startVmId.toString(),
          osType,
          id: Date.now() + Math.random() // Ensure unique ID
        };
        
        // Add to template list
        const updatedTemplates = [...batchTemplates, newTemplate];
        setBatchTemplates(updatedTemplates);
        updateBatchCommand(updatedTemplates);
      }
    }
  };

  // Update batch command
  const updateBatchCommand = (templates) => {
    if (templates.length === 0) {
      setBatchMergedCommand('');
      return;
    }
    
    // Generate commands for all templates and combine
    const allCommands = templates.map(template => {
      const templateCommands = generateCommandsForTemplate(template);
      return templateCommands.map(cmd => cmd.cmd).join(' && ');
    });
    
    setBatchMergedCommand(allCommands.join(' && '));
  };

  // Generate commands for a specific template
  const generateCommandsForTemplate = (templateData) => {
    const { vmId, osType, storage, bridge, enableQemuAgent, enableRootSsh } = templateData;
    
    // Safety check: ensure osType exists in osDownloadLinks
    if (!osDownloadLinks[osType]) {
      console.error(`Error: Operating system type "${osType}" does not exist in the supported list`);
      return [{
        desc: 'Error',
        cmd: `# Error: Operating system type "${osType}" is not supported`,
        icon: <CommandLineIcon className="w-5 h-5" />
      }];
    }
    
    const osName = osType.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '') + '-template';
    const needDisableSELinux = osDownloadLinks[osType].needDisableSELinux;
    const isRHELBased = osDownloadLinks[osType].isRHELBased || false;
    const packageManager = osDownloadLinks[osType].packageManager;

    const commands = [
      {
        desc: 'Download OS Image',
        cmd: osDownloadLinks[osType].download,
        icon: <CloudArrowDownIcon className="w-5 h-5" />
      }
    ];

    if (enableQemuAgent) {
      if (needDisableSELinux) {
        commands.push({
          desc: `Install & Enable QEMU Guest Agent (${osName.split('-')[0].charAt(0).toUpperCase() + osName.split('-')[0].slice(1)})`,
          cmd: `virt-customize -a ${osType} --run-command '#!/bin/bash
set -e
sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
${packageManager} install -y qemu-guest-agent
systemctl enable qemu-guest-agent.service'`,
          icon: <ComputerDesktopIcon className="w-5 h-5" />
        });
      } else if (isRHELBased) {
        commands.push({
          desc: `Install & Enable QEMU Guest Agent (${osName.split('-')[0].charAt(0).toUpperCase() + osName.split('-')[0].slice(1)})`,
          cmd: `virt-customize -a ${osType} --run-command '#!/bin/bash
set -e
${packageManager} install -y qemu-guest-agent
systemctl enable qemu-guest-agent.service'`,
          icon: <ComputerDesktopIcon className="w-5 h-5" />
        });
      } else {
        commands.push({
          desc: 'Install & Enable QEMU Guest Agent',
          cmd: `virt-customize -a ${osType} --install qemu-guest-agent`,
          icon: <ComputerDesktopIcon className="w-5 h-5" />
        });
      }
    }

    if (enableRootSsh) {
      commands.push({
        desc: 'Configure Root SSH Access (Production Best Practices)',
        cmd: `virt-customize -a ${osType} --run-command '#!/bin/bash
set -e
mkdir -p /etc/cloud/cloud.cfg.d
cat > /etc/cloud/cloud.cfg.d/99-enable-root.cfg << "EOF"
disable_root: false
ssh_pwauth: true
ssh_deletekeys: false
EOF
mkdir -p /etc/ssh/sshd_config.d
cat > /etc/ssh/sshd_config.d/99-enable-root.conf << "EOF"
PermitRootLogin yes
PasswordAuthentication yes
EOF
if command -v semanage >/dev/null 2>&1 && command -v getenforce >/dev/null 2>&1; then
  if [ "$(getenforce)" != "Disabled" ]; then
    semanage boolean -m --on ssh_enable_root_login || true
  fi
fi
if command -v systemctl >/dev/null 2>&1; then
  systemctl restart sshd.service || systemctl restart ssh.service
else
  service sshd restart || service ssh restart
fi'`,
        icon: <KeyIcon className="w-5 h-5" />
      });
    }

    commands.push(
      {
        desc: 'Create Virtual Machine',
        cmd: `qm create ${vmId} --name ${osName} --memory 2048 --cores 2 --cpu host --net0 virtio,bridge=${bridge}`,
        icon: <ServerIcon className="w-5 h-5" />
      },
      {
        desc: 'Import QCOW2 Disk',
        cmd: `qm importdisk ${vmId} ${osType} ${storage}`,
        icon: <CircleStackIcon className="w-5 h-5" />
      },
      {
        desc: 'Configure VirtIO SCSI',
        cmd: `qm set ${vmId} --scsihw virtio-scsi-pci --scsi0 ${storage}:vm-${vmId}-disk-0`,
        icon: <CpuChipIcon className="w-5 h-5" />
      },
      {
        desc: 'Configure Display',
        cmd: `qm set ${vmId} --vga virtio --serial0 socket`,
        icon: <ComputerDesktopIcon className="w-5 h-5" />
      },
      {
        desc: 'Enable Cloud-Init',
        cmd: `qm set ${vmId} --ide2 ${storage}:cloudinit`,
        icon: <CloudArrowDownIcon className="w-5 h-5" />
      },
      {
        desc: 'Configure Cloud-Init User',
        cmd: `qm set ${vmId} --ciuser root --citype nocloud`,
        icon: <CloudArrowDownIcon className="w-5 h-5" />
      },
      {
        desc: 'Configure Boot Options',
        cmd: `qm set ${vmId} --boot c --bootdisk scsi0`,
        icon: <ServerIcon className="w-5 h-5" />
      }
    );

    if (enableQemuAgent) {
      commands.push({
        desc: 'Enable QEMU Guest Agent',
        cmd: `qm set ${vmId} --agent enabled=1`,
        icon: <ComputerDesktopIcon className="w-5 h-5" />
      });
    }

    commands.push({
      desc: 'Convert to Template',
      cmd: `qm template ${vmId}`,
      icon: <ServerIcon className="w-5 h-5" />
    });

    return commands;
  };

  // Get the next starting VM ID to use
  const getStartingVmId = () => {
    // Use initial VM ID from form directly, regardless of existing templates
    // This ensures the starting ID has the highest priority
    return parseInt(formData.vmId, 10);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#232f3e] text-white p-3 rounded-md flex justify-between items-center">
        <h2 className="font-bold flex items-center">
          <QueueListIcon className="w-5 h-5 mr-2" />
          Batch Template Creation
        </h2>
        <button
          onClick={clearAllBatchSettings}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          <TrashIcon className="w-4 h-4 mr-1.5" />
          Clear All Batch Settings
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration panel */}
        <div>
          <div className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Configuration</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* VM ID */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <ServerIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Initial VM ID
                  <span className="ml-2 text-xs text-gray-500 font-normal">Starting Identifier</span>
                </label>
                <input
                  type="number"
                  name="vmId"
                  value={formData.vmId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] transition-colors duration-200"
                  placeholder="Enter starting VM ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  All templates will be assigned sequential VM IDs starting from this number
                </p>
              </div>

              {/* Storage location */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <CircleStackIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Storage Location
                  <span className="ml-2 text-xs text-gray-500 font-normal">PVE Storage</span>
                </label>
                <input
                  type="text"
                  name="storage"
                  value={formData.storage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] transition-colors duration-200"
                  placeholder="Enter storage location"
                />
              </div>

              {/* Network bridge */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <SignalIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Network Bridge
                  <span className="ml-2 text-xs text-gray-500 font-normal">Bridge Device</span>
                </label>
                <input
                  type="text"
                  name="bridge"
                  value={formData.bridge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] transition-colors duration-200"
                  placeholder="Enter bridge name"
                />
              </div>

              {/* QEMU Guest Agent */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <ComputerDesktopIcon className="w-5 h-5 mr-2 text-gray-500" />
                    QEMU Guest Agent
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableQemuAgent"
                      checked={formData.enableQemuAgent}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ec7211]"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-7">Enable VM agent service for enhanced management capabilities</p>
              </div>

              {/* Enable Root SSH */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <KeyIcon className="w-5 h-5 mr-2 text-gray-500" />
                    Enable Root SSH
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableRootSsh"
                      checked={formData.enableRootSsh}
                      onChange={handleInputChange}
                      disabled={!formData.enableQemuAgent}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${!formData.enableQemuAgent ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200 peer-checked:bg-[#ec7211] cursor-pointer'}`}></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-7">Allow root SSH login (requires QEMU Guest Agent)</p>
              </div>
            </div>
          </div>
          
          {/* Prerequisite information - Displayed when QEMU Guest Agent or ROOT SSH is enabled */}
          {(formData.enableQemuAgent || formData.enableRootSsh) && (
            <div className="mt-4 bg-blue-50 border border-gray-200 rounded-md">
              <div className="p-4 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Prerequisites</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Please ensure <code className="bg-blue-100 px-1 py-0.5 rounded">libguestfs-tools</code> is installed on your system:
                  </p>
                  <pre className="mt-2 bg-blue-100 p-2 rounded text-xs text-blue-800 font-mono overflow-x-auto">apt update && apt install -y libguestfs-tools</pre>
                  <p className="mt-2 text-xs text-blue-600">
                    This tool is required for customizing VM templates with QEMU Guest Agent and ROOT SSH access.
                    The installation command is not included in the generated batch command.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* OS selection panel */}
        <div className="bg-white border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-900">Select Operating Systems</h2>
          </div>
          <div className="p-4">
            <div className="mb-2 flex justify-between items-center">
              <div className="text-xs text-[#ec7211] font-medium">
                Choose operating systems to create templates (commands auto-generate)
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-[#ec7211] font-medium">{Object.keys(selectedOsTypes).filter(k => selectedOsTypes[k]).length}</span> selected
              </div>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto border border-gray-300 rounded">
              {osOptions.map(group => (
                <div key={group.label} className="border-b border-gray-200 last:border-b-0">
                  <div className="bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 flex justify-between">
                    <span>{group.label}</span>
                    <button
                      onClick={() => {
                        // Check if all options in this group are selected
                        const groupIsFullySelected = group.options.every(option => 
                          selectedOsTypes[option.value]
                        );
                        
                        // Get options that will change selection status (to add or remove)
                        const optionsToToggle = group.options.map(o => o.value);
                        
                        // Update selection states
                        const newSelectedTypes = { ...selectedOsTypes };
                        group.options.forEach(option => {
                          newSelectedTypes[option.value] = !groupIsFullySelected;
                        });
                        setSelectedOsTypes(newSelectedTypes);
                        
                        if (groupIsFullySelected) {
                          // If previously all selected, now deselecting, remove related templates
                          const optionsToRemove = group.options.map(o => o.value);
                          const updatedTemplates = batchTemplates.filter(
                            template => !optionsToRemove.includes(template.osType)
                          );
                          setBatchTemplates(updatedTemplates);
                          updateBatchCommand(updatedTemplates);
                        } else {
                          // If not all selected previously, add newly selected OS
                          // Filter options that weren't selected
                          const optionsToAdd = group.options
                            .filter(option => !selectedOsTypes[option.value])
                            .map(option => option.value);
                          
                          // Get starting ID
                          let startVmId = getStartingVmId();
                          
                          // Create new templates, ensuring no duplicates
                          const newTemplates = [];
                          
                          optionsToAdd.forEach(osType => {
                            // Check if template already exists
                            const existingTemplateIndex = batchTemplates.findIndex(t => t.osType === osType);
                            
                            if (existingTemplateIndex === -1) {
                              // If not exists, create new template
                              const template = {
                                ...formData,
                                vmId: startVmId.toString(),
                                osType,
                                id: Date.now() + Math.random()
                              };
                              startVmId++;
                              newTemplates.push(template);
                            }
                            // If already exists, skip, maintaining uniqueness
                          });
                          
                          // Add to template list (if there are new templates)
                          if (newTemplates.length > 0) {
                            const updatedTemplates = [...batchTemplates, ...newTemplates];
                            setBatchTemplates(updatedTemplates);
                            updateBatchCommand(updatedTemplates);
                          }
                        }
                      }}
                      className="text-xs text-gray-500 hover:text-[#ec7211]"
                    >
                      {group.options.every(option => selectedOsTypes[option.value])
                        ? 'Deselect all'
                        : 'Select all'}
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {group.options.map(option => (
                      <div 
                        key={option.value} 
                        className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                          selectedOsTypes[option.value] ? 'bg-orange-50' : ''
                        }`}
                        onClick={() => handleOsTypeSelect(option.value)}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedOsTypes[option.value]}
                          onChange={() => {}}
                          className="h-4 w-4 text-[#ec7211] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              <button 
                onClick={() => {
                  // Clear all selections and empty template list
                  setSelectedOsTypes({});
                  clearBatchTemplates();
                }}
                className="text-xs text-gray-500 hover:text-[#ec7211] flex items-center"
              >
                <TrashIcon className="w-3 h-3 mr-1" />
                Clear selection
              </button>
              <button 
                onClick={() => {
                  // Get all currently unselected operating systems
                  const allOsTypes = [];
                  osOptions.forEach(group => {
                    group.options.forEach(option => {
                      allOsTypes.push(option.value);
                    });
                  });
                  
                  // Filter out options that are not selected
                  const optionsToAdd = allOsTypes.filter(osType => !selectedOsTypes[osType]);
                  
                  // If no new options, return immediately
                  if (optionsToAdd.length === 0) return;
                  
                  // Create fully selected state
                  const allSelected = {};
                  allOsTypes.forEach(osType => {
                    allSelected[osType] = true;
                  });
                  setSelectedOsTypes(allSelected);
                  
                  // Get starting ID
                  let startVmId = getStartingVmId();
                  
                  // Create new templates, ensuring no duplicates
                  const newTemplates = [];
                  
                  optionsToAdd.forEach(osType => {
                    // Check if template already exists
                    const existingTemplateIndex = batchTemplates.findIndex(t => t.osType === osType);
                    
                    if (existingTemplateIndex === -1) {
                      // If not exists, create new template
                      const template = {
                        ...formData,
                        vmId: startVmId.toString(),
                        osType,
                        id: Date.now() + Math.random()
                      };
                      startVmId++;
                      newTemplates.push(template);
                    }
                    // If already exists, skip, maintaining uniqueness
                  });
                  
                  // Add to template list (if there are new templates)
                  if (newTemplates.length > 0) {
                    const updatedTemplates = [...batchTemplates, ...newTemplates];
                    setBatchTemplates(updatedTemplates);
                    updateBatchCommand(updatedTemplates);
                  }
                }}
                className="text-xs text-gray-500 hover:text-[#ec7211] flex items-center"
              >
                <QueueListIcon className="w-3 h-3 mr-1" />
                Select all
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results area - Template list and batch command */}
      {batchTemplates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Template List */}
          <div className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-sm font-bold text-gray-900">Template List</h2>
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  {batchTemplates.length} template{batchTemplates.length !== 1 ? 's' : ''}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {batchTemplates.filter(t => t.enableQemuAgent).length} with QEMU,
                  {' '}{batchTemplates.filter(t => t.enableRootSsh).length} with SSH
                </span>
              </div>
              {batchTemplates.length > 0 && (
                <div className="relative group">
                  <button 
                    onClick={clearBatchTemplates}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center"
                  >
                    Clear list
                    <InformationCircleIcon className="w-3 h-3 ml-1 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded border border-gray-200 p-2 text-xs text-gray-600 hidden group-hover:block z-10">
                    Only clear the list, will not cancel system selection state
                  </div>
                </div>
              )}
            </div>
            {batchTemplates.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No templates added yet. Select operating systems from the right panel.</p>
                <p className="text-xs mt-2">Your selections and templates will be automatically saved.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                {batchTemplates.map((template, index) => (
                  <div key={template.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{template.osType}</p>
                        <div className="text-xs text-gray-500">VM ID: {template.vmId}</div>
                        <div className="mt-1 flex space-x-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-sm ${template.enableQemuAgent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            QEMU: {template.enableQemuAgent ? 'ON' : 'OFF'}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-sm ${template.enableRootSsh ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            ROOT SSH: {template.enableRootSsh ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                      {/* Remove button has been deleted, users should manage templates directly in the system selection area */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Batch Command */}
          <div className="bg-[#232f3e] border border-[#1a1f29]">
            <div className="px-4 py-3 border-b border-[#2d3952]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CommandLineIcon className="w-5 h-5 text-gray-400 mr-2.5" />
                  <h4 className="text-sm font-bold text-white">Complete Batch Command</h4>
                </div>
                <div className="flex space-x-2">
                  <span className="text-xs text-gray-400 self-center">
                    {batchMergedCommand.length} chars
                  </span>
                  <button
                    onClick={() => copyToClipboard(batchMergedCommand, 'batchMerged')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 border
                      ${copiedStates['batchMerged']
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-[#ec7211] text-white hover:bg-[#ec7211]/90 border-[#ec7211]'
                      }`}
                  >
                    {copiedStates['batchMerged'] ? (
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
            </div>
            <div className="p-4">
              <div className={`p-4 font-mono text-sm transition-all duration-300 overflow-x-auto whitespace-pre-wrap break-all border
                ${copiedStates['batchMerged']
                  ? 'bg-[#1a202c] text-green-300 border-green-600'
                  : 'bg-[#1a202c] text-gray-200 border-gray-700/50'
                }`}>
                {batchMergedCommand}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTemplateCreator; 