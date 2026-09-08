import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoonCard } from "@/components/shared/ComingSoonCard";

export default function MaterialMatchingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Material Matching & Deduplication"
        description="Stage 5 in the National Material Master pipeline. Cross-enterprise semantic vector search and deduplication to cluster identical materials stored under divergent legacy codes."
        breadcrumbs={[{ label: "AI Standardization" }, { label: "AI Material Matching" }]}
      />

      <ComingSoonCard
        moduleName="AI Material Matching Engine (Stage 5)"
        category="Vector Similarity & Cross-CPSE Deduplication"
        description="Leverages high-dimensional embeddings and pgvector cosine similarity algorithms to match equivalent materials across ONGC, BHEL, NTPC, IOCL, SAIL, GAIL, and Coal India."
        plannedFeatures={[
          "High-dimensional dense vector embeddings generated from standardized text and extracted attributes",
          "Fast approximate nearest neighbor (HNSW index) search powered by PostgreSQL + pgvector",
          "Cosine similarity score thresholding with automated clustering",
          "Cross-CPSE inventory visibility to identify duplicate spare parts and optimize bulk procurement",
          "Harmonized National Material Code (UNMC) candidate mapping with confidence indicators",
          "Side-by-side reconciliation workbench for CPSE material officers",
        ]}
        targetArchitecture={{
          technology: "Semantic Vector Search & High-Dimensional Nearest Neighbors",
          modelOrEngine: "BGE-Large-EN-v1.5 / OpenAI text-embedding-3 + pgvector (HNSW Index)",
          targetAccuracy: "99.1% Top-1 Similarity Recall on Benchmark Duplicates",
          integrationPoint: "Runs downstream of Embedding Generation before National Code Mapping",
        }}
        samplePreview={{
          inputExample: "ONGC: ONG-1001 ('SS HEX BOLT M10X50 MM') vs BHEL: BHL-2001 ('Stainless Steel Hexagonal Bolt M10 x 50mm')",
          expectedOutput: JSON.stringify(
            {
              match_status: "EXACT_EQUIVALENT",
              similarity_score: 0.9942,
              common_national_code: "IN-NMC-31161501",
              standardized_title: "Hexagonal Bolt, Stainless Steel, M10 x 50 mm",
              cpse_cross_reference: [
                { cpse: "ONGC", legacy_code: "ONG-1001", unit_price_inr: 45.5 },
                { cpse: "BHEL", legacy_code: "BHL-2001", unit_price_inr: 44.8 }
              ],
              procurement_synergy_identified: "Consolidated procurement savings estimated at 14.2%"
            },
            null,
            2
          ),
        }}
      />
    </div>
  );
}
