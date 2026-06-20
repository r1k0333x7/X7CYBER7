'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const severityData = [
  { name: 'Critical', value: 2 },
  { name: 'High', value: 4 },
  { name: 'Medium', value: 6 },
  { name: 'Low', value: 8 }
];

const trendData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 72 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 78 }
];

const COLORS = {
  critical: '#FF1744',
  high: '#FF6D00',
  medium: '#FFC400',
  low: '#00E676'
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Dashboard() {
  return (
    <main className="relative w-full">
      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Security Score', value: '78', color: 'cyberneon-blue', icon: '🛡️' },
            { label: 'Scans', value: '24', color: 'cyberneon-purple', icon: '🔍' },
            { label: 'Vulnerabilities', value: '12', color: 'cyberneon-warning', icon: '⚠️' },
            { label: 'Active Assets', value: '8', color: 'cyberneon-success', icon: '✓' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="card-md group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">{stat.label}</p>
                  <p className={`text-2xl sm:text-4xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <span className="text-2xl sm:text-3xl opacity-50 group-hover:opacity-100 transition shrink-0">{stat.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Security Overview */}
            <motion.div variants={itemVariants} className="card-lg overflow-hidden group">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Security Overview</h2>
                <div className="text-right">
                  <p className="text-cyberneon-blue text-xs sm:text-sm">Current Score</p>
                  <p className="text-3xl sm:text-4xl font-bold text-cyberneon-blue">78/100</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-cyberneon-border rounded-full overflow-hidden mb-6 sm:mb-8">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyberneon-blue to-cyberneon-purple rounded-full shadow-glow"
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ delay: 0.6, duration: 1 }}
                />
              </div>

              {/* Severity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                  { label: 'Critical', value: 2, color: 'cyberneon-danger' },
                  { label: 'High', value: 4, color: 'cyberneon-warning' },
                  { label: 'Medium', value: 6, color: 'cyberneon-blue' },
                  { label: 'Low', value: 8, color: 'cyberneon-success' },
                ].map((item, i) => (
                  <div key={i} className="bg-cyberneon-surface/50 rounded-lg p-2 sm:p-3 border border-cyberneon-border hover:border-cyberneon-blue transition">
                    <p className="text-xs text-gray-400 truncate">{item.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold text-${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="w-full h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2A2F4A', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Findings */}
            <motion.div variants={itemVariants} className="card-lg">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Recent Findings</h2>
              <div className="space-y-3">
                {[
                  { title: 'Weak SSL/TLS Config', severity: 'high', url: 'example.com' },
                  { title: 'Missing Security Headers', severity: 'medium', url: 'app.example.com' },
                  { title: 'Outdated Framework', severity: 'high', url: 'api.example.com' },
                  { title: 'CORS Misconfiguration', severity: 'medium', url: 'example.com' },
                ].map((vuln, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-3 sm:p-4 bg-cyberneon-surface/30 border border-cyberneon-border rounded-lg hover:border-cyberneon-blue transition group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base group-hover:text-cyberneon-blue transition truncate">{vuln.title}</p>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">{vuln.url}</p>
                    </div>
                    <span className={`ml-2 shrink-0 text-xs font-semibold whitespace-nowrap px-2 sm:px-3 py-1 rounded-full ${
                      vuln.severity === 'critical' ? 'badge-critical' :
                      vuln.severity === 'high' ? 'badge-high' :
                      'badge-medium'
                    }`}>
                      {vuln.severity === 'high' ? 'High' : 'Med'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Risk Trend */}
            <motion.div variants={itemVariants} className="card-lg">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Security Trend</h2>
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2F4A" />
                    <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2A2F4A', borderRadius: '8px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#00D9FF" 
                      dot={{ fill: '#00D9FF', r: 4 }}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="card-lg">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2 sm:space-y-3">
                <button className="btn-primary w-full justify-center text-center text-sm sm:text-base">
                  🔍 Quick Scan
                </button>
                <button className="btn-secondary w-full justify-center text-center text-sm sm:text-base">
                  🔬 Deep Scan
                </button>
                <button className="btn-secondary w-full justify-center text-center text-sm sm:text-base">
                  📊 Generate Report
                </button>
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div variants={itemVariants} className="card-lg">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { name: 'Scanner', status: 'online' },
                  { name: 'Database', status: 'online' },
                  { name: 'Cache', status: 'online' },
                  { name: 'Threat Feed', status: 'updating' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'online' ? 'bg-cyberneon-success' :
                        item.status === 'updating' ? 'bg-cyberneon-warning animate-pulse' :
                        'bg-cyberneon-danger'
                      }`}></div>
                      <span className="text-xs text-gray-400 capitalize">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Scans */}
            <motion.div variants={itemVariants} className="card-lg">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4">Recent Scans</h3>
              <div className="space-y-2">
                {[
                  { domain: 'example.com', time: '2h ago' },
                  { domain: 'api.example.com', time: '5h ago' },
                  { domain: 'app.example.com', time: '1d ago' },
                ].map((scan, i) => (
                  <div key={i} className="flex justify-between items-center text-gray-300 p-2 sm:p-3 rounded hover:bg-cyberneon-surface/30 cursor-pointer transition text-xs sm:text-sm">
                    <span className="truncate">{scan.domain}</span>
                    <span className="text-cyberneon-blue whitespace-nowrap ml-2">{scan.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
