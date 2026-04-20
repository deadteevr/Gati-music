import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'admin_tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAddTask = async (e: any) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    setAdding(true);
    try {
      await addDoc(collection(db, 'admin_tasks'), {
        title: newTaskTitle,
        assignee: assignee || 'Unassigned',
        status: 'pending', // pending, in_progress, completed
        createdAt: new Date().toISOString()
      });
      setNewTaskTitle('');
      setAssignee('');
    } catch (e) {
      console.error(e);
      alert("Error adding task.");
    } finally {
      setAdding(false);
    }
  };

  const toggleTaskStatus = async (task: any) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'admin_tasks', task.id), { status: nextStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'admin_tasks', taskId), { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteDoc(doc(db, 'admin_tasks', taskId));
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="text-[#ccff00] border border-[#ccff00] px-2 py-0.5 text-[10px] uppercase tracking-widest bg-[#ccff00]/10">Completed</span>;
      case 'in_progress': return <span className="text-[#9d4edd] border border-[#9d4edd] px-2 py-0.5 text-[10px] uppercase tracking-widest bg-[#9d4edd]/10">In Progress</span>;
      default: return <span className="text-gray-400 border border-gray-600 px-2 py-0.5 text-[10px] uppercase tracking-widest">Pending</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="border-b border-[#333] pb-6">
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Admin Tasks</h1>
        <p className="text-gray-400 font-sans text-sm">Create, assign, and track internal workflow tasks</p>
      </div>

      <form onSubmit={handleAddTask} className="bg-[#111] border border-[#333] p-4 flex items-center gap-4">
        <input 
          type="text" 
          placeholder="New Task Description..." 
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          className="flex-1 bg-[#0a0a0a] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-sans"
        />
        <input 
          type="text" 
          placeholder="Assignee (e.g. Aditi)" 
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          className="w-48 bg-[#0a0a0a] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-sans"
        />
        <button 
          disabled={adding || !newTaskTitle}
          className="bg-[#ccff00] text-black px-6 py-3 font-display uppercase tracking-widest text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          <Plus size={16} /> Add 
        </button>
      </form>

      <div className="bg-[#111] border border-[#333] divide-y divide-[#222]">
        {tasks.length === 0 ? (
           <div className="p-8 text-center text-gray-500 font-sans text-sm">
             No tasks exist. Add one above!
           </div>
        ) : tasks.map(task => (
          <div key={task.id} className="p-4 flex items-center justify-between group hover:bg-[#151515] transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => toggleTaskStatus(task)}
                className={`flex-shrink-0 ${task.status === 'completed' ? 'text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
              >
                {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1">
                <p className={`font-sans text-sm ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400 font-display uppercase tracking-widest flex items-center gap-1">
                     <Clock size={12} /> {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-[#9d4edd] font-display uppercase tracking-widest">
                     {task.assignee}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select 
                value={task.status}
                onChange={e => updateTaskStatus(task.id, e.target.value)}
                className="bg-[#0a0a0a] border border-[#333] text-xs text-white p-2 font-display uppercase tracking-widest focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button 
                onClick={() => deleteTask(task.id)}
                className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
