"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { ArrowRightIcon, ArrowUpIcon } from "@/components/ui/phosphor-icons";
import { cn } from "@/lib/utils";
import type { HouseholdRow } from "@/lib/poverty-types";

const PREVIEW_COUNT = 5;

function PovertyBadge({ level }: { level: string }) {
  if (level === "Extreme") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
        Ekstrem
      </Badge>
    );
  }
  if (level === "Miskin") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
        Miskin
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
      Rentan
    </Badge>
  );
}

function FuzzyPriorityBadge({ label }: { label: string | null }) {
  if (!label) return <span className="text-xs text-muted-foreground">—</span>;
  const colors: Record<string, string> = {
    "SANGAT TINGGI":   "bg-red-100 text-red-700 border-red-200",
    "TINGGI":          "bg-orange-100 text-orange-700 border-orange-200",
    "SEDANG":          "bg-amber-100 text-amber-700 border-amber-200",
    "RENDAH":          "bg-emerald-100 text-emerald-700 border-emerald-200",
    "TIDAK PRIORITAS": "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <Badge className={colors[label] ?? "bg-muted text-muted-foreground"}>
      {label}
    </Badge>
  );
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);
  const color =
    value <= 3 ? "bg-red-400" : value <= 6 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}/10</span>
    </div>
  );
}

export function PovertyHouseholdsTable({
  rows,
  loading = false,
}: {
  rows: HouseholdRow[];
  loading?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? rows : rows.slice(0, PREVIEW_COUNT);
  const hasMore = rows.length > PREVIEW_COUNT;

  return (
    <DashboardCard className="relative gap-0 h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Data Warga Miskin</CardTitle>
        <CardDescription>
          {loading ? "Memuat data…" : `${rows.length} entri tersimpan dari peta · skor prioritas fuzzy`}
        </CardDescription>
      </CardHeader>

      <CardContent className={cn("px-0 flex-1", !showAll && hasMore && "mask-b-from-50% mask-b-to-100%")}>
        {loading && (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
            Memuat data...
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
            Belum ada data. Tambah marker di peta untuk mencatat warga miskin.
          </div>
        )}

        {!loading && rows.length > 0 && (
          <Table>
            <TableCaption className="sr-only">
              Data warga miskin dengan skor prioritas fuzzy.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-6 w-8">#</TableHead>
                <TableHead>Kepala Keluarga</TableHead>
                <TableHead className="text-center">Jiwa</TableHead>
                <TableHead>Rumah</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead className="text-right">Penghasilan</TableHead>
                <TableHead className="text-right tabular-nums">Skor Fuzzy</TableHead>
                <TableHead className="pe-6">Prioritas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row, i) => (
                <TableRow className="h-12" key={row.id}>
                  <TableCell className="ps-6 text-xs text-muted-foreground tabular-nums">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium max-w-[160px] truncate">
                    {row.head_name}
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                    {row.family_count}
                  </TableCell>
                  <TableCell>
                    <ScoreBar value={Number(row.kondisi_rumah)} />
                  </TableCell>
                  <TableCell>
                    <ScoreBar value={Number(row.kepemilikan_aset)} />
                  </TableCell>
                  <TableCell>
                    <PovertyBadge level={row.poverty_level} />
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    Rp {Number(row.penghasilan).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {row.fuzzy_score != null ? Number(row.fuzzy_score).toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="pe-6">
                    <FuzzyPriorityBadge label={row.fuzzy_label} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* View All overlay — only when collapsed and there are hidden rows */}
      {!showAll && hasMore && (
        <div className="mask-t-from-30% absolute inset-x-0 bottom-0 flex h-1/5 items-center justify-center bg-background">
          <Button variant="ghost" onClick={() => setShowAll(true)}>
            Lihat Semua ({rows.length})
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Collapse button — only when expanded */}
      {showAll && rows.length > PREVIEW_COUNT && (
        <div className="flex items-center justify-center border-t py-3">
          <Button variant="ghost" onClick={() => setShowAll(false)}>
            <ArrowUpIcon aria-hidden="true" />
            Tutup
          </Button>
        </div>
      )}
    </DashboardCard>
  );
}
