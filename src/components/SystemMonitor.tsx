import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Activity, GitBranch, Clock, Wifi } from 'lucide-react';

interface Process {
  pid: number;
  user: string;
  pr: number;
  ni: number;
  virt: string;
  res: string;
  shr: string;
  s: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
  color: string;
}

const processes: Process[] = [
  { pid: 1024, user: 'idan', pr: 20, ni: 0, virt: '12.5G', res: '8.2G', shr: '2.1G', s: 'R', cpu: 98.5, mem: 45.2, time: '124:20.15', command: 'kube-controller', color: '#326ce5' },
  { pid: 1025, user: 'idan', pr: 20, ni: 0, virt: '10.1G', res: '6.4G', shr: '1.8G', s: 'S', cpu: 92.1, mem: 38.7, time: '89:12.44', command: 'aws-daemon', color: '#ff9900' },
  { pid: 1026, user: 'idan', pr: 20, ni: 0, virt: '8.4G', res: '4.2G', shr: '1.2G', s: 'R', cpu: 88.4, mem: 25.1, time: '45:01.22', command: 'terraform', color: '#7b42bc' },
  { pid: 1027, user: 'idan', pr: 20, ni: 0, virt: '6.2G', res: '3.1G', shr: '900M', s: 'S', cpu: 85.2, mem: 22.4, time: '32:15.10', command: 'dockerd', color: '#2496ed' },
  { pid: 1028, user: 'idan', pr: 20, ni: 0, virt: '4.5G', res: '2.8G', shr: '1.1G', s: 'S', cpu: 82.0, mem: 30.5, time: '67:45.01', command: 'go-runtime', color: '#00add8' },
  { pid: 1029, user: 'idan', pr: 20, ni: 0, virt: '3.8G', res: '1.5G', shr: '500M', s: 'R', cpu: 75.5, mem: 15.2, time: '12:30.55', command: 'ci-pipeline', color: '#2088ff' },
];

const codeSnippet = `package main

import (
    "fmt"
    "time"
    "github.com/idanbot/portfolio"
)

// DevOpsEngineer defines the core role
type DevOpsEngineer struct {
    Name      string
    Skills    []string
    Coffee    int
    IsOnline  bool
}

func main() {
    idan := DevOpsEngineer{
        Name: "Idan Botbol",
        Skills: []string{
            "Kubernetes", 
            "AWS", 
            "Terraform",
            "Go",
        },
        Coffee: 9000,
        IsOnline: true,
    }

    for idan.IsOnline {
        portfolio.Deploy("Production")
        fmt.Println("Systems stable 🚀")
        time.Sleep(time.Hour * 24)
    }
}`;

