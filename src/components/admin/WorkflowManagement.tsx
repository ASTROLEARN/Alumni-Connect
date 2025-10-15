'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Activity,
  CheckSquare,
  Square,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Tag,
  Paperclip,
  MessageCircle,
  History,
  Bell,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';


interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'content_approval' | 'user_verification' | 'event_management' | 'job_posting' | 'mentorship' | 'reporting';
  status: 'active' | 'draft' | 'archived';
  isActive: boolean;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  executionCount: number;
  successRate: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automatic' | 'conditional' | 'approval' | 'notification';
  assigneeType: 'specific_user' | 'role' | 'system' | 'dynamic';
  assigneeId?: string;
  assigneeRole?: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  order: number;
  isRequired: boolean;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  dueIn?: number; // hours
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  event?: string;
  schedule?: string;
  webhookUrl?: string;
  isActive: boolean;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

interface WorkflowAction {
  type: 'send_email' | 'send_notification' | 'update_record' | 'create_record' | 'call_webhook';
  parameters: Record<string, any>;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  progress: number;
  assignees: Array<{
    userId: string;
    name: string;
    role: string;
    stepId: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  metadata?: Record<string, any>;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'workflow_step' | 'manual' | 'approval' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigneeId?: string;
  assigneeName?: string;
  assigneeRole?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  workflowInstanceId?: string;
  workflowStepId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
  }>;
  tags: string[];
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export default function WorkflowManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'workflows' | 'instances' | 'tasks' | 'audit'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  useEffect(() => {
    const initializeSocket = () => {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
        path: '/api/socketio'
      });
      setSocket(socketInstance);

      if (user) {
        socketInstance.emit('authenticate', {
          userId: user.id,
          role: user.role,
        });
      }

      // Real-time workflow updates
      socketInstance.on('workflow_started', (instance: WorkflowInstance) => {
        setInstances(prev => [instance, ...prev]);
      });

      socketInstance.on('workflow_step_completed', (data: { instanceId: string; stepId: string; completedBy: string }) => {
        setInstances(prev =>
          prev.map(instance =>
            instance.id === data.instanceId
              ? { ...instance, currentStep: instance.currentStep + 1 }
              : instance
          )
        );
      });

      socketInstance.on('workflow_completed', (instanceId: string) => {
        setInstances(prev =>
          prev.map(instance =>
            instance.id === instanceId
              ? { ...instance, status: 'completed', completedAt: new Date().toISOString() }
              : instance
          )
        );
      });

      socketInstance.on('task_assigned', (task: Task) => {
        setTasks(prev => [task, ...prev]);
      });

      socketInstance.on('audit_log', (log: AuditLog) => {
        setAuditLogs(prev => [log, ...prev]);
      });

      return () => {
        socketInstance.disconnect();
      };
    };

