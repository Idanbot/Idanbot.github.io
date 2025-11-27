import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, Circle, XCircle, Terminal, TestTube } from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  type: 'UNIT' | 'INTEGRATION' | 'E2E' | 'SECURITY';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: string;
  logs: string[];
}

const initialSuites: TestSuite[] = [
  {
    id: 't1',
    name: 'Frontend Component Tests',
    type: 'UNIT',
    status: 'pending',
    logs: ['Mounting <WeatherCard />...', 'Mocking API response...', 'Verifying snapshot match... OK', 'Checking event handlers... OK']
  },
  {
    id: 't2',
    name: 'API Contract Verification',
    type: 'INTEGRATION',
    status: 'pending',
    logs: ['PING /health...', 'GET /api/v1/forecast?lat=32&lon=34', 'Validating JSON Schema...', 'Response Time < 50ms... OK']
  },
  {
    id: 't3',
    name: 'End-to-End User Flow',
    type: 'E2E',
    status: 'pending',
    logs: ['Opening headless chrome...', 'Navigating to dashboard...', 'Clicking "Refresh Data"...', 'Verifying chart update... OK']
  },
  {
    id: 't4',
    name: 'Container Security Scan',
    type: 'SECURITY',
    status: 'pending',
    logs: ['Scanning base image alpine:3.18...', 'Checking for CVEs...', 'Analyzing dependencies...', 'No critical vulnerabilities found.']
  }
];

export const TestSection = ({ className }: { className?: string }) => {
  const [suites, setSuites] = useState<TestSuite[]>(initialSuites);
  const [isRunning, setIsRunning] = useState(false);
  const [activeLog, setActiveLog] = useState<string[]>(['Waiting for pipeline execution...']);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [activeLog]);

  const runTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const newSuites = initialSuites.map(s => ({ ...s, status: 'pending' as const })); // Reset
    setSuites(newSuites);
    setActiveLog(['Initializing test runner...', 'Loading configuration...']);

    for (let i = 0; i < newSuites.length; i++) {
      const suite = newSuites[i];
      
      // Set running
      setSuites(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      setActiveLog(prev => [...prev, `\n>>> EXECUTING: ${suite.name}`]);

      // Simulate logs streaming
      for (const log of suite.logs) {
        await new Promise(r => setTimeout(r, 400));
        setActiveLog(prev => [...prev, `[${suite.type}] ${log}`]);
      }

      // Set passed
      setSuites(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'passed', duration: `${Math.floor(Math.random() * 500 + 100)}ms` } : s));
    }

    setActiveLog(prev => [...prev, '\n✅ PIPELINE SUCCESSFUL']);
    setIsRunning(false);
  };

  return (
    <section id="test" className={`py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5 ${className}`}>
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div>
           <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
               <TestTube className="text-purple-500" size={40} />
               <span>Quality <span className="text-gradient">Gate</span></span>
           </h2>
           <p className="text-gray-400 text-lg">
             Automated validation pipeline ensuring production readiness.
           </p>
        </div>
        
        <button
          onClick={runTests}
          disabled={isRunning}
          aria-label={isRunning ? "Test pipeline running" : "Start quality gate pipeline"}
          className={`
            group flex items-center gap-2 px-8 py-4 rounded-lg font-bold tracking-wider uppercase transition-all border
            ${isRunning 
                ? 'bg-gray-800 text-gray-400 border-gray-700 cursor-wait' 
                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'}
          `}
        >
          {isRunning ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" /> : <Play size={18} fill="currentColor" />}
          {isRunning ? 'Running Suite...' : 'Execute Pipeline'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[500px]">
        
        {/* Left: Test Suites List */}
        <div className="lg:col-span-2 bg-[#0f0f13] rounded-xl border border-white/10 p-4 flex flex-col gap-3 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Test Suites</h3>
            {suites.map((suite) => (
                <div key={suite.id} className={`p-4 rounded border transition-all flex items-center justify-between ${ 
                    suite.status === 'running' ? 'bg-purple-500/10 border-purple-500/50' :
                    suite.status === 'passed' ? 'bg-green-500/5 border-green-500/30' :
                    'bg-[#1a1b22] border-white/5'
                }`}>
                    <div className="flex items-center gap-3">
                        {suite.status === 'pending' && <Circle size={18} className="text-gray-600" />}
                        {suite.status === 'running' && <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />}
                        {suite.status === 'passed' && <CheckCircle2 size={18} className="text-green-400" />}
                        {suite.status === 'failed' && <XCircle size={18} className="text-red-400" />}
                        
                        <div>
                            <div className={`text-sm font-bold ${suite.status === 'running' ? 'text-purple-300' : 'text-gray-200'}`}>{suite.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{suite.type}</div>
                        </div>
                    </div>
                    {suite.duration && (
                        <span className="text-xs font-mono text-gray-500">{suite.duration}</span>
                    )}
                </div>
            ))}
        </div>

        {/* Right: Terminal Output */}
        <div className="lg:col-span-3 bg-[#050505] rounded-xl border border-gray-800 flex flex-col overflow-hidden relative">
            {/* Terminal Header */}
            <div className="bg-[#1a1b22] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
                <Terminal size={14} className="text-gray-500" />
                <span className="text-xs text-gray-400 font-mono">runner-output.log</span>
            </div>

            {/* Logs Area */}
            <div 
                ref={logsContainerRef}
                className="flex-1 p-4 font-mono text-xs md:text-sm overflow-y-auto custom-scrollbar bg-black/50"
            >
                <AnimatePresence mode='popLayout'>
                    {activeLog.map((line, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-1 break-all ${ 
                                line.includes('SUCCESS') ? 'text-green-400 font-bold' :
                                line.includes('EXECUTING') ? 'text-purple-400 mt-4 border-b border-purple-900/50 pb-1' :
                                line.includes('[ERROR]') ? 'text-red-400' :
                                'text-gray-400'
                            }`}
                        >
                            <span className="opacity-30 mr-3 select-none">{i + 1}</span>
                            {line}
                        </motion.div>
                    ))}
                    {isRunning && (
                         <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-2 h-4 bg-purple-500 inline-block align-middle ml-1"
                         />
                    )}
                </AnimatePresence>
            </div>
        </div>

      </div>
    </section>
  );
};
