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
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Operational Reporting & Security Audit
          </h2>
          <p className="text-xs text-slate-500">
            Export compliant summaries, track departmental HR workflow velocity, and review LAN audit trails
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            title="Export staff records to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Staff Records CSV</span>
          </button>

          {onExportAuditCsv && (
            <button
              onClick={onExportAuditCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="Export audit trail to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Audit CSV</span>
            </button>
          )}

          {onExportTasksCsv && (
            <button
              onClick={onExportTasksCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="Export tasks to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tasks CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs w-fit">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'METRICS'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          HR Operations & Task Metrics
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {activeTab === 'METRICS' ? (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-600">
                Personnel requests
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {cases.length}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                +14.88% this month
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-600">
                Pending review
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">
                {cases.filter(c => c.status === 'PENDING_ACCEPTANCE').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Requires action
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-600">
                In progress
              </div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
                {cases.filter(c => c.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Under active review
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-600">
                Avg. resolution time
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                4.2 Days
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                98.4% SLA adherence
              </div>
            </div>
          </div>

          {/* Regional workload table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 mb-3">
              Regional youth secretariats workflow
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                  <th className="pb-2 font-normal">Region</th>
                  <th className="pb-2 font-normal">Active Requests</th>
                  <th className="pb-2 font-normal">Monthly Trend</th>
                  <th className="pb-2 font-normal text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.countryBreakdown.map((row) => (
                  <tr key={row.country} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-semibold text-slate-800">
                      {row.country}
                    </td>
                    <td className="py-3 text-slate-900 font-bold tabular-nums">
                      {row.activeCases}
                    </td>
                    <td className="py-3 font-semibold text-xs tabular-nums">
                      <span className={row.trendPositive ? 'text-emerald-600' : 'text-red-500'}>
                        {row.trend}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              {['ALL', 'SUCCESS', 'WARNING', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-4 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">Actor</th>
                  <th className="pb-2.5 font-normal">Action</th>
                  <th className="pb-2.5 font-normal">Target</th>
                  <th className="pb-2.5 font-normal">LAN IP</th>
                  <th className="pb-2.5 font-normal text-right pr-2">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-2.5 font-bold text-slate-800">
                      {log.actor}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-700">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-slate-600 truncate max-w-[200px]" title={log.target}>
                      {log.target}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'WARNING'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
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
              <div className="text-center py-8 text-xs text-slate-400">
                No audit events matching criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
