import React, { useState } from 'react';
import { Download, BarChart2, Shield, FileSpreadsheet, Activity, CheckCircle2, Clock, Search } from 'lucide-react';
import { AuditLog, DashboardData, CaseItem } from '../types.ts';

interface ReportsViewProps {
  auditLogs: AuditLog[];
  dashboardData: DashboardData;
  cases: CaseItem[];
  onExportCsv: () => void;
  onExportAuditCsv?: () => void;
  onExportTasksCsv?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  auditLogs,
  dashboardData,
  cases,
  onExportCsv,
  onExportAuditCsv,
  onExportTasksCsv
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'AUDIT'>('METRICS');
  const [auditSearch, setAuditSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      return (
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-4.5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide">
            Operational Reporting & Security Audit
          </h2>
          <p className="text-xs text-black mt-0.5">
            Export compliant summaries, track departmental HR workflow velocity, and review LAN audit trails
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer"
            title="Export staff records to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Staff Records CSV</span>
          </button>

          {onExportAuditCsv && (
            <button
              onClick={onExportAuditCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 glass-btn-secondary rounded-xl text-xs font-bold transition cursor-pointer"
              title="Export audit trail to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Audit CSV</span>
            </button>
          )}

          {onExportTasksCsv && (
            <button
              onClick={onExportTasksCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 glass-btn-secondary hover:border-[#7738FF] rounded-xl text-xs font-bold transition cursor-pointer"
              title="Export tasks to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5] text-[#7738FF]" />
              <span>Tasks CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 glass-liquid-pill rounded-xl text-xs w-fit">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'METRICS'
              ? 'glass-liquid-nav-active font-bold'
              : 'text-black hover:text-black'
          }`}
        >
          HR Operations & Task Metrics
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'glass-liquid-nav-active font-bold'
              : 'text-black hover:text-black'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {activeTab === 'METRICS' ? (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-liquid-tile glass-card-hover p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <div className="text-xs font-semibold text-black">
                Personnel Requests
              </div>
              <div className="text-2xl font-bold text-black mt-1 tabular-nums tracking-tight">
                {cases.length}
              </div>
              <div className="text-[10px] text-slate-600 font-semibold mt-1">
                {cases.length === 0 ? '0 requests recorded' : `${cases.length} active request(s)`}
              </div>
            </div>

            <div className="glass-liquid-tile glass-card-hover p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <div className="text-xs font-semibold text-black">
                Pending Review
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums tracking-tight">
                {cases.filter(c => c.status === 'PENDING_ACCEPTANCE').length}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                {cases.filter(c => c.status === 'PENDING_ACCEPTANCE').length === 0 ? 'Queue clear' : 'Requires action'}
              </div>
            </div>

            <div className="glass-liquid-tile glass-card-hover p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <div className="text-xs font-semibold text-black">
                In Progress
              </div>
              <div className="text-2xl font-bold text-[#7738FF] mt-1 tabular-nums tracking-tight">
                {cases.filter(c => c.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                {cases.filter(c => c.status === 'IN_PROGRESS').length === 0 ? 'None in progress' : 'Under active review'}
              </div>
            </div>

            <div className="glass-liquid-tile glass-card-hover p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <div className="text-xs font-semibold text-black">
                Avg. Resolution Time
              </div>
              <div className="text-2xl font-bold text-sky-600 mt-1 tabular-nums tracking-tight">
                0 Days
              </div>
              <div className="text-[10px] text-slate-600 font-semibold mt-1">
                100% SLA adherence
              </div>
            </div>
          </div>

          {/* Regional workload table */}
          <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3">
              Regional Youth Secretariats Workflow
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-black text-[11px] border-b border-slate-200/80">
                  <th className="pb-2 font-normal">Region</th>
                  <th className="pb-2 font-normal">Active Requests</th>
                  <th className="pb-2 font-normal">Monthly Trend</th>
                  <th className="pb-2 font-normal text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {dashboardData.countryBreakdown.map((row) => (
                  <tr key={row.country} className="hover:bg-white/[0.035] transition">
                    <td className="py-3 font-semibold text-black">
                      {row.country}
                    </td>
                    <td className="py-3 text-black font-bold tabular-nums font-mono">
                      {row.activeCases}
                    </td>
                    <td className="py-3 font-semibold text-xs tabular-nums font-mono">
                      <span className={row.trendPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {row.trend}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Log Stream */
        <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              {['ALL', 'SUCCESS', 'WARNING', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer border ${
                    statusFilter === st
                      ? 'bg-[#7738FF] text-black font-bold shadow-xs border-[#7738FF]'
                      : 'glass-liquid-pill text-black hover:text-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-4 py-1.5 bg-white/80 text-black hover:bg-white/[0.07] focus:bg-white/[0.09] text-black placeholder-[#A6B0C8]/50 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none w-full sm:w-64 transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-black text-[11px] border-b border-slate-200/80">
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">Actor</th>
                  <th className="pb-2.5 font-normal">Action</th>
                  <th className="pb-2.5 font-normal">Target</th>
                  <th className="pb-2.5 font-normal">LAN IP</th>
                  <th className="pb-2.5 font-normal text-right pr-2">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.035] transition">
                    <td className="py-2.5 font-mono text-[11px] text-[#7738FF] whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-2.5 font-bold text-black">
                      {log.actor}
                    </td>
                    <td className="py-2.5 font-semibold text-black">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-black truncate max-w-[200px]" title={log.target}>
                      {log.target}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-black">
                      {log.ipAddress}
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : log.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-xs text-black">
                No audit events matching criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