    initializeSocket();
  }, [user]);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const [workflowsRes, instancesRes, tasksRes, auditRes] = await Promise.all([
        fetch('/api/admin/workflows'),
        fetch('/api/admin/workflow-instances'),
        fetch('/api/admin/tasks'),
        fetch('/api/admin/audit-logs')
      ]);

      if (workflowsRes.ok) setWorkflows(await workflowsRes.json());
      if (instancesRes.ok) setInstances(await instancesRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (error) {
      console.error('Error fetching workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startedBy: user?.id })
      });

      if (response.ok) {
        const instance = await response.json();
        setInstances(prev => [instance, ...prev]);
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  const completeStep = async (instanceId: string, stepId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/workflow-instances/${instanceId}/steps/${stepId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completedBy: user?.id,
          notes 
        })
      });

      if (response.ok) {
        // Socket will handle real-time updates
        fetchTaskData();
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const assignTask = async (taskId: string, assigneeId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId, assignedBy: user?.id })
      });

      if (response.ok) {
        setTasks(prev =>
          prev.map(task =>
            task.id === taskId
              ? { ...task, assigneeId, status: 'in_progress' }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedBy: user?.id })
      });

      if (response.ok) {
        setTasks(prev =>
          prev.map(task =>
            task.id === taskId
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const fetchTaskData = async () => {
    try {
      const response = await fetch('/api/admin/tasks');
      if (response.ok) {
        setTasks(await response.json());
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Users className="h-4 w-4" />;
      case 'automatic': return <Settings className="h-4 w-4" />;
      case 'approval': return <CheckSquare className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'conditional': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading workflow management...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Workflow Management</h1>
              <p className="text-slate-600 mt-2">Approval workflows, task assignment, and audit trails</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowCreateWorkflow(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Workflow</span>
              </Button>
              <Button onClick={fetchWorkflowData} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p>
                    <p className="text-sm text-slate-600">Active Workflows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{instances.filter(i => i.status === 'running').length}</p>
                    <p className="text-sm text-slate-600">Running Instances</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
                    <p className="text-sm text-slate-600">Pending Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {workflows.length > 0 
                        ? Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)
                        : 0
                      }%
                    </p>
                    <p className="text-sm text-slate-600">Avg Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'workflows', label: 'Workflows', icon: Activity, count: workflows.length },
            { id: 'instances', label: 'Instances', icon: Clock, count: instances.length },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
            { id: 'audit', label: 'Audit Trail', icon: History, count: auditLogs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge className="bg-blue-500 text-white text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              {activeTab === 'workflows' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="content_approval">Content Approval</option>
                  <option value="user_verification">User Verification</option>
                  <option value="event_management">Event Management</option>
                  <option value="job_posting">Job Posting</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="reporting">Reporting</option>
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {workflow.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                        <Badge variant="outline">{workflow.category}</Badge>
                      </div>
                    </div>
                    <CardDescription>{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Steps: {workflow.steps.length}</span>
                        <span className="text-slate-600">Executions: {workflow.executionCount}</span>
                        <span className="text-slate-600">Success: {workflow.successRate}%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">Workflow Steps:</div>
                        <div className="space-y-1">
                          {workflow.steps.slice(0, 3).map((step) => (
                            <div key={step.id} className="flex items-center space-x-2 text-sm">
                              {getStepIcon(step.type)}
                              <span>{step.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {step.type}
                              </Badge>
                            </div>
                          ))}
                          {workflow.steps.length > 3 && (
                            <div className="text-xs text-slate-500">
                              +{workflow.steps.length - 3} more steps
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Created {new Date(workflow.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => startWorkflow(workflow.id)}>
                            Start
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instances Tab */}
          {activeTab === 'instances' && (
            <div className="space-y-4">
              {instances.map((instance) => (
                <Card key={instance.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{instance.workflowName}</h3>
                          <Badge className={getStatusColor(instance.status)}>
                            {instance.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          Started by {instance.startedBy} • {new Date(instance.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Step {instance.currentStep} of {instance.totalSteps}
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.round(instance.progress)}% complete
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${instance.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Assignees */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-slate-700 mb-2">Current Assignees:</div>
                      <div className="flex flex-wrap gap-2">
                        {instance.assignees.map((assignee) => (
                          <Badge key={assignee.userId} variant="outline" className="text-xs">
                            {assignee.name} ({assignee.role})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        {instance.completedAt && (
                          <>Completed {new Date(instance.completedAt).toLocaleString()}</>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        {instance.status === 'running' && (
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>Created by {task.createdBy}</span>
                          {task.assigneeName && (
                            <span>Assigned to {task.assigneeName}</span>
                          )}
                          {task.dueDate && (
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    {task.comments.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="text-sm font-medium text-slate-700 mb-2">Recent Comments:</div>
                        <div className="space-y-2">
                          {task.comments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{comment.authorName}:</span>
                                <span className="text-slate-600">{comment.content}</span>
                                <span className="text-slate-400">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{log.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.userRole}
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {log.action.toLowerCase()} {log.resourceType}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            Resource ID: {log.resourceId}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                          </div>
                          
                          {/* Value Changes */}
                          {(log.oldValues || log.newValues) && (
                            <div className="mt-3 p-3 bg-slate-50 rounded text-xs">
                              <div className="font-medium mb-1">Changes:</div>
                              {Object.entries(log.oldValues || {}).map(([key, oldValue]) => {
                                const newValue = log.newValues?.[key];
                                return (
                                  <div key={key} className="flex items-center space-x-2">
                                    <span className="font-medium">{key}:</span>
                                    <span className="text-red-600 line-through">
                                      {String(oldValue)}
                                    </span>
                                    <span>→</span>
                                    <span className="text-green-600">
                                      {String(newValue)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.userAgent && (
                          <div className="max-w-xs truncate">{log.userAgent}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}