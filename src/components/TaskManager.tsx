import { Calendar, Mail, Twitter, MessageSquare, Plus, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function TaskManager() {
  const [activeFilter, setActiveFilter] = useState('all');

  const tasks = [
    { id: 1, source: 'discord', content: 'Review Protocol X smart contract audit', priority: 8.5, status: 'pending', dueDate: 'Today' },
    { id: 2, source: 'gmail', content: 'Respond to partnership inquiry from Hedera Foundation', priority: 7.2, status: 'pending', dueDate: 'Tomorrow' },
    { id: 3, source: 'calendar', content: 'Team meeting: Q4 roadmap planning', priority: 6.8, status: 'pending', dueDate: 'Today, 2 PM' },
    { id: 4, source: 'twitter', content: 'Follow up on community feedback about token launch', priority: 5.5, status: 'pending', dueDate: 'This week' },
    { id: 5, source: 'manual', content: 'Prepare presentation for investor call', priority: 9.0, status: 'completed', dueDate: 'Yesterday' },
  ];

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'discord': return MessageSquare;
      case 'gmail': return Mail;
      case 'calendar': return Calendar;
      case 'twitter': return Twitter;
      default: return Circle;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return task.status === 'pending';
    if (activeFilter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Task Manager</h1>
        <p className="text-slate-400">AI-powered task prioritization from all your sources</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Mail, label: 'Gmail', count: 12, color: 'red' },
          { icon: Calendar, label: 'Calendar', count: 5, color: 'blue' },
          { icon: MessageSquare, label: 'Discord', count: 8, color: 'indigo' },
          { icon: Twitter, label: 'Twitter', count: 15, color: 'cyan' },
        ].map((source) => {
          const Icon = source.icon;
          return (
            <div
              key={source.label}
              className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 bg-${source.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${source.color}-400`} />
                </div>
                <div className="text-2xl font-bold">{source.count}</div>
              </div>
              <div className="text-sm text-slate-400">{source.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <div className="font-semibold mb-1">AI Suggestion</div>
            <div className="text-sm text-slate-300">
              3 tasks seem urgent based on their content and deadlines. Would you like me to reprioritize your day?
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full text-xs font-medium transition-all">
                Yes, reprioritize
              </button>
              <button className="px-4 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-full text-xs font-medium transition-all">
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {['all', 'pending', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeFilter === filter
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-all text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const Icon = getSourceIcon(task.source);
            return (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer group"
              >
                <button className="mt-1">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {task.content}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Due: {task.dueDate}</span>
                        <span>•</span>
                        <span className="capitalize">{task.source}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">AI Priority</div>
                    <div className={`text-sm font-bold ${
                      task.priority >= 8 ? 'text-red-400' :
                      task.priority >= 6 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {task.priority}/10
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
