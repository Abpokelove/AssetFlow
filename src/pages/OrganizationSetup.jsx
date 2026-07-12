import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Tag, Users, Plus, Pencil, Trash2,
  Search, MoreHorizontal, Check, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  createCategory,
  createDepartment,
  createEmployee,
  getCategories,
  getDepartments,
  getEmployees,
  updateCategory,
  updateDepartment,
  updateEmployee,
} from '../services/api/organizationService';
import { apiErrorMessage, unwrapList, unwrapPage } from '../services/api/responseUtils';
import { getInitials, formatDate } from '../utils/helpers';

// GET  /api/departments
// POST /api/departments          { name, manager }
// PUT  /api/departments/:id      { name, manager }
// DELETE /api/departments/:id
//
// GET  /api/categories
// POST /api/categories           { name, description }
// PUT  /api/categories/:id
// DELETE /api/categories/:id
//
// GET  /api/employees            ?search=&department=&status=
// POST /api/employees            { name, email, department, role }
// PUT  /api/employees/:id
// DELETE /api/employees/:id

const TABS = [
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'categories', label: 'Asset Categories', icon: Tag },
  { key: 'employees', label: 'Employees', icon: Users },
];

export default function OrganizationSetup() {
  const [activeTab, setActiveTab] = useState('departments');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeError, setEmployeeError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  const loadOrganization = async () => {
    setLoading(true);
    setError(null);
    setEmployeeError(null);
    try {
      const [deptResult, catResult, empResult] = await Promise.allSettled([
        getDepartments(),
        getCategories(),
        getEmployees({ pageSize: 100 }),
      ]);

      if (deptResult.status === 'fulfilled') {
        setDepartments(unwrapList(deptResult.value));
      } else {
        setDepartments([]);
        setError(apiErrorMessage(deptResult.reason, 'Unable to load departments'));
      }

      if (catResult.status === 'fulfilled') {
        setCategories(unwrapList(catResult.value));
      } else {
        setCategories([]);
        setError(apiErrorMessage(catResult.reason, 'Unable to load asset categories'));
      }

      if (empResult.status === 'fulfilled') {
        setEmployees(unwrapPage(empResult.value).data);
      } else {
        setEmployees([]);
        setEmployeeError(
          empResult.reason?.response?.status === 403
            ? 'Your current role does not have permission to view employee records.'
            : apiErrorMessage(empResult.reason, 'Unable to load employee records')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (item) => { setEditTarget(item); setModalOpen(true); };

  const handleDelete = () => {
    toast.error('Delete API is not available in the backend yet.');
    setDeleteTarget(null);
  };

  const handleSave = async (data) => {
    setFormLoading(true);
    try {
      if (activeTab === 'departments') {
        if (editTarget) await updateDepartment(editTarget.id, data);
        else await createDepartment(data);
      }
      if (activeTab === 'categories') {
        if (editTarget) await updateCategory(editTarget.id, data);
        else await createCategory(data);
      }
      if (activeTab === 'employees') {
        if (editTarget) await updateEmployee(editTarget.id, data);
        else await createEmployee(data);
      }

      toast.success(editTarget ? 'Updated successfully' : 'Added successfully');
      setModalOpen(false);
      setEditTarget(null);
      await loadOrganization();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to save organization record'));
    } finally {
      setFormLoading(false);
    }
  };

  const q = search.toLowerCase();
  const filteredDepts = departments.filter((d) => d.name?.toLowerCase().includes(q) || d.manager?.toLowerCase().includes(q));
  const filteredCats = categories.filter((c) => c.name?.toLowerCase().includes(q));
  const filteredEmps = employees.filter((e) => e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q));

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Organization Setup</h1>
          <p className="af-page-subtitle">Manage departments, asset categories, and employee records</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-status-lost/10 border border-status-lost/20 rounded-card">
          <p className="text-sm font-semibold text-status-lost">Unable to load organization data</p>
          <p className="text-xs text-status-lost/80 mt-0.5">{error}</p>
          <Button variant="outline" size="sm" onClick={loadOrganization} className="mt-3">Retry</Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-border/60 rounded-button w-full sm:w-fit mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(''); }}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-[8px] transition-all duration-200 ${
              activeTab === key ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <SearchBar value={search} onChange={setSearch} placeholder={`Search ${activeTab}…`} className="sm:w-72" />
            <Button variant="primary" icon={<Plus size={15} />} onClick={openAdd} className="sm:ml-auto" disabled={activeTab === 'employees' && Boolean(employeeError)}>
              Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
            </Button>
          </div>

          {loading && <p className="text-sm text-text-muted py-8">Loading organization data...</p>}

          {!loading && activeTab === 'employees' && employeeError && (
            <div className="mb-5 p-4 bg-status-lost/10 border border-status-lost/20 rounded-card">
              <p className="text-sm font-semibold text-status-lost">Unable to load employees</p>
              <p className="text-xs text-status-lost/80 mt-0.5">{employeeError}</p>
              <Button variant="outline" size="sm" onClick={loadOrganization} className="mt-3">Retry</Button>
            </div>
          )}

          {/* ---- Departments ---- */}
          {!loading && activeTab === 'departments' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDepts.map((dept) => (
                <Card key={dept.id} padding="p-5" className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 size={18} className="text-primary" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(dept)} className="p-1.5 rounded-button hover:bg-background text-text-secondary hover:text-primary transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget(dept)} className="p-1.5 rounded-button hover:bg-background text-text-secondary hover:text-status-lost transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">{dept.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Manager: {dept.manager}</p>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold text-text-primary">{dept.headCount}</p>
                      <p className="text-[11px] text-text-muted">Employees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-text-primary">{dept.assetCount}</p>
                      <p className="text-[11px] text-text-muted">Assets</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ---- Categories ---- */}
          {!loading && activeTab === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCats.map((cat) => (
                <Card key={cat.id} padding="p-5" className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Tag size={18} className="text-accent" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-button hover:bg-background text-text-secondary hover:text-primary transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-button hover:bg-background text-text-secondary hover:text-status-lost transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">{cat.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{cat.description}</p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-text-muted">{cat.assetCount} <span className="text-text-secondary">assets registered</span></p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ---- Employees ---- */}
          {!loading && activeTab === 'employees' && !employeeError && (
            <div className="overflow-hidden rounded-card border border-border">
              <table className="w-full text-sm">
                <thead className="bg-background">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Employee</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide hidden md:table-cell">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide hidden lg:table-cell">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide hidden sm:table-cell">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Assets</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredEmps.map((emp) => (
                    <tr key={emp.id} className="border-t border-border hover:bg-background/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text-primary">{emp.name}</p>
                            <p className="text-xs text-text-muted">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary hidden md:table-cell">{emp.department}</td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary hidden lg:table-cell">{emp.role}</td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <StatusBadge status={emp.status === 'Active' ? 'Available' : 'Reserved'} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-text-primary">{emp.allocatedAssets}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(emp)} className="p-1.5 rounded-button hover:bg-background text-text-secondary hover:text-primary transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteTarget(emp)} className="p-1.5 rounded-button hover:bg-background text-text-secondary hover:text-status-lost transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ---- Add / Edit Modal ---- */}
      <OrgModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tab={activeTab}
        editTarget={editTarget}
        onSave={handleSave}
        loading={formLoading}
      />

      {/* ---- Delete Confirm ---- */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

/* ---- Inner Modal Component ---- */
function OrgModal({ open, onClose, tab, editTarget, onSave, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    values: editTarget || {},
  });

  const titleMap = {
    departments: editTarget ? 'Edit Department' : 'Add Department',
    categories: editTarget ? 'Edit Category' : 'Add Category',
    employees: editTarget ? 'Edit Employee' : 'Add Employee',
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={titleMap[tab]}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSave)} loading={loading}>
            {editTarget ? 'Save Changes' : 'Add'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
        {tab === 'departments' && (
          <>
            <Input label="Department Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="Manager Name" error={errors.manager?.message} {...register('manager', { required: 'Required' })} />
          </>
        )}
        {tab === 'categories' && (
          <>
            <Input label="Category Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <div>
              <label className="af-label">Description</label>
              <textarea className="af-input resize-none" rows={2} {...register('description')} />
            </div>
          </>
        )}
        {tab === 'employees' && (
          <>
            <Input label="Full Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
            <Input label="Role / Title" error={errors.role?.message} {...register('role', { required: 'Required' })} />
            <Input label="Department" error={errors.department?.message} {...register('department', { required: 'Required' })} />
          </>
        )}
      </form>
    </Modal>
  );
}
