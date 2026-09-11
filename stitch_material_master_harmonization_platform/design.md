markdown_content = """# Material Master — UI/UX Design Specification & Stitch Prompt
---
## 1. System Overview & Aesthetic Rules
- **Product Name**: Material Master
- **Domain**: Enterprise AI Harmonization & Standardization Platform for CPSEs (e.g., ONGC, BHEL, IOCL, NTPC, GAIL, SAIL, CIL).
- **Core Visual Style**:
  - Clean, light-themed SaaS dashboard (no heavy AI gradients or sci-fi visual tropes).
  - Primary Theme: Deep purple accents on crisp white and soft neutral gray/lavender backdrops.
  - Sidebar: Minimalist, spacious navigation with subtle active states (rounded pill indicators).
  - Metric Cards: Trend lines/sparklines and status pills rather than oversized bold numbers.
---
## 2. Color Palette & Typography
- **Primary / Brand**: `#582C87` (Deep Royal Purple), `#7C3AED` (Vibrant Violet)
- **Backgrounds**: `#F8FAFC` (Canvas), `#FFFFFF` (Surface / Cards), `#F3E8FF` (Subtle Purple Tint)
- **Borders**: `#E2E8F0` / `#EDE9FE`
- **Text**: `#0F172A` (Primary Charcoal), `#475569` (Secondary Muted Slate)
- **Status Accents**: `#10B981` (Success Emerald), `#F59E0B` (Warning Amber), `#EF4444` (Error Rose)
- **Typography**: Inter / Plus Jakarta Sans (`14px` base body, `600/700` weight headers).
---
## 3. Global Layout Architecture
1. **Top Header**:
   - Left: Platform Name (`MATERIAL MASTER`) with subtle badge (`SIH Edition`).
   - Center: Global search input (`Search material code, standard specs, or UNMC...`) + CPSE filter dropdown (`All Enterprises (7 CPSEs)`).
   - Right: System status pill (`Engine: Operational`), Notification bell, and Auditor Profile chip.
2. **Left Sidebar**:
   - Grouped sections with clean icons and light text spacing:
     - **Main**: Dashboard Overview
     - **Data Pipeline**: Ingestion / Upload Data, Raw Master, Harmonized Catalog
     - **Standardization Engines**: Data Cleaning, Attribute Extraction, Vector Matching
     - **Review Center**: Pending Review, Approved Records, Rejected
     - **System**: Analytics, Audit Trail, Settings
3. **Main Content Container**:
   - Breadcrumb + contextual page header with action buttons.
   - Core operational workspace.
---
## 4. Key Page Specifications
### Page 1: Dashboard Overview
- **Hero / Notification Strip**: Compact white card with light purple border summarizing system purpose and quick shortcuts (`Open Workbench`, `Ingest Batch`).
- **Metric Cards (No Big Numbers)**:
  - Total Cataloged: Sparkline with trend trajectory + ingestion status pill.
  - Processing Throughput: Completion flow indicator + efficiency badge.
  - Normalized Records: Mini distribution chart + accuracy health tag.
  - Pending Review: Flag status line + human-in-the-loop review priority alert.
- **Master Data Overview Table**:
  - Columns: CPSE Tag, Material Code, Raw Description, Standardized Description, Confidence, Actions.
  - Quick inline audit triggers and batch execution footer bar.
### Page 2: Upload & Ingestion Center
- **Enterprise Source Context**: Two-column form with dropdowns: Target CPSE and ERP Export Format (e.g., SAP ECC, SAP S/4HANA, Oracle ERP).
- **Drag-and-Drop Dropzone**: Minimalist bordered box supporting CSV, XLSX, and parquet files.
- **Expected Schema Panel**: Real-time validation sidebar displaying required fields (`material_description`, `material_code`, `unit`, `spec`).
### Page 3: Data Cleaning & Normalization Results
- **Run Summary Header**: Processed batch metadata, processing latency, deterministic match rate.
- **Before / After Comparison Grid**:
  - Split-view comparison row-by-row highlighting token abbreviations, SI unit conversions, and normalized noun-modifier formats.
  - Filter by modification status: Modified, Untouched, Needs Auditor Review.
### Page 4: Review Center & Audit Trail
- **Human-in-the-Loop Workbench**: Highlighting flagged edge cases with low cosine similarity or ambiguous specifications.
- **Resolution Drawer**: Side drawer allowing manual override, approval, or sending back to ingestion queue.
---
## 5. Ready-to-Use Stitch Prompt
```text
Design a light-themed enterprise SaaS platform titled "MATERIAL MASTER" for harmonizing CPSE industrial material codes.
Aesthetic Guidelines:
- Color Palette: Clean white (#ffffff) and soft cool-gray background (#f8fafc) paired with deep royal purple (#582c87) and electric violet accents (#7c3aed).
- Avoid dark cards and avoid oversized numbers/metrics on summary cards. Use elegant sparklines, status progress indicators, and badge labels instead.
- The left sidebar must feel airy and unclustered, featuring minimal icons, generous vertical spacing, and clean category groupings (Overview, Material Data, AI Standardization, Review Center, Settings).
- Layout includes:
  1. Sticky top navigation bar with search bar, enterprise multi-selector, engine status pill, and user profile.
  2. Hero banner introducing the platform with clean action buttons ("Ingest Dataset", "Test Workbench").
  3. Metric cards showing pipeline flow with mini sparklines and status tags instead of raw digit statistics.
  4. Enterprise data table with subtle row striping, CPSE badges (ONGC, IOCL, SAIL, NTPC), raw descriptions, standardized outputs, and inline action icons.