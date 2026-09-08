-- ============================================================================
-- AI-Driven Standardization and Harmonization of Material Codes Across CPSEs
-- PostgreSQL Database Schema: Human-in-the-Loop Review & Validation System
-- ============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CPSE Raw Material Master Table
-- Stores the original, immutable raw data as ingested from CPSE ERP dumps
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpse_name VARCHAR(50) NOT NULL,                    -- e.g., 'ONGC', 'BHEL', 'NTPC', 'IOCL', 'SAIL', 'GAIL', 'CIL'
    material_code VARCHAR(100) NOT NULL,                -- e.g., 'ONG-1001', 'BHL-2004'
    raw_description TEXT NOT NULL,                     -- e.g., 'SS HEX-BOLT M10X50 MM!!!'
    specification TEXT,                                -- e.g., 'Grade A2-70'
    original_unit VARCHAR(50),                         -- e.g., 'NOS', 'MTRS', 'PCS'
    category VARCHAR(100) DEFAULT 'General',           -- e.g., 'Fasteners & Hardware'
    sub_category VARCHAR(100),                         -- e.g., 'Bolts & Screws'
    plant_location VARCHAR(100),                       -- e.g., 'Hazira Plant', 'Bhopal Unit'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cpse_material_code UNIQUE (cpse_name, material_code)
);

CREATE INDEX IF NOT EXISTS idx_materials_cpse ON materials(cpse_name);
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(material_code);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at);

-- 2. Automated Processing Results Table
-- Stores the AI / Rule-Engine proposed standardization output
-- Designed with review_stage to support Preprocessing, Attribute Extraction, and AI Matching
CREATE TABLE IF NOT EXISTS processing_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    review_stage VARCHAR(50) NOT NULL DEFAULT 'cleaning', -- 'cleaning', 'attribute_extraction', 'matching', 'unmc_code'
    proposed_cleaned_description TEXT NOT NULL,          -- e.g., 'stainless steel hex bolt m10 x 50 mm'
    proposed_cleaned_unit VARCHAR(50),                  -- e.g., 'nos'
    proposed_specification TEXT,                         -- e.g., 'Standard Hexagonal Fastener'
    changes_made JSONB DEFAULT '[]'::jsonb,              -- List of applied transformation steps
    confidence_score NUMERIC(5, 2) DEFAULT 95.00,        -- Confidence percentage (0.00 - 100.00)
    processing_status VARCHAR(50) DEFAULT 'success',     -- 'success', 'warning', 'error'
    engine_version VARCHAR(50) DEFAULT 'v1.0-deterministic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_processing_results_material ON processing_results(material_id);
CREATE INDEX IF NOT EXISTS idx_processing_results_stage ON processing_results(review_stage);
CREATE INDEX IF NOT EXISTS idx_processing_results_status ON processing_results(processing_status);

