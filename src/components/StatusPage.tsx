import { CheckCircle, AlertCircle, Server } from 'lucide-react';

export const StatusPage = () => {
  return (
    <section className="py-20 px-6 border-t border-white/5 bg-[#080808]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
                <h3 className="text-xl font-bold text-white mb-1">System Status</h3>
                <p className="text-gray-500 text-sm">Real-time operational metrics</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-mono text-sm font-bold">All Systems Operational</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard 
                label="API Availability" 
                value="99.99%" 
                icon={Server}
                status="good"
                sub="Response: 24ms"
            />
             <StatusCard 
                label="Portfolio CDN" 
                value="Operational" 
                icon={CheckCircle}
                status="good"
                sub="Global Cache Hit"
            />
             <StatusCard 
                label="Current Incident" 
                value="None" 
                icon={AlertCircle}
                status="neutral"
                sub="Last incident: 42 days ago"
            />
        </div>
        
        <div className="mt-8 space-y-1 text-xs text-gray-600 font-mono text-center">
            <p>Incident History: No incidents reported today.</p>
            <p>Scheduled Maintenance: None.</p>
        </div>
      </div>
    </section>
  );
};

const StatusCard = ({ label, value, icon: Icon, status, sub }: any) => {
    return (
        <div className="bg-[#111] border border-white/5 p-6 rounded-lg flex items-start justify-between hover:bg-[#161616] transition-colors">
            <div>
                <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
                <div className={`text-xl font-bold ${status === 'good' ? 'text-white' : 'text-gray-300'}`}>{value}</div>
                <div className="text-xs text-gray-600 mt-2 font-mono">{sub}</div>
            </div>
            <Icon className={status === 'good' ? 'text-green-500' : 'text-gray-500'} size={24} />
        </div>
    )
}
