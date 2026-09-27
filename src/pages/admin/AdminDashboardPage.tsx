import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Member, Family, Announcement, ParishEvent, AuditLog, AppointmentRequest, Organization } from '../../types';
import {
  Users,
  Home,
  Megaphone,
  Calendar,
  CalendarCheck,
  Bookmark,
  Plus,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [mRes, fRes, aRes, eRes, oRes, aptRes, lRes] = await Promise.all([
          apiRequest<Member[]>('/members').catch(() => []),
          apiRequest<Family[]>('/families').catch(() => []),
          apiRequest<Announcement[]>('/announcements').catch(() => []),
          apiRequest<ParishEvent[]>('/events').catch(() => []),
          apiRequest<Organization[]>('/organizations').catch(() => []),
          apiRequest<AppointmentRequest[]>('/appointments').catch(() => []),
          apiRequest<AuditLog[]>('/audit-logs').catch(() => []),
        ]);
        setMembers(mRes);
        setFamilies(fRes);
        setAnnouncements(aRes);
        setEvents(eRes);
        setOrganizations(oRes);
        setAppointments(aptRes);
        setLogs(lRes.slice(0, 6));
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const activeMembers = members.filter((m) => m.membershipStatus === 'ACTIVE').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Governance Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Parish Administration Dashboard
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Operational overview of census records, parish ministries, liturgical events, and pastoral appointments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-950 font-semibold text-xs border border-amber-200/80">
            Role: {user?.role}
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Members</span>
            <Users className="w-4 h-4 text-amber-900" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {loading ? '...' : members.length}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {activeMembers} Active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Families</span>
            <Home className="w-4 h-4 text-amber-900" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {loading ? '...' : families.length}
          </div>
          <span className="text-[10px] text-stone-500">Parish Units</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Notices</span>
            <Megaphone className="w-4 h-4 text-amber-900" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {loading ? '...' : announcements.length}
          </div>
          <span className="text-[10px] text-stone-500">Bulletins</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Events</span>
            <Calendar className="w-4 h-4 text-amber-900" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {loading ? '...' : events.length}
          </div>
          <span className="text-[10px] text-stone-500">Scheduled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Ministries</span>
            <Bookmark className="w-4 h-4 text-amber-900" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {loading ? '...' : organizations.length}
          </div>
          <span className="text-[10px] text-stone-500">Organizations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Appointments</span>
            <CalendarCheck className="w-4 h-4 text-amber-900" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {loading ? '...' : appointments.length}
          </div>
          <span className="text-[10px] text-amber-800 font-semibold">
            {pendingAppointments} Pending
          </span>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-700">
          Quick Administrative Actions
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/admin/members')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
          <button
            onClick={() => navigate('/admin/families')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Family</span>
          </button>
          <button
            onClick={() => navigate('/admin/announcements')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Announcement</span>
          </button>
          <button
            onClick={() => navigate('/admin/events')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
          <button
            onClick={() => navigate('/admin/gallery')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Photos</span>
          </button>
          <button
            onClick={() => navigate('/admin/documents')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Pending Appointments & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Requiring Review */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Pastoral Appointments Awaiting Action
            </h2>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="text-xs text-amber-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No appointments pending.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => navigate('/admin/appointments')}
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/70 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-0.5">
                      <strong className="text-stone-900">{apt.memberName}</strong>
                      <span className="text-stone-400">·</span>
                      <span className="text-amber-900 font-medium">
                        {apt.reason.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {apt.preferredDate} at {apt.preferredTime}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    apt.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit / Activity Logs */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-900" />
              <span>System Activity & Audit Log</span>
            </h2>
            <button
              onClick={() => navigate('/admin/activity-logs')}
              className="text-xs text-amber-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200/60 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-stone-400 font-normal">by {log.userName}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-editorial mt-0.5">
                    {log.details}
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-mono shrink-0">
                  {log.timestamp.split('T')[1]?.slice(0, 5) || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
