import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  UserCircle, Mail, Building2, Briefcase, Calendar,
  Package, Pencil, LogOut, Shield, Bell, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { getAllocations } from '../services/api/allocationService';
import { getCurrentUser } from '../services/api/authService';
import { getEmployeeById, updateEmployee } from '../services/api/organizationService';
import { apiErrorMessage, unwrapData, unwrapPage } from '../services/api/responseUtils';
import { getInitials, formatDate, timeAgo } from '../utils/helpers';

// GET /api/auth/me             → User profile
// PUT /api/auth/me             → { name, email, phone, ... }
// GET /api/employees/:id/allocations → Allocation[]
// GET /api/notifications?limit=5    → recent notifications

export default function EmployeeProfile() {
  const { user, logout, updateProfile } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState(user);
  const [myAllocations, setMyAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: profile?.name, email: profile?.email, role: profile?.role, department: profile?.department },
  });

  const myNotifications = notifications.slice(0, 4);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentRes = await getCurrentUser();
        const currentUser = currentRes.data?.user || currentRes.data || user;
        const [employeeRes, allocationRes] = await Promise.all([
          getEmployeeById(currentUser.id),
          getAllocations({ pageSize: 100 }),
        ]);
        if (cancelled) return;

        const employee = unwrapData(employeeRes, currentUser);
        setProfile(employee);
        reset({
          name: employee?.name,
          email: employee?.email,
          role: employee?.role,
          department: employee?.department,
        });
        setMyAllocations(unwrapPage(allocationRes).data.filter((allocation) => allocation.employeeId === currentUser.id && allocation.status === 'Active'));
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, 'Unable to load profile'));
          setProfile(user);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user?.id) loadProfile();

    return () => {
      cancelled = true;
    };
  }, [reset, user]);

  const handleUpdate = async (data) => {
    setProfileLoading(true);
    try {
      const response = await updateEmployee(profile.id, data);
      const updated = unwrapData(response, { ...profile, ...data });
      setProfile(updated);
      await updateProfile(updated);
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to update profile'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-text-muted" />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="af-page max-w-screen-lg mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">My Profile</h1>
          <p className="af-page-subtitle">View and manage your account details</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>Edit Profile</Button>
          <Button variant="danger" icon={<LogOut size={14} />} onClick={handleLogout}>Sign Out</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {error && (
          <div className="lg:col-span-3 p-4 bg-status-lost/10 border border-status-lost/20 rounded-card">
            <p className="text-sm font-semibold text-status-lost">Unable to load profile</p>
            <p className="text-xs text-status-lost/80 mt-0.5">{error}</p>
          </div>
        )}
        {/* Left: Profile Card */}
        <div className="space-y-5">
          <Card padding="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-3">
                {getInitials(profile?.name || 'U')}
              </div>
              <h2 className="text-lg font-bold text-text-primary">{profile?.name}</h2>
              <p className="text-sm text-text-secondary">{profile?.role}</p>
              <div className="mt-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {profile?.department || 'No department'}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <InfoRow icon={Mail} label="Email" value={profile?.email} />
              <InfoRow icon={Briefcase} label="Employee ID" value={profile?.id || profile?.employeeId} />
              <InfoRow icon={Building2} label="Department" value={profile?.department} />
            </div>
          </Card>

          {/* Quick stats */}
          <Card padding="p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">My Assets</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-button p-3 text-center">
                <p className="text-2xl font-bold text-primary">{myAllocations.length}</p>
                <p className="text-xs text-text-muted">Allocated</p>
              </div>
              <div className="bg-background rounded-button p-3 text-center">
                <p className="text-2xl font-bold text-status-available">0</p>
                <p className="text-xs text-text-muted">Returned</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Details + allocations */}
        <div className="lg:col-span-2 space-y-5">
          {/* Allocated Assets */}
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">My Allocated Assets</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/allocation')}>View All</Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-8 text-text-muted">
                <p className="text-sm">Loading allocated assets...</p>
              </div>
            ) : myAllocations.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-text-muted">
                <Package size={28} className="mb-2 opacity-40" />
                <p className="text-sm">No assets currently allocated</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAllocations.map((alc) => (
                  <div key={alc.id} className="flex items-center gap-3 p-3 bg-background rounded-button">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{alc.assetName}</p>
                      <p className="text-xs text-text-muted font-mono">{alc.assetTag}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status="Allocated" size="sm" />
                      <p className="text-xs text-text-muted mt-1">Since {formatDate(alc.allocatedDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Notifications */}
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Recent Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>View All</Button>
            </div>
            <div className="space-y-2">
              {myNotifications.map((n) => (
                <div key={n.id} className={`flex gap-3 p-3 rounded-button transition-colors ${!n.read ? 'bg-primary/5' : 'hover:bg-background'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{n.message}</p>
                    <p className="text-xs text-text-muted mt-0.5">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Security section */}
          <Card padding="p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-button">
                <div className="flex items-center gap-2.5">
                  <Shield size={15} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Password</p>
                    <p className="text-xs text-text-secondary">Last changed 90 days ago</p>
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline font-medium">Change</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-button">
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                    <p className="text-xs text-text-secondary">Maintenance, returns, and audits</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 cursor-pointer">
                  <div className="w-9 h-5 bg-status-available rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={profileLoading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(handleUpdate)} loading={profileLoading}>Save Changes</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Full Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Role / Title" {...register('role')} />
          <Input label="Department" {...register('department')} />
        </form>
      </Modal>
    </div>
  );
}
