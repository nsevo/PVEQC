import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  SignalIcon,
  ClipboardIcon,
  CheckIcon,
  CommandLineIcon,
  CloudArrowDownIcon,
  ComputerDesktopIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const TemplateCreator = () => {
  const defaultFormData = {
    vmId: '9000',
    osType: 'ubuntu-22.04.qcow2',
    storage: 'local-lvm',
    bridge: 'vmbr0',
    enableQemuAgent: true
  };

  const [formData, setFormData] = useState(() => {
    const savedConfig = localStorage.getItem('pveConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultFormData;
  });

  const [copiedStates, setCopiedStates] = useState({});
  const [mergedCopied, setMergedCopied] = useState(false);

  useEffect(() => {
    document.title = 'Template Generator | PVEQC';
  }, []);

  useEffect(() => {
    localStorage.setItem('pveConfig', JSON.stringify(formData));
  }, [formData]);

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
    }
  ];

  const osDownloadLinks = {
    'ubuntu-24.04.qcow2': 'wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img -O ubuntu-24.04.qcow2',
    'ubuntu-22.04.qcow2': 'wget https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img -O ubuntu-22.04.qcow2',
    'ubuntu-20.04.qcow2': 'wget https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img -O ubuntu-20.04.qcow2',
    'debian-12.qcow2': 'wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2 -O debian-12.qcow2',
    'debian-11.qcow2': 'wget https://cloud.debian.org/images/cloud/bullseye/latest/debian-11-genericcloud-amd64.qcow2 -O debian-11.qcow2',
    'centos-stream-9.qcow2': 'wget https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2 -O centos-stream-9.qcow2',
    'centos-stream-8.qcow2': 'wget https://cloud.centos.org/centos/8-stream/x86_64/images/CentOS-Stream-GenericCloud-8-latest.x86_64.qcow2 -O centos-stream-8.qcow2',
    'rocky-9.qcow2': 'wget https://dl.rockylinux.org/pub/rocky/9/images/x86_64/Rocky-9-GenericCloud-Base.latest.x86_64.qcow2 -O rocky-9.qcow2',
    'rocky-8.qcow2': 'wget https://dl.rockylinux.org/pub/rocky/8/images/x86_64/Rocky-8-GenericCloud-Base.latest.x86_64.qcow2 -O rocky-8.qcow2',
    'almalinux-9.qcow2': 'wget https://repo.almalinux.org/almalinux/9/cloud/x86_64/images/AlmaLinux-9-GenericCloud-latest.x86_64.qcow2 -O almalinux-9.qcow2',
    'almalinux-8.qcow2': 'wget https://repo.almalinux.org/almalinux/8/cloud/x86_64/images/AlmaLinux-8-GenericCloud-latest.x86_64.qcow2 -O almalinux-8.qcow2'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const generateCommands = () => {
    const { vmId, osType, storage, bridge, enableQemuAgent } = formData;
    const osName = osType.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '') + '-template';
    
    const commands = [
      {
        desc: 'Download OS Image',
        cmd: osDownloadLinks[osType],
        icon: <CloudArrowDownIcon className="w-5 h-5" />
      }
    ];

    if (enableQemuAgent) {
      const guestAgentInstallCmd = osType.startsWith('rocky') || osType.startsWith('almalinux')
        ? `virt-customize -a /root/${osType} --run-command 'dnf install -y qemu-guest-agent cloud-init && systemctl enable qemu-guest-agent.service'`
        : `virt-customize -a /root/${osType} --install qemu-guest-agent --run-command 'systemctl enable qemu-guest-agent.service'`;

      commands.push(
        {
          desc: 'Install libguestfs-tools',
          cmd: 'apt update && apt install -y libguestfs-tools',
          icon: <CommandLineIcon className="w-5 h-5" />
        },
        {
          desc: 'Install & Enable QEMU Guest Agent',
          cmd: guestAgentInstallCmd,
          icon: <ComputerDesktopIcon className="w-5 h-5" />
        }
      );
    }

    commands.push(
      {
        desc: 'Create Virtual Machine',
        cmd: `qm create ${vmId} --name ${osName} --memory 2048 --cores 2 --cpu host --net0 virtio,bridge=${bridge}`,
        icon: <ServerIcon className="w-5 h-5" />
      },
      {
        desc: 'Import QCOW2 Disk',
        cmd: `qm importdisk ${vmId} /root/${osType} ${storage}`,
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

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      if (key === 'merged') {
        setMergedCopied(true);
      } else {
        setCopiedStates(prev => ({
          ...prev,
          [key]: true
        }));
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const commands = generateCommands();
  const mergedCommand = commands.map(cmd => cmd.cmd).join(' && ');

  const clearLocalStorage = () => {
    localStorage.removeItem('pveConfig');
    setFormData(defaultFormData);
    setCopiedStates({});
    setMergedCopied(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <div className="lg:w-[320px] flex-shrink-0">
          <div className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Configuration</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <ServerIcon className="w-5 h-5 mr-2 text-gray-500" />
                  VM ID
                  <span className="ml-2 text-xs text-gray-500 font-normal">Unique Identifier</span>
                </label>
                <input
                  type="number"
                  name="vmId"
                  value={formData.vmId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] transition-colors duration-200"
                  placeholder="Enter VM ID"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <CpuChipIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Operating System
                  <span className="ml-2 text-xs text-gray-500 font-normal">Select OS Image</span>
                </label>
                <select
                  name="osType"
                  value={formData.osType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] transition-colors duration-200"
                >
                  {osOptions.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

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

              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={clearLocalStorage}
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
          <div className="bg-white border border-gray-200 mb-4">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Command List</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {commands.map((command) => (
                <div key={command.desc} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2.5">{command.icon}</span>
                      <span className="text-sm font-semibold text-gray-700">{command.desc}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(command.cmd, command.desc)}
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all duration-200 border
                        ${copiedStates[command.desc]
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                        }`}
                    >
                      {copiedStates[command.desc] ? (
                        <>
                          <CheckIcon className="w-4 h-4 mr-1.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-4 h-4 mr-1.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className={`p-4 font-mono text-sm transition-all duration-300 overflow-x-auto whitespace-pre-wrap break-all border
                    ${copiedStates[command.desc]
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                    }`}>
                    {command.cmd}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 合并的命令 */}
          <div className="bg-[#232f3e] border border-[#1a1f29]">
            <div className="px-4 py-3 border-b border-[#2d3952]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CommandLineIcon className="w-5 h-5 text-gray-400 mr-2.5" />
                  <h4 className="text-sm font-bold text-white">Complete Execution Command</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(mergedCommand, 'merged')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 border
                    ${mergedCopied
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-[#ec7211] text-white hover:bg-[#ec7211]/90 border-[#ec7211]'
                    }`}
                >
                  {mergedCopied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="w-4 h-4 mr-2" />
                      Copy Full Command
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className={`p-4 font-mono text-sm transition-all duration-300 overflow-x-auto whitespace-pre-wrap break-all border
                ${mergedCopied
                  ? 'bg-[#1a202c] text-green-300 border-green-600'
                  : 'bg-[#1a202c] text-gray-200 border-gray-700/50'
                }`}>
                {mergedCommand}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreator; 