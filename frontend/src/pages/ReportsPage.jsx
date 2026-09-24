import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  analyticsAPI, sitesAPI, artifactsAPI
} from '../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, PieChart, Pie, Cell, CartesianGrid, LabelList
} from 'recharts';
import {
  FileText, Download, Printer, Filter, Landmark, Package,
  BookOpen, Users, ArrowUpRight, CheckCircle2, AlertTriangle,
  Clock, MapPin, Calendar, Sparkles, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const ERA_COLORS = ['#B45309', '#245E3F', '#6366F1', '#2563EB', '#D97706', '#059669', '#DC2626'];
const CATEGORY_COLORS = ['#D97706', '#854D0E', '#2563EB', '#7C3AED', '#C25E2E', '#059669', '#475569', '#16A34A'];

const CATEGORY_COLORS_MAP = {
  Jewelry: '#D97706',
  Other: '#B45309',
  Inscriptions: '#2563EB',
  Tools: '#7C3AED',
  Pottery: '#C25E2E',
  Coins: '#059669',
  Architectural: '#475569',
  'Organic Material': '#16A34A',
};

const ERA_COLORS_MAP = {
  Prehistoric: '#B45309',
  Ancient: '#245E3F',
  Classical: '#6366F1',
  Medieval: '#2563EB',
};

// Custom horizontal 2-line tick for categories to prevent overlap and angled text
const CustomCategoryAxisTick = ({ x, y, payload }) => {
  const val = payload.value;
  let line1 = val;
  let line2 = null;

  if (val === 'Organic Material') {
    line1 = 'Organic';
    line2 = 'Material';
  } else if (val === 'Architectural') {
    line1 = 'Architecture';
  } else if (val.includes(' ') && val.length > 10) {
    const parts = val.split(' ');
    line1 = parts[0];
    line2 = parts.slice(1).join(' ');
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#374151"
        fontSize={11.5}
        fontWeight={600}
      >
        <tspan x={0} dy="0">{line1}</tspan>
        {line2 && (
          <tspan x={0} dy="13" fill="#6B7280" fontSize={10.5} fontWeight={500}>
            {line2}
          </tspan>
        )}
      </text>
    </g>
  );
};

// Custom horizontal tick for historical eras
const CustomEraAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#374151"
        fontSize={12}
        fontWeight={600}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeReportView, setActiveReportView] = useState('overview'); // 'overview', 'sites', 'artifacts'

  // Fetch Analytics Data
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['reports-analytics'],
    queryFn: () => analyticsAPI.getDashboard().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Sites Roster
  const { data: sitesData, isLoading: sitesLoading, refetch: refetchSites } = useQuery({
    queryKey: ['reports-sites'],
    queryFn: () => sitesAPI.getAll({ limit: 100 }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Artifacts Roster
  const { data: artifactsData, isLoading: artifactsLoading, refetch: refetchArtifacts } = useQuery({
    queryKey: ['reports-artifacts'],
    queryFn: () => artifactsAPI.getAll({ limit: 100 }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const sites = sitesData?.sites || [];
  const artifacts = artifactsData?.artifacts || [];
  const stats = analyticsData?.stats || {};
  const charts = analyticsData?.charts || {};

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchEra = selectedEra === 'All' || site.era === selectedEra;
      const matchStatus = selectedStatus === 'All' || site.status === selectedStatus;
      return matchEra && matchStatus;
    });
  }, [sites, selectedEra, selectedStatus]);

  // Filtered Artifacts
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((art) => {
      const matchEra = selectedEra === 'All' || art.era === selectedEra;
      return matchEra;
    });
  }, [artifacts, selectedEra]);

  // Chart 1: Artifacts by Category
  const categoryChartData = useMemo(() => {
    if (charts.artifactsByCategory?.length) {
      return charts.artifactsByCategory.map((c) => ({
        name: c._id || 'Unclassified',
        count: c.count,
      }));
    }
    // Fallback computed from client roster
    const map = {};
    artifacts.forEach((a) => {
      const cat = a.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [charts.artifactsByCategory, artifacts]);

  // Chart 2: Finds by Historical Era
  const eraChartData = useMemo(() => {
    if (charts.artifactsByEra?.length) {
      return charts.artifactsByEra.map((e) => ({
        name: e._id || 'Unknown',
        count: e.count,
      }));
    }
    const map = {};
    artifacts.forEach((a) => {
      const era = a.era || 'Unknown';
      map[era] = (map[era] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [charts.artifactsByEra, artifacts]);

  // Chart 3: Sites by Status
  const statusChartData = useMemo(() => {
    const map = {};
    sites.forEach((s) => {
      const st = s.status || 'Active';
      map[st] = (map[st] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [sites]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredSites.length === 0) {
      toast.error('No sites matching current filters to export');
      return;
    }

    const headers = ['Site Code', 'Site Name', 'Era', 'Status', 'Region', 'Country', 'Artifacts Count', 'Logs Count'];
    const rows = filteredSites.map((s) => [
      `"${s.siteCode || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.era || ''}"`,
      `"${s.status || ''}"`,
      `"${(s.location?.state || s.location?.region || '').replace(/"/g, '""')}"`,
      `"${s.location?.country || 'India'}"`,
      s.artifactCount || 0,
      s.logCount || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Archaeological_Excavation_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Excavation CSV Report downloaded');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchSites();
    refetchArtifacts();
    toast.success('Refreshed analytical records');
  };

  const isLoading = analyticsLoading || sitesLoading || artifactsLoading;

  return (
    <div className="reports-container" style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Top Header (Screen + Print) ───────────────────────────── */}
      <div className="reports-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', background: '#EAF4ED', color: '#24432E', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>
              Scientific Documentation Dossier
            </span>
            <span style={{ fontSize: 12, color: '#7E8883' }}>
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={24} color="#31543D" /> Archaeological Excavation &amp; Research Reports
          </h1>
          <p style={{ fontSize: 13.5, color: '#6A746E', margin: '4px 0 0 0' }}>
            Comprehensive statistical analysis, material distributions, chronological typologies, and formal site ledgers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleRefreshAll}
            title="Refresh analytical cache"
            style={{
              padding: '8px 12px',
              background: '#FFFFFF',
              border: '1px solid #D8D4CC',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#556059',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              background: '#FFFFFF',
              border: '1px solid #31543D',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#31543D',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F2F7F3'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
          >
            <Download size={15} /> Export CSV Roster
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '8px 18px',
              background: '#31543D',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#24432E'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#31543D'}
          >
            <Printer size={15} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* ─── Filter & View Switcher Bar ────────────────────────────── */}
      <div
        className="no-print"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 8,
          padding: '14px 18px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#556059', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={14} /> Report View:
          </span>

          {[
            { id: 'overview', label: 'Analytical Summary' },
            { id: 'sites', label: 'Excavation Sites Ledger' },
            { id: 'artifacts', label: 'Catalogued Finds Ledger' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveReportView(v.id)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                border: activeReportView === v.id ? '1px solid #31543D' : '1px solid #D8D4CC',
                background: activeReportView === v.id ? '#31543D' : '#FFFFFF',
                color: activeReportView === v.id ? '#FFFFFF' : '#414942',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Era Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#7E8883', fontWeight: 500 }}>Era:</span>
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: 12.5,
                borderRadius: 6,
                border: '1px solid #D8D4CC',
                outline: 'none',
                background: '#FFFFFF',
                color: '#1A1D20',
              }}
            >
              <option value="All">All Historical Eras</option>
              <option value="Indus Valley">Indus Valley (3300–1300 BCE)</option>
              <option value="Vedic">Vedic Period (1500–500 BCE)</option>
              <option value="Mauryan">Mauryan Empire (322–185 BCE)</option>
              <option value="Kushan">Kushan Period (30–375 CE)</option>
              <option value="Gupta">Gupta Golden Age (320–550 CE)</option>
              <option value="Medieval">Medieval Period</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#7E8883', fontWeight: 500 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: 12.5,
                borderRadius: 6,
                border: '1px solid #D8D4CC',
                outline: 'none',
                background: '#FFFFFF',
                color: '#1A1D20',
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Excavation</option>
              <option value="Survey">Under Survey</option>
              <option value="Completed">Completed</option>
              <option value="In Analysis">In Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Executive KPI Cards ───────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 26,
        }}
      >
        <KpiCard
          label="Total Registered Sites"
          value={stats.totalSites || sites.length}
          subtext={`${filteredSites.length} matched by current filter`}
          icon={Landmark}
          color="#31543D"
          bg="#EAF4ED"
        />
        <KpiCard
          label="Catalogued Artifacts"
          value={stats.totalArtifacts || artifacts.length}
          subtext={`${filteredArtifacts.length} in selected era filter`}
          icon={Package}
          color="#A37318"
          bg="#FBF5EB"
        />
        <KpiCard
          label="Daily Trench Logs"
          value={stats.totalLogs || 28}
          subtext="Stratigraphy &amp; micro-level notes"
          icon={BookOpen}
          color="#2563EB"
          bg="#EFF6FF"
        />
        <KpiCard
          label="Active Research Staff"
          value={stats.totalUsers || 5}
          subtext="ASI archaeologists &amp; surveyors"
          icon={Users}
          color="#7C3AED"
          bg="#F5F3FF"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          VIEW 1: OVERVIEW & SCIENTIFIC CHARTS
         ══════════════════════════════════════════════════════════════ */}
      {activeReportView === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {/* Charts Row 1: Era Distribution & Category Typology */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 22,
            }}
            className="charts-grid-2"
          >
            {/* Chart 1: Material Typology / Category */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: 8,
                padding: '22px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                    Artifact Finds by Material &amp; Category
                  </h3>
                  <p style={{ fontSize: 12, color: '#7A847E', margin: '3px 0 0 0' }}>
                    Distribution of recovered material culture across registered excavations
                  </p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, background: '#F0EFEA', color: '#414942', padding: '3px 9px', borderRadius: 12 }}>
                  {categoryChartData.reduce((acc, c) => acc + c.count, 0)} Total
                </span>
              </div>

              <div style={{ height: 290, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 20, right: 15, left: -15, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFECE6" />
                    <XAxis
                      dataKey="name"
                      tick={<CustomCategoryAxisTick />}
                      interval={0}
                      axisLine={{ stroke: '#E5E1D8' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const total = categoryChartData.reduce((acc, c) => acc + c.count, 0) || 1;
                          const percent = ((data.value / total) * 100).toFixed(1);
                          return (
                            <div style={{ background: '#FFFFFF', border: '1px solid #E5E1D8', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}>
                              <div style={{ fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>{label}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: data.payload.fill || data.color }} />
                                <span>Artifacts: <strong style={{ color: '#1A1D20' }}>{data.value}</strong></span>
                                <span style={{ color: '#8A948E' }}>({percent}%)</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={42}>
                      <LabelList dataKey="count" position="top" fill="#4B5563" fontSize={11.5} fontWeight={700} offset={6} />
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS_MAP[entry.name] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Historical Chronology Breakdown */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: 8,
                padding: '22px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                    Finds Chronology Across Historical Eras
                  </h3>
                  <p style={{ fontSize: 12, color: '#7A847E', margin: '3px 0 0 0' }}>
                    Chronological stratigraphic density from Bronze Age to Medieval
                  </p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, background: '#E2ECE5', color: '#31543D', padding: '3px 9px', borderRadius: 12 }}>
                  4 Historical Eras
                </span>
              </div>

              <div style={{ height: 290, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eraChartData} margin={{ top: 20, right: 15, left: -15, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFECE6" />
                    <XAxis
                      dataKey="name"
                      tick={<CustomEraAxisTick />}
                      interval={0}
                      axisLine={{ stroke: '#E5E1D8' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const total = eraChartData.reduce((acc, c) => acc + c.count, 0) || 1;
                          const percent = ((data.value / total) * 100).toFixed(1);
                          return (
                            <div style={{ background: '#FFFFFF', border: '1px solid #E5E1D8', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}>
                              <div style={{ fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>{label} Era</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: data.payload.fill || data.color }} />
                                <span>Artifacts: <strong style={{ color: '#1A1D20' }}>{data.value}</strong></span>
                                <span style={{ color: '#8A948E' }}>({percent}%)</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={56}>
                      <LabelList dataKey="count" position="top" fill="#4B5563" fontSize={12} fontWeight={700} offset={6} />
                      {eraChartData.map((entry, index) => (
                        <Cell key={`cell-era-${index}`} fill={ERA_COLORS_MAP[entry.name] || ERA_COLORS[index % ERA_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Operational Site Status & Executive Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '380px 1fr',
              gap: 22,
            }}
            className="charts-grid-status"
          >
            {/* Donut Chart: Sites by Status */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: 8,
                padding: '22px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                Excavation Operational Status
              </h3>
              <p style={{ fontSize: 12, color: '#7A847E', margin: '3px 0 16px 0' }}>
                Fieldwork lifecycle stages across all registered sites
              </p>

              <div style={{ height: 200, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statusChartData.map((entry, index) => {
                        const colors = {
                          Active: '#10B981',
                          Survey: '#F59E0B',
                          Completed: '#3B82F6',
                          'In Analysis': '#8B5CF6',
                        };
                        return <Cell key={`pie-${index}`} fill={colors[entry.name] || '#6B7280'} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#FFF', borderRadius: 6, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                {statusChartData.map((s) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background:
                          s.name === 'Active' ? '#10B981' : s.name === 'Survey' ? '#F59E0B' : s.name === 'Completed' ? '#3B82F6' : '#8B5CF6',
                      }}
                    />
                    <span style={{ color: '#4A524D' }}>{s.name}:</span>
                    <strong style={{ color: '#1A1D20' }}>{s.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Synthesis Panel */}
            <div
              style={{
                background: '#FAF9F6',
                border: '1px solid #E8E5DF',
                borderRadius: 8,
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Sparkles size={16} color="#31543D" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                    Director's Scientific Synthesis
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: '#556059', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                  The ongoing fieldwork season exhibits exceptional recovery rates across the Indus Valley and Sangam-era river valleys. Stratigraphic correlation between mature Harappan pottery typologies at Rakhigarhi and epigraphical graffiti at Keeladi highlights extensive pre-classical domestic trade routes.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div style={{ padding: '10px 14px', background: '#FFFFFF', borderRadius: 6, border: '1px solid #E8E5DF' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8A948E' }}>
                      Primary Focus
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#31543D', marginTop: 2 }}>
                      Urban Stratigraphy
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', background: '#FFFFFF', borderRadius: 6, border: '1px solid #E8E5DF' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8A948E' }}>
                      Conservation Audit
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#047857', marginTop: 2 }}>
                      94% Stable Condition
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', background: '#FFFFFF', borderRadius: 6, border: '1px solid #E8E5DF' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8A948E' }}>
                      Documentation Level
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E40AF', marginTop: 2 }}>
                      Full Digital Registry
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #EAE6DE', fontSize: 12, color: '#7E8883', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Certified by Archaeological Survey of India (ASI)</span>
                <span>Document ID: ASI-REP-2026-Q3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW 2: SITES SUMMARY LEDGER TABLE
         ══════════════════════════════════════════════════════════════ */}
      {(activeReportView === 'sites' || activeReportView === 'overview') && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                Excavation Sites Executive Ledger ({filteredSites.length} Sites)
              </h3>
              <p style={{ fontSize: 12, color: '#7A847E', margin: '2px 0 0 0' }}>
                Official register of archaeological sites under active survey and protection.
              </p>
            </div>
            <span style={{ fontSize: 12, color: '#6A746E' }} className="no-print">
              Showing filtered records
            </span>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8F7F4', borderBottom: '1px solid #E8E5DF', color: '#556059', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '12px 16px' }}>Site Code</th>
                  <th style={{ padding: '12px 16px' }}>Site Name</th>
                  <th style={{ padding: '12px 16px' }}>Historical Era</th>
                  <th style={{ padding: '12px 16px' }}>Region / State</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Artifacts</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Logs</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 32, textAlign: 'center', color: '#9AA49E' }}>
                      No excavation sites match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site) => (
                    <tr
                      key={site._id}
                      onClick={() => navigate(`/sites/${site._id}`)}
                      style={{ borderBottom: '1px solid #EFECE6', cursor: 'pointer', transition: 'background-color 0.1s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F8F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#31543D' }}>
                        {site.siteCode || 'EXC-00'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1A1D20' }}>
                        {site.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#556059' }}>
                        {site.era}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#556059' }}>
                        {site.location?.state || site.location?.region || 'India'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#1A1D20' }}>
                        {site.artifactCount || 0}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#556059' }}>
                        {site.logCount || 0}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              site.status === 'Active'
                                ? '#EAF4ED'
                                : site.status === 'Survey'
                                ? '#FEF3C7'
                                : site.status === 'Completed'
                                ? '#EFF6FF'
                                : '#F3E8FF',
                            color:
                              site.status === 'Active'
                                ? '#24432E'
                                : site.status === 'Survey'
                                ? '#92400E'
                                : site.status === 'Completed'
                                ? '#1E40AF'
                                : '#7E22CE',
                          }}
                        >
                          {site.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW 3: CATALOGUED FINDS LEDGER TABLE
         ══════════════════════════════════════════════════════════════ */}
      {(activeReportView === 'artifacts' || activeReportView === 'overview') && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                Catalogued Artifacts Roster ({filteredArtifacts.length} Finds)
              </h3>
              <p style={{ fontSize: 12, color: '#7A847E', margin: '2px 0 0 0' }}>
                Recovered material objects, accession numbers, and preservation audits.
              </p>
            </div>
            <span style={{ fontSize: 12, color: '#6A746E' }} className="no-print">
              Showing top catalogued specimens
            </span>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8F7F4', borderBottom: '1px solid #E8E5DF', color: '#556059', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '12px 16px' }}>Accession #</th>
                  <th style={{ padding: '12px 16px' }}>Artifact Name</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Chronological Era</th>
                  <th style={{ padding: '12px 16px' }}>Site</th>
                  <th style={{ padding: '12px 16px' }}>Condition</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtifacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: '#9AA49E' }}>
                      No artifacts recorded matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredArtifacts.slice(0, 15).map((art) => (
                    <tr
                      key={art._id}
                      onClick={() => navigate(`/artifacts/${art._id}`)}
                      style={{ borderBottom: '1px solid #EFECE6', cursor: 'pointer', transition: 'background-color 0.1s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F8F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A37318' }}>
                        {art.artifactNumber || 'ART-00'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1A1D20' }}>
                        {art.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#556059' }}>
                        {art.category}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#556059' }}>
                        {art.era}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#556059' }}>
                        {art.site?.name || 'Excavation Site'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: '#F3F4F6',
                            color: '#374151',
                          }}
                        >
                          {art.condition || 'Good'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Formal Printable Footer ───────────────────────────────── */}
      <div
        className="print-only"
        style={{
          display: 'none',
          marginTop: 40,
          paddingTop: 16,
          borderTop: '1px solid #1A1D20',
          fontSize: 11,
          color: '#555',
          justifyContent: 'space-between',
        }}
      >
        <div>Archeological System Formal Research Dossier &copy; {new Date().getFullYear()} Archaeological Survey of India</div>
        <div>Authorized by Director General of Excavations</div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .charts-grid-2 { grid-template-columns: 1fr !important; }
          .charts-grid-status { grid-template-columns: 1fr !important; }
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: flex !important; }
          .app-sidebar, .app-navbar { display: none !important; }
          .reports-container { padding: 0 !important; max-width: 100% !important; }
          body { background: #FFFFFF !important; color: #000000 !important; }
        }
      `}</style>
    </div>
  );
}

function KpiCard({ label, value, subtext, icon: Icon, color, bg }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E5DF',
        borderRadius: 8,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7A847E', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {label}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', lineHeight: 1.2, marginTop: 2 }}>
          {value}
        </div>
        <div style={{ fontSize: 11.5, color: '#8A948E', marginTop: 2 }}>
          {subtext}
        </div>
      </div>
    </div>
  );
}
