import React, { useState, useEffect } from 'react';
import {
  Network,
  Share2,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  User,
  Scale,
  Zap,
  MapPin,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  X,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import {
  EntityRelationshipItem,
  RelationshipGraphData,
  RelationshipSuggestionItem
} from '../../types';

interface ConnectedEntityPanelProps {
  entityType: string;
  entityId?: string | number;
  entityTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isDrawer?: boolean;
}

export const ConnectedEntityPanel: React.FC<ConnectedEntityPanelProps> = ({
  entityType,
  entityId,
  entityTitle,
  isOpen = true,
  onClose,
  isDrawer = false
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'list' | 'suggestions' | 'audit'>('graph');
  const [loading, setLoading] = useState<boolean>(true);
  const [relationships, setRelationships] = useState<EntityRelationshipItem[]>([]);
  const [graphData, setGraphData] = useState<RelationshipGraphData | null>(null);
  const [suggestions, setSuggestions] = useState<RelationshipSuggestionItem[]>([]);
  const [graphDepth, setGraphDepth] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTargetType, setNewTargetType] = useState('DEPARTMENT');
  const [newTargetId, setNewTargetId] = useState('');
  const [newRelType, setNewRelType] = useState('DEPENDS_ON');
  const [newAccessTier, setNewAccessTier] = useState('INTERNAL');

  const [supersedeId, setSupersedeId] = useState<number | null>(null);
  const [supersedeReason, setSupersedeReason] = useState('');

  const [confirmingSugId, setConfirmingSugId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const safeEntityId = entityId ?? 1;
      const [rels, graph, suggs] = await Promise.all([
        api.getEntityRelationships(entityType, safeEntityId).catch(() => []),
        api.getEntityGraph(entityType, safeEntityId, graphDepth).catch(() => null),
        api.getSuggestedRelationships(entityType, safeEntityId).catch(() => ({ entity_type: entityType, entity_id: String(safeEntityId), suggestions_count: 0, suggestions: [] }))
      ]);

      setRelationships(rels || []);
      setGraphData(graph);
      setSuggestions(suggs?.suggestions || []);
    } catch (err) {
      console.error('Failed to load entity relationships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      loadData();
    }
  }, [entityType, entityId, graphDepth]);

  if (!isOpen) return null;

  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRelationship({
        source_entity_type: entityType,
        source_entity_id: entityId ?? 1,
        source_entity_name: entityTitle,
        relationship_type: newRelType,
        target_entity_type: newTargetType,
        target_entity_id: newTargetId,
        access_tier: newAccessTier
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to establish relationship. Ensure IDs are valid and permissions match.');
    }
  };

  const handleSupersede = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supersedeId || !supersedeReason.trim()) return;
    try {
      await api.supersedeRelationship(supersedeId, supersedeReason);
      setSupersedeId(null);
      setSupersedeReason('');
      loadData();
    } catch (err) {
      alert('Failed to supersede relationship.');
    }
  };

  const handleConfirmSuggestion = async (s: RelationshipSuggestionItem) => {
    try {
      setConfirmingSugId(s.suggestion_id);
      await api.confirmSuggestedRelationship(s.suggestion_id, {
        source_entity_type: s.source_entity_type,
        source_entity_id: s.source_entity_id,
        relationship_type: s.suggested_relationship,
        target_entity_type: s.target_entity_type,
        target_entity_id: s.target_entity_id,
        weight: s.confidence_score,
        is_active: true,
        is_critical_path: false,
        provenance: 'HUMAN_CONFIRMED',
        description: s.ai_reason,
        access_tier: 'INTERNAL'
      });
      loadData();
    } catch (err) {
      alert('Failed to confirm AI suggested link.');
    } finally {
      setConfirmingSugId(null);
    }
  };

  const filteredRelationships = relationships.filter(r => {
    const matchesFilter = filterType === 'ALL' || r.target_entity_type === filterType || r.source_entity_type === filterType;
    const matchesSearch = searchTerm === '' ||
      r.target_entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.relationship_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.relationship_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEntityIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PROJECT': return <Layers className="w-4 h-4 text-emerald-500" />;
      case 'CONTRACTOR': return <Building className="w-4 h-4 text-blue-500" />;
      case 'DEPARTMENT': return <Building className="w-4 h-4 text-indigo-500" />;
      case 'LEGAL_CASE': return <Scale className="w-4 h-4 text-amber-500" />;
      case 'CM_DIRECTION': return <Zap className="w-4 h-4 text-rose-500" />;
      case 'LAND_PARCEL': return <MapPin className="w-4 h-4 text-teal-500" />;
      case 'UTILITY': return <Zap className="w-4 h-4 text-purple-500" />;
      case 'OFFICER':
      case 'USER': return <User className="w-4 h-4 text-sky-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTierBadge = (tier: string) => {
    const color = tier === 'CABINET_ONLY' ? 'bg-rose-100 text-rose-800 border-rose-300' :
      tier === 'CONFIDENTIAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
      tier === 'RESTRICTED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      'bg-slate-100 text-slate-700 border-slate-300';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
        <Shield className="w-3 h-3" /> {tier}
      </span>
    );
  };

  const renderGraphVisualizer = () => {
    if (!graphData || graphData.nodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Network className="w-12 h-12 mb-3 stroke-[1.5]" />
          <p className="text-sm font-medium">No active connections found for this entity.</p>
        </div>
      );
    }

    const width = 680;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const rootNode = graphData.nodes.find(n => n.category === 'ROOT') || graphData.nodes[0];
    const otherNodes = graphData.nodes.filter(n => n.id !== rootNode.id);

    const radius = 150;
    const angleStep = otherNodes.length > 0 ? (2 * Math.PI) / otherNodes.length : 0;

    const nodePositions: Record<string, { x: number; y: number }> = {};
    nodePositions[rootNode.id] = { x: centerX, y: centerY };

    otherNodes.forEach((node, idx) => {
      const angle = idx * angleStep;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    return (
      <div className="relative bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {graphData.nodes.length} Connected Nodes
            </span>
            <span className="text-slate-600">•</span>
            <span>{graphData.edges.length} Typed Relations</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGraphDepth(graphDepth === 1 ? 2 : 1)}
              className="px-2 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Hop Depth: {graphDepth} {graphDepth === 1 ? '(1-Hop)' : '(2-Hop Multi)'}
            </button>
            <button
              onClick={loadData}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh graph"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-80 select-none">
          {/* Edge Lines */}
          {graphData.edges.map(edge => {
            const src = nodePositions[edge.source];
            const tgt = nodePositions[edge.target];
            if (!src || !tgt) return null;
            return (
              <g key={edge.id}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#334155"
                  strokeWidth="2"
                  strokeDasharray={edge.verification_status === 'VERIFIED_OFFICIAL' ? 'none' : '4 4'}
                />
                <circle cx={(src.x + tgt.x) / 2} cy={(src.y + tgt.y) / 2} r="3" fill="#64748b" />
              </g>
            );
          })}

          {/* Node Circles */}
          {graphData.nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isRoot = node.id === rootNode.id;
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                <circle
                  r={isRoot ? 26 : 20}
                  fill={isRoot ? '#059669' : '#1e293b'}
                  stroke={isSelected ? '#38bdf8' : isRoot ? '#34d399' : '#475569'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200 group-hover:stroke-sky-400 group-hover:scale-110"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize={isRoot ? '10' : '9'}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {node.type.slice(0, 3)}
                </text>
                <text
                  textAnchor="middle"
                  dy={isRoot ? 38 : 32}
                  fill="#94a3b8"
                  fontSize="10"
                  className="pointer-events-none max-w-[120px] truncate"
                >
                  {node.name.length > 18 ? node.name.slice(0, 18) + '...' : node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {selectedNode && (
          <div className="mt-3 p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-sky-400 uppercase tracking-wide mr-2">
                [{selectedNode.type}]
              </span>
              <span className="font-medium">{selectedNode.name}</span>
              <div className="mt-1 text-slate-400">
                Tier: <span className="text-slate-200">{selectedNode.access_tier}</span> • Node ID: <span className="font-mono text-slate-300">{selectedNode.id}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );
  };

  const containerClasses = isDrawer
    ? "fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col"
    : "bg-white rounded-xl shadow-sm border border-slate-200 p-6";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Universal Connectivity & Entity Web</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Everything Connected
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {entityType} #{entityId} {entityTitle ? `— ${entityTitle}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Record
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'graph'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> Interactive Graph
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'list'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Connected Records ({relationships.length})
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'suggestions'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Suggestions ({suggestions.length})
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
          <p className="text-xs font-medium">Resolving multidimensional entity relationships...</p>
        </div>
      ) : activeTab === 'graph' ? (
        renderGraphVisualizer()
      ) : activeTab === 'list' ? (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search connected records..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="PROJECT">Projects</option>
              <option value="CONTRACTOR">Contractors</option>
              <option value="DEPARTMENT">Departments</option>
              <option value="LEGAL_CASE">Legal Cases</option>
              <option value="CM_DIRECTION">CM Directions</option>
              <option value="LAND_PARCEL">Land Parcels</option>
            </select>
          </div>

          {filteredRelationships.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRelationships.map(rel => {
                const isTarget = rel.source_entity_type === entityType && String(rel.source_entity_id) === String(entityId);
                const otherType = isTarget ? rel.target_entity_type : rel.source_entity_type;
                const otherId = isTarget ? rel.target_entity_id : rel.source_entity_id;
                const otherName = isTarget ? rel.target_entity_name : rel.source_entity_name;

                return (
                  <div
                    key={rel.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50/50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded bg-slate-100 mt-0.5">
                        {getEntityIcon(otherType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">{rel.relationship_code}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {rel.relationship_type.replace(/_/g, ' ')}
                          </span>
                          {getTierBadge(rel.access_tier)}
                          {rel.verification_status === 'VERIFIED_OFFICIAL' && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 mt-1">
                          [{otherType}] {otherName}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ID: <span className="font-mono">{otherId}</span> • Confidence: {(rel.confidence_score * 100).toFixed(0)}%
                          {rel.source_reference && ` • Ref: ${rel.source_reference}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSupersedeId(rel.id);
                          setSupersedeReason('');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Supersede or modify this link with official reason"
                      >
                        Supersede
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* AI Suggestions Tab */
        <div className="space-y-3 flex-1 overflow-y-auto">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <div>
              <span className="font-bold">Statutory Human Confirmation Required:</span> AI-inferred relationships
              do NOT enter the official state knowledge base until verified and approved by an authorized government officer.
            </div>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No pending AI relationship suggestions for this entity.
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map(s => (
                <div
                  key={s.suggestion_id}
                  className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      AI Inferred • {(s.confidence_score * 100).toFixed(0)}% Match
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{s.suggestion_id}</span>
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">{s.source_entity_name}</span>
                    <span className="mx-2 text-emerald-600 font-bold">➔ {s.suggested_relationship} ➔</span>
                    <span className="font-semibold text-slate-900">{s.target_entity_name}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded border border-slate-100">
                    "{s.ai_reason}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleConfirmSuggestion(s)}
                      disabled={confirmingSugId === s.suggestion_id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {confirmingSugId === s.suggestion_id ? 'Confirming...' : 'Approve & Create Authoritative Link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Connection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Authoritative Entity Link</h3>
            <p className="text-xs text-slate-500 mb-4">
              Establishes a verified typed relationship with statutory provenance and audit logging.
            </p>

            <form onSubmit={handleCreateRelationship} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Entity Type</label>
                <select
                  value={newTargetType}
                  onChange={e => setNewTargetType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="DEPARTMENT">Department / Agency</option>
                  <option value="PROJECT">Project</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="LEGAL_CASE">Legal Case / Stay</option>
                  <option value="LAND_PARCEL">Land Parcel</option>
                  <option value="CM_DIRECTION">CM Direction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Entity ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 or 2"
                  value={newTargetId}
                  onChange={e => setNewTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship Type</label>
                <select
                  value={newRelType}
                  onChange={e => setNewRelType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="DEPENDS_ON">DEPENDS ON (Statutory Clearances)</option>
                  <option value="BLOCKED_BY">BLOCKED BY (Active Bottleneck)</option>
                  <option value="SUBJECT_TO_LITIGATION">SUBJECT TO LITIGATION (Court Stay)</option>
                  <option value="EXECUTED_BY">EXECUTED BY (Contractor / Wing)</option>
                  <option value="GOVERNED_BY">GOVERNED BY (CM Direction)</option>
                  <option value="COORDINATES_WITH">COORDINATES WITH (External Nodal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confidentiality Tier</label>
                <select
                  value={newAccessTier}
                  onChange={e => setNewAccessTier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="INTERNAL">INTERNAL (Highways Officers)</option>
                  <option value="RESTRICTED">RESTRICTED (Divisional / SE)</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL (Apex Leadership)</option>
                  <option value="CABINET_ONLY">CABINET ONLY (CM & Minister)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Create Official Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supersede Modal */}
      {supersedeId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Supersede Relationship</h3>
            <p className="text-xs text-slate-500 mb-4">
              State the official administrative reason for retiring or superseding this link.
            </p>

            <form onSubmit={handleSupersede} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Statutory Reason</label>
                <textarea
                  required
                  rows={3}
                  value={supersedeReason}
                  onChange={e => setSupersedeReason(e.target.value)}
                  placeholder="e.g. Replaced by statutory court disposal order / NOC obtained."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSupersedeId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                >
                  Confirm Supersession
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
