import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  GripVertical,
  AlertCircle,
} from 'lucide-react';

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, removeCategory } = useApp();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim());
    setNewName('');
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const confirmEdit = () => {
    if (editName.trim()) {
      updateCategory(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id) => {
    removeCategory(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Tags className="w-6 h-6 text-primary-600" />
          Activity Categories
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage the activity/task categories available to instructors. Changes take effect immediately.
        </p>
      </div>

      {/* Add New Category */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-text-primary mb-3">Add New Category</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter category name (e.g., Workshop, Seminar...)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus-ring hover:border-primary-300 placeholder:text-text-muted"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all
              ${newName.trim()
                ? 'gradient-primary text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {showAddSuccess && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm animate-slide-down">
            <Check className="w-4 h-4" />
            Category added successfully! It's now available in all instructor dropdowns.
          </div>
        )}
      </div>

      {/* Category List */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary">Current Categories</h2>
          <span className="text-xs font-medium text-text-muted bg-slate-100 px-3 py-1 rounded-full">
            {categories.length} total
          </span>
        </div>

        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all duration-150
                ${editingId === cat.id
                  ? 'border-primary-300 bg-primary-50/50 shadow-sm'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }
              `}
            >
              {/* Drag Handle (visual) */}
              <GripVertical className="w-4 h-4 text-slate-300 shrink-0 cursor-grab" />

              {/* Icon */}
              <span className="text-xl shrink-0">{cat.icon}</span>

              {/* Name / Edit Input */}
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-primary-300 text-sm focus-ring"
                  />
                  <button
                    onClick={confirmEdit}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-text-primary">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {showDeleteConfirm === cat.id ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-600 text-xs font-medium hover:bg-rose-200 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(cat.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No categories yet. Add one above to get started.</p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-primary-800">Real-time Sync</p>
          <p className="text-sm text-primary-600/80">
            Any changes made here are instantly reflected in the instructor's activity dropdown menus.
            No need to refresh or redeploy.
          </p>
        </div>
      </div>
    </div>
  );
}
