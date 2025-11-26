import { motion } from 'framer-motion';
import { GitBranch, Tag } from 'lucide-react';

const commits = [
  {
    hash: '8e7f2a1',
    msg: 'feat: DevOps Engineer Bootcamp @ Infinity Labs R&D',
    date: '2025 - 2026',
    tag: 'v3.0.0',
    type: 'feat',
    details: 'Intensive mastery of the full DevOps lifecycle. Expertise in Kubernetes orchestration, AWS cloud architecture, and GitOps pipelines using ArgoCD. Advanced automation with Python/Ansible and monitoring with ELK/Prometheus stack.'
  },
  {
    hash: '7f2a9c1',
    msg: 'feat: Software Engineer @ Perion Network',
    date: '2022 - 2024',
    tag: 'v2.4.0',
    type: 'feat',
    details: 'Architected high-throughput microservices processing millions of daily requests. Optimized Java/Spring Boot services on AWS EC2/EKS. Implemented event-driven patterns with RabbitMQ/SQS for resilient asynchronous communication.'
  },
  {
    hash: 'b4d8e2f',
    msg: 'docs: DevOps Introduction Course @ John Bryce',
    date: '2022',
    tag: 'v1.5.0',
    type: 'chore',
    details: 'Foundational training in Linux system administration, shell scripting, and containerization fundamentals with Docker & Kubernetes.'
  },
  {
    hash: 'c9a1b3d',
    msg: 'init: Full Stack Developer Bootcamp @ John Bryce',
    date: '2021 - 2022',
    tag: 'v1.0.0',
    type: 'init',
    details: 'Comprehensive full-stack development. Built production-grade applications using Java Spring Boot, React, Redux, and complex SQL database schemas.'
  }
];

export const GitHistory = () => {
  return (
    <div className="font-mono max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-8 text-gray-500 border-b border-gray-800 pb-2">
        <GitBranch size={18} />
        <span>main</span>
      </div>
      
      <div className="relative border-l-2 border-gray-800 ml-3 space-y-12">
        {commits.map((commit, index) => (
          <motion.div 
            key={commit.hash}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative pl-8"
          >
            {/* Timeline Node */}
            <div className={`
              absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 
              ${commit.type === 'feat' ? 'bg-green-500 border-green-900' : 
                commit.type === 'chore' ? 'bg-blue-500 border-blue-900' : 
                'bg-purple-500 border-purple-900'}
            `} />

            <div className="group cursor-pointer">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                <span className="text-yellow-500 text-sm">{commit.hash}</span>
                <span className="text-gray-400 text-xs">({commit.date})</span>
                {commit.tag && (
                  <span className="flex items-center gap-1 text-xs bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/10">
                    <Tag size={10} /> {commit.tag}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl text-white font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                {commit.msg}
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed bg-black/30 p-4 rounded border border-white/5 group-hover:border-white/20 transition-colors">
                {commit.details}
              </p>
            </div>
          </motion.div>
        ))}
        
        <div className="relative pl-8 pt-4">
           <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-700" />
           <span className="text-gray-600 text-sm">Initial commit</span>
        </div>
      </div>
    </div>
  );
};