export const SystemMonitor = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto font-mono text-xs md:text-sm bg-[#1a1b26]/95 rounded-lg overflow-hidden border border-gray-700 shadow-2xl mb-20 flex flex-col h-auto md:h-[600px]">
      
      {/* Main Split Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Pane: btop style */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col p-2 bg-[#1a1b26]/90">
            {/* Header */}
            <div className="flex justify-between text-gray-500 mb-2 px-1">
                <span className="font-bold text-cyan-400">btop++ 1.2.13</span>
                <span>[root@portfolio]</span>
            </div>

            {/* CPU / MEM Box */}
            <div className="bg-[#16161e]/80 rounded p-2 mb-2 border border-gray-800">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">cpu</span>
                    <span className="text-green-400 font-bold">12%</span>
                </div>
                <div className="h-12 flex items-end gap-0.5 mb-2">
                    {[...Array(40)].map((_, i) => (
                        <motion.div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-sm opacity-60"
                            animate={{ height: `${Math.random() * 80 + 10}%` }}
                            transition={{ repeat: Infinity, repeatType: "reverse", duration: Math.random() * 2 + 1 }}
                        />
                    ))}
                </div>
                
                <div className="flex justify-between items-center mb-1 mt-2">
                    <span className="text-gray-400">mem</span>
                    <span className="text-purple-400 font-bold">14.2G / 32G</span>
                </div>
                <div className="h-2 bg-gray-800 rounded overflow-hidden">
                    <motion.div 
                        className="h-full bg-purple-500" 
                        initial={{ width: "40%" }}
                        animate={{ width: ["40%", "45%", "42%"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </div>
            </div>

            {/* Process List */}
            <div className="flex-1 bg-[#16161e]/80 rounded border border-gray-800 overflow-hidden flex flex-col">
                <div className="bg-[#24283b] px-2 py-1 text-[10px] grid grid-cols-12 gap-1 font-bold text-cyan-400">
                    <div className="col-span-2">PID</div>
                    <div className="col-span-3">CPU%</div>
                    <div className="col-span-2">MEM</div>
                    <div className="col-span-5">CMD</div>
                </div>
                <div className="p-1 overflow-y-auto custom-scrollbar">
                    {processes.map((p) => (
                        <div key={p.pid} className="grid grid-cols-12 gap-1 px-1 py-0.5 text-[10px] text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                            <div className="col-span-2 text-green-500">{p.pid}</div>
                            <div className="col-span-3">{p.cpu}%</div>
                            <div className="col-span-2">{p.mem}</div>
                            <div className="col-span-5 truncate" style={{ color: p.color }}>{p.command}</div>
                        </div>
                    ))}
                    {[...Array(10)].map((_, i) => (
                         <div key={i} className="grid grid-cols-12 gap-1 px-1 py-0.5 text-[10px] text-gray-600">
                            <div className="col-span-2">{3000 + i}</div>
                            <div className="col-span-3">0.1%</div>
                            <div className="col-span-2">0.5</div>
                            <div className="col-span-5">kworker/u{i}:0</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Pane: NeoVim style */}
        <div className="w-full md:w-1/2 bg-[#1f2335]/95 flex flex-col">
            {/* Vim Tab Line */}
            <div className="bg-[#1a1b26] flex text-xs">
                <div className="px-3 py-1 bg-[#3b4261] text-white font-bold flex items-center gap-2">
                    <span>main.go</span>
                    <span className="bg-gray-700 rounded-full p-0.5"><GitBranch size={8} /></span>
                </div>
                <div className="px-3 py-1 text-gray-500 border-r border-gray-800">pkg/utils.go</div>
                <div className="px-3 py-1 text-gray-500">go.mod</div>
            </div>

            {/* Code Area */}
            <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-6">
                {codeSnippet.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                        <span className="w-8 text-gray-600 select-none text-right pr-4 text-xs">{i + 1}</span>
                        <span className="text-gray-300 whitespace-pre font-ligatures">
                            {line
                                .replace('package', '📦')
                                .replace('func', 'ƒ')
                                .replace('return', '↵')}
                        </span>
                    </div>
                ))}
                <div className="mt-2">
                    <span className="text-blue-400">~</span>
                </div>
                <div className="mt-0">
                    <span className="text-blue-400">~</span>
                </div>
            </div>

            {/* Vim Status Line */}
            <div className="bg-[#414868] text-white text-xs px-2 py-0.5 flex justify-between items-center">
                 <div className="flex gap-4">
                    <span className="bg-[#7aa2f7] text-black px-1 font-bold">NORMAL</span>
                    <span className="text-gray-300 flex items-center gap-1"><GitBranch size={10} /> master</span>
                    <span>main.go</span>
                 </div>
                 <div className="flex gap-4">
                    <span>go</span>
                    <span>utf-8</span>
                    <span>95%</span>
                    <span>24:10</span>
                 </div>
            </div>
        </div>

      </div>

      {/* TMUX Status Bar (Bottom) */}
      <div className="bg-[#15161e] text-[#a9b1d6] text-xs flex items-center h-6">
        <div className="bg-green-500 text-black px-3 py-1 font-bold flex items-center gap-1 h-full">
            <Terminal size={12} />
            <span>0:btop</span>
        </div>
        <div className="bg-[#3b4261] px-3 py-1 h-full flex items-center gap-1 text-white">
             <span>1:nvim*</span>
        </div>
        <div className="flex-1 bg-[#1a1b26] h-full flex items-center px-2">
             <span className="text-gray-500">"portfolio" 14:22 27-Nov-25</span>
        </div>
        
        {/* Right side of status bar */}
        <div className="flex items-center h-full">
             <div className="px-3 bg-[#1a1b26] h-full flex items-center gap-2 border-l border-gray-800">
                <Cpu size={12} className="text-orange-400" />
                <span>32%</span>
             </div>
             <div className="px-3 bg-[#1a1b26] h-full flex items-center gap-2 border-l border-gray-800">
                <Activity size={12} className="text-purple-400" />
                <span>16GB</span>
             </div>
             <div className="px-3 bg-[#24283b] h-full flex items-center gap-2 text-white">
                <Wifi size={12} />
                <span>Wireless</span>
             </div>
             <div className="px-3 bg-[#7aa2f7] h-full flex items-center gap-2 text-black font-bold">
                <Clock size={12} />
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
        </div>
      </div>
    </div>
  );
};
