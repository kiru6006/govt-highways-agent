import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { navigationItems } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Database, Layers, ArrowLeft } from 'lucide-react';

export const PlaceholderModule: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const currentNav = navigationItems.find((n) => n.path === location.pathname) || {
    id: '0',
    name: 'Departmental Module',
    path: location.pathname,
    icon: Layers
  };

  const Icon = currentNav.icon;

  const moduleDescriptions: Record<string, { purpose: string; deliverables: string; nextPhase: string }> = {
    '/leakage': {
      purpose: 'Vigilance, anti-corruption, financial leakage detection, and material billing reconciliation.',
      deliverables: 'Cross-verifies bitumen gate passes with refinery invoices, weighbridge automated telemetry, and volumetric survey diffs.',
      nextPhase: 'Phase 2: Automated Leakage Scoring Models & Refinery Tax Invoice Matching'
    },
    '/project-360': {
      purpose: 'Unified 360-degree digital record for each road stretch, bridge, or corridor.',
      deliverables: 'Aggregates contractors, past tenders, land acquisitions, utility shiftings, legal petitions, and QC inspection histories.',
      nextPhase: 'Phase 2: MapLibre GIS Integration & High-Resolution Aerial Imagery Overlay'
    },
    '/directory': {
      purpose: 'Tamil Nadu Highways Department organizational hierarchy and personnel contact directory.',
      deliverables: 'Covers Chief Engineers, Superintending Engineers, Divisional Engineers, Assistant Divisional Engineers, and Junior Field Engineers.',
      nextPhase: 'Phase 2: Service Rules Integration & Transfer History Accountability Tracking'
    },
    '/departments': {
      purpose: 'Interdepartmental friction resolution and coordination war-room.',
      deliverables: 'Direct interfaces with Revenue (LA), TANGEDCO (Electricity), TWAD/CMWSSB (Water), Forest (Clearance), and Southern Railway (ROB).',
      nextPhase: 'Phase 2: Automated Inter-Departmental G.O. Escalation & Joint Inspection Meeting Scheduler'
    },
    '/quality': {
      purpose: 'Highways Research Station (HRS) testing, lab reports, and non-destructive structural audits.',
      deliverables: 'Concrete cube compressive strength tests, bitumen penetration tests, Benkelman beam deflections, and roughness index (IRI).',
      nextPhase: 'Phase 2: Geo-tagged Mobile QC Inspection App & HRS Lab Equipment IoT Integration'
    },
    '/finance': {
      purpose: 'Budget sanctions, Letter of Credit (LC), bill scrutiny, and contractor payment releases.',
      deliverables: 'Harmonizes Chief Minister Road Development Programme (CMRDP), CRIDP, NABARD, and World Bank TNRSP financial concurrence.',
      nextPhase: 'Phase 2: Integrated Financial Management System (IFMS) Bridge'
    },
    '/contractors': {
      purpose: 'Empanelled contractor intelligence, capability scoring, and past performance analytics.',
      deliverables: 'Class I to Class IV contractor registers, bid capacity verification, delay penalties, and debarment / blacklist enforcement.',
      nextPhase: 'Phase 2: Automated Bid Capacity Calculator & Liquidated Damages Tracker'
    },
    '/field-ops': {
      purpose: 'Daily field logs, gang work maintenance, pothole patching, and equipment telemetry.',
      deliverables: 'Mobile-friendly inspection checklists for Junior Engineers and Field Assistants.',
      nextPhase: 'Phase 2: Real-time Weather Warning & Cyclone / Monsoon Vulnerability Mapping'
    },
    '/assets': {
      purpose: 'Road and Bridge Asset Inventory Management (RAMS) across 5 road classifications.',
      deliverables: 'Maintains chainage-wise database of State Highways (#006A4E), National Highways (#FFCC00), MDRs (#004B87), ODRs (#D1197E), and Rural roads (#FF6600).',
      nextPhase: 'Phase 2: Automated Pavement Management System (PMS) & Bridge Inspection Scour Ratings'
    },
    '/digital-office': {
      purpose: 'E-Office paperless files, Government Orders (G.O.), circulars, and departmental gazettes.',
      deliverables: 'Statutory file movement, note-file drafting, digital signatures, and archival indexing.',
      nextPhase: 'Phase 2: Departmental E-Office Interoperability & Tamil Language OCR Support'
    },
    '/land-utility': {
      purpose: 'Land acquisition under TN Highways Act 2001 and utility line relocation coordination.',
      deliverables: 'Tracks Section 15(2) and 19(1) notifications, valuation awards, and utility deposit payment reconciliations.',
      nextPhase: 'Phase 2: Cadastral Survey Map Overlay & Direct Beneficiary Bank Transfer (DBT) Sync'
    },
    '/compliance': {
      purpose: 'High Court writ petitions, PILs, Accountant General (AG) audit paras, and statutory RTI disclosures.',
      deliverables: 'Stay order tracking, Advocate General briefing notes, and Public Accounts Committee (PAC) compliance.',
      nextPhase: 'Phase 2: Automated Court Case Status Scraper & AG Audit Para Settlement Tracker'
    },
    '/citizen-services': {
      purpose: 'Citizen grievance redressal, pothole reporting, Right to Information (RTI), and CM Helpline integration.',
      deliverables: 'Citizen mobile portal, public road safety feedback, and SLA-bound grievance resolution.',
      nextPhase: 'Phase 2: Citizen Mobile App & Automated Pothole Geolocation Triangulation'
    },
    '/reports': {
      purpose: 'Secretariat executive briefs, cabinet notes, Legislative Assembly questions, and MIS analytics.',
      deliverables: 'Exportable PDF and Excel analytical reports for Ministers and Principal Secretaries.',
      nextPhase: 'Phase 2: Automated Legislative Assembly Question (LAQ) Fact-Sheet Generator'
    },
    '/admin': {
      purpose: 'Master data management, user role provisioning, jurisdiction assignments, and system audit logs.',
      deliverables: 'Super-admin tools for granting access, setting circle/division boundaries, and reviewing security audits.',
      nextPhase: 'Phase 2: Single Sign-On (SSO) with Tamil Nadu State Data Centre (TNSDC) e-Pramaan'
    }
  };

  const details = moduleDescriptions[location.pathname] || {
    purpose: 'Enterprise departmental module within TN-HDOS platform.',
    deliverables: 'Structured relational data models, role-based workflows, and audit trails.',
    nextPhase: 'Scheduled for Phase 2 implementation following master architecture foundation.'
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="text-xs text-[#006A4E] hover:underline font-semibold flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Executive Command Centre
        </Link>
      </div>

      {/* Module Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] text-[#006A4E] flex items-center justify-center flex-shrink-0 border border-[#B2DFCD]">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentNav.name}
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Foundation Established (Phase 1)
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {details.purpose}
            </p>
          </div>
        </div>

        {/* Phase 0 / 1 Architecture Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
              <Database className="w-4 h-4 text-[#004B87]" />
              Data Model Entity
            </div>
            <p className="text-xs text-slate-500">
              Backend SQLAlchemy tables, schemas and seed data already established in Master SQLite/PostGIS database.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
              <Shield className="w-4 h-4 text-[#006A4E]" />
              RBAC Clearance
            </div>
            <p className="text-xs text-slate-500">
              Active User: <span className="font-semibold text-slate-800">{user?.role_name}</span>. Access governed by departmental hierarchy.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
              <Sparkles className="w-4 h-4 text-[#996600]" />
              Ask AI Ready
            </div>
            <p className="text-xs text-slate-500">
              Persistent AI Assistant drawer is pre-configured with context for this module.
            </p>
          </div>
        </div>

        {/* Target Architecture Specification */}
        <div className="bg-[#E6F4EA]/40 rounded-xl p-5 border border-[#B2DFCD]">
          <h3 className="text-xs font-bold text-[#006A4E] uppercase tracking-wider mb-2">
            Target Architecture & Core Capabilities
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {details.deliverables}
          </p>
          <div className="mt-3 pt-3 border-t border-[#B2DFCD]/60 text-[11px] text-slate-600">
            <span className="font-semibold text-[#006A4E]">Roadmap:</span> {details.nextPhase}
          </div>
        </div>

        {/* Explicit Demo Data Notice */}
        <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span>Demonstration environment conforming to TN Highways Department specifications (DESIGN.md).</span>
          <span className="font-mono text-slate-500">TN-HDOS-PHASE-1</span>
        </div>
      </div>
    </div>
  );
};