-- 3. Human Reviews Table
-- Captures human reviewer decisions: Approve, Edit, Reject
-- Preserves human-edited final values alongside AI proposals and original raw data
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processing_result_id UUID NOT NULL REFERENCES processing_results(id) ON DELETE CASCADE,
    review_status VARCHAR(50) NOT NULL DEFAULT 'Pending Review', -- 'Pending Review', 'Approved', 'Rejected', 'Edited'
    reviewer_name VARCHAR(150),                                  -- e.g., 'P. Sharma (ONGC Materials Manager)'
    reviewer_email VARCHAR(150),
    reviewer_role VARCHAR(100) DEFAULT 'Materials Auditor',
    rejection_reason TEXT,                                       -- e.g., 'Inaccurate abbreviation expansion'
    human_edited_description TEXT,                               -- Populated when review_status = 'Edited'
    human_edited_unit VARCHAR(50),                               -- Populated when review_status = 'Edited'
    human_edited_specification TEXT,                            -- Populated when review_status = 'Edited'
    edit_notes TEXT,                                             -- Reviewer explanation for manual changes
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_review_status CHECK (review_status IN ('Pending Review', 'Approved', 'Rejected', 'Edited'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_reviews_result_id ON reviews(processing_result_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON reviews(reviewed_at);

-- 4. Audit Logs Table
-- Immutable event stream of all pipeline and human-in-the-loop actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewer_name VARCHAR(150) NOT NULL,                -- User or automated service name
    action VARCHAR(100) NOT NULL,                       -- e.g., 'Material uploaded', 'User approved standardized description'
    cpse_name VARCHAR(50) NOT NULL,
    material_code VARCHAR(100) NOT NULL,
    previous_value TEXT,                                -- Value prior to action
    new_value TEXT,                                     -- Value after action
    details TEXT,                                       -- Contextual description
    status VARCHAR(50) DEFAULT 'info',                  -- 'info', 'success', 'warning', 'error'
    rule_applied VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_material_code ON audit_logs(material_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cpse ON audit_logs(cpse_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- Sample Seed Data for Demonstrating the Human-in-the-Loop Workflow
-- ============================================================================

INSERT INTO materials (id, cpse_name, material_code, raw_description, specification, original_unit, category)
VALUES 
    ('a0000001-0000-0000-0000-000000000001', 'ONGC', 'ONG-1001', 'SS HEX-BOLT M10X50 MM!!!', 'Grade A2-70', 'NOS', 'Fasteners & Hardware'),
    ('a0000002-0000-0000-0000-000000000002', 'BHEL', 'BHL-2004', 'MS PLT 25MM THK IS 2062 BR 2500X10000MM', 'IS 2062 E250', 'MTR', 'Structural Steel'),
    ('a0000003-0000-0000-0000-000000000003', 'NTPC', 'NTP-3011', 'CS FLG WNRF 150# 4" SCH 40 ASTM A105', 'ASTM A105', 'PCS', 'Piping & Fittings'),
    ('a0000004-0000-0000-0000-000000000004', 'IOCL', 'IOC-4089', 'BALL VLV 2" 300# FLGD END BODY A216 WCB TRIM SS316', 'ASME B16.34', 'NOS', 'Valves & Flow Control')
ON CONFLICT (cpse_name, material_code) DO NOTHING;

INSERT INTO processing_results (id, material_id, review_stage, proposed_cleaned_description, proposed_cleaned_unit, changes_made, confidence_score, processing_status)
VALUES 
    ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'cleaning', 'stainless steel hex bolt m10 x 50 mm', 'nos', 
     '["Converted to lowercase", "Removed special characters", "Expanded abbreviation: SS → Stainless Steel", "Standardized dimension: M10X50 → M10 x 50", "Normalized unit: NOS → nos"]'::jsonb, 98.0, 'success'),
    ('b0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', 'cleaning', 'mild steel plate 25 mm thickness is 2062 br 2500 x 10000 mm', 'm', 
     '["Converted to lowercase", "Expanded abbreviation: MS → Mild Steel", "Expanded abbreviation: PLT → Plate", "Expanded abbreviation: THK → Thickness", "Standardized dimension: 2500X10000MM → 2500 x 10000 mm", "Normalized unit: MTR → m"]'::jsonb, 94.0, 'success'),
    ('b0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'cleaning', 'carbon steel flange weld neck raised face class 150 4 inch schedule 40 astm a105', 'pcs', 
     '["Converted to lowercase", "Expanded abbreviation: CS → Carbon Steel", "Expanded abbreviation: FLG → Flange", "Expanded abbreviation: WNRF → Weld Neck Raised Face", "Expanded abbreviation: 150# → Class 150", "Expanded abbreviation: SCH 40 → Schedule 40"]'::jsonb, 96.0, 'success'),
    ('b0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000004', 'cleaning', 'ball valve 2 inch class 300 flanged end body a216 wcb trim stainless steel 316', 'nos', 
     '["Converted to lowercase", "Expanded abbreviation: VLV → Valve", "Standardized dimension: 2\\" → 2 inch", "Expanded abbreviation: 300# → Class 300", "Expanded abbreviation: FLGD → Flanged", "Expanded abbreviation: SS316 → Stainless Steel 316"]'::jsonb, 95.0, 'success')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, processing_result_id, review_status, reviewer_name, reviewed_at)
VALUES 
    ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Pending Review', NULL, NULL),
    ('c0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 'Pending Review', NULL, NULL),
    ('c0000003-0000-0000-0000-000000000003', 'b0000003-0000-0000-0000-000000000003', 'Pending Review', NULL, NULL),
    ('c0000004-0000-0000-0000-000000000004', 'b0000004-0000-0000-0000-000000000004', 'Pending Review', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_logs (id, timestamp, reviewer_name, action, cpse_name, material_code, previous_value, new_value, details, status)
VALUES 
    ('d0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'System Uploader', 'Material uploaded', 'ONGC', 'ONG-1001', NULL, 'SS HEX-BOLT M10X50 MM!!!', 'Raw material record uploaded via CSV batch ingestion', 'info'),
    ('d0000002-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes', 'Automated Cleaning Engine', 'Automated preprocessing completed', 'ONGC', 'ONG-1001', 'SS HEX-BOLT M10X50 MM!!!', 'stainless steel hex bolt m10 x 50 mm', '7-step preprocessing transformation completed with 5 changes applied', 'success')
ON CONFLICT (id) DO NOTHING;
