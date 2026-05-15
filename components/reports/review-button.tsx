// components/reports/review-button.tsx
"use client";

import { useState } from "react";
import { markReviewed } from "@/lib/actions/reports";
import { CheckCircle, Loader2 } from "lucide-react";

export function ReportReviewButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReview = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set("report_id", reportId);
    fd.set("status", "reviewed");
    await markReviewed(fd);
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <CheckCircle size={12} /> Reviewed
      </span>
    );
  }

  return (
    <button
      onClick={handleReview}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-green-400 border border-white/10 hover:border-green-500/30 px-3 py-1.5 rounded-lg transition-all"
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
      Mark Reviewed
    </button>
  );
}
