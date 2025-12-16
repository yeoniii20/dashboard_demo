"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { ColumnDefinition } from "react-tabulator";
import type { ReactTabulatorOptions } from "react-tabulator";
import type { RowComponent } from "tabulator-tables";

import CustomChart from "@/app/components/chart/customChart";
import { addAlphaToHex } from "@/app/utils/alphaToHex";
import { QUEUES_STATUS } from "@/app/data/queue";
import { SERVERS } from "@/app/data/server";

const ReactTabulatorNoSSR = dynamic(
  () => import("react-tabulator").then((m) => m.ReactTabulator),
  { ssr: false }
);

type MetricPoint = { timestamp: number; value: number };

type QueueItem = {
  id: string;
  serverId: string;
  name: string;
  threshold: number;

  depth: MetricPoint[];
  lag: MetricPoint[];
  inMsgPerSec: MetricPoint[];
  outMsgPerSec: MetricPoint[];
};

type QueueRow = {
  id: string;
  name: string;
  serverId: string;
  serverLabel: string;
  region: string;

  depthNow: number;
  threshold: number;
  lagNow: number;
  inNow: number;
  outNow: number;
};

const TABULATOR_OPTIONS: ReactTabulatorOptions = {
  layout: "fitColumns",
  tooltips: true,
  height: 420,
  placeholder: "No data found.",
  columnMinWidth: 110,
  resizableColumns: true,
};

const getLastValue = (arr: MetricPoint[]) => arr[arr.length - 1]?.value ?? 0;

export default function QueueDashboardContent() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQueueId, setSelectedQueueId] = useState<string>(() => {
    return (QUEUES_STATUS[0] as QueueItem | undefined)?.id ?? "";
  });

  const tabRef = useRef<any>(null);

  const selectedQueue = useMemo(() => {
    return (
      (QUEUES_STATUS as QueueItem[]).find((q) => q.id === selectedQueueId) ??
      null
    );
  }, [selectedQueueId]);

  const selectedServer = useMemo(() => {
    if (!selectedQueue) return null;
    return SERVERS.find((s: any) => s.id === selectedQueue.serverId) ?? null;
  }, [selectedQueue]);

  const rows: QueueRow[] = useMemo(() => {
    const serverMap = new Map(
      (SERVERS as any[]).map((s) => [s.id, s] as const)
    );

    return (QUEUES_STATUS as QueueItem[]).map((q) => {
      const s = serverMap.get(q.serverId);
      return {
        id: q.id,
        name: q.name,
        serverId: q.serverId,
        serverLabel: s?.label ?? q.serverId,
        region: s?.region ?? "-",

        depthNow: getLastValue(q.depth),
        threshold: q.threshold,
        lagNow: getLastValue(q.lag),
        inNow: getLastValue(q.inMsgPerSec),
        outNow: getLastValue(q.outMsgPerSec),
      };
    });
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.serverLabel.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q)
      );
    });
  }, [rows, searchTerm]);

  const columns: ColumnDefinition[] = useMemo(
    () => [
      { title: "Id", field: "id", visible: false },

      { title: "Queue", field: "name", width: 180 },
      { title: "Server", field: "serverLabel", width: 100 },
      { title: "Region", field: "region", width: 100 },

      { title: "Depth", field: "depthNow", hozAlign: "right", width: 110 },
      { title: "Threshold", field: "threshold", hozAlign: "right", width: 120 },
      { title: "Lag", field: "lagNow", hozAlign: "right", width: 90 },
      { title: "In Msg/s", field: "inNow", hozAlign: "right", width: 110 },
      { title: "Out Msg/s", field: "outNow", hozAlign: "right", width: 120 },
    ],
    []
  );

  // 첫 row를 “Tabulator 선택”으로 확실히 선택시키는 함수
  const selectFirstRow = () => {
    const table = tabRef.current?.table;
    if (!table) return;

    const rows = table.getRows?.() ?? [];
    if (rows.length === 0) return;

    const first = rows[0];
    const data = first.getData() as QueueRow;

    first.select(); // tabulator-selected 적용
    setSelectedQueueId(data.id);
  };

  // 차트 1) Queue(실선) vs Threshold(빨간 점선)
  const depthDatasets = useMemo(() => {
    if (!selectedQueue) return [];

    return [
      {
        label: "Queue",
        data: selectedQueue.depth,
        borderColor: "#91b4e2",
        backgroundColor: addAlphaToHex("#91b4e2", 0.14),
        fill: false,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Threshold",
        data: selectedQueue.depth.map((p) => ({
          timestamp: p.timestamp,
          value: selectedQueue.threshold,
        })),
        borderColor: "#f44747",
        backgroundColor: "transparent",
        fill: false,
        tension: 0,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [6, 6],
      },
    ];
  }, [selectedQueue]);

  const lagDatasets = useMemo(() => {
    if (!selectedQueue) return [];
    return [
      {
        label: "Lag",
        data: selectedQueue.lag,
        borderColor: "#d7ba7d",
        backgroundColor: addAlphaToHex("#d7ba7d", 0.14),
        fill: true,
        tension: 0.25,
        pointRadius: 0,
      },
    ];
  }, [selectedQueue]);

  const inOutDatasets = useMemo(() => {
    if (!selectedQueue) return [];
    return [
      {
        label: "In Msg/s",
        data: selectedQueue.inMsgPerSec,
        borderColor: "#4ec9b0",
        backgroundColor: addAlphaToHex("#4ec9b0", 0.14),
        fill: false,
        tension: 0.25,
        pointRadius: 0,
      },
      {
        label: "Out Msg/s",
        data: selectedQueue.outMsgPerSec,
        borderColor: "#c586c0",
        backgroundColor: addAlphaToHex("#c586c0", 0.14),
        fill: false,
        tension: 0.25,
        pointRadius: 0,
      },
    ];
  }, [selectedQueue]);

  const selectedSummary = useMemo(() => {
    if (!selectedQueue) return null;
    const depthNow = getLastValue(selectedQueue.depth);
    const breached = depthNow > selectedQueue.threshold;
    return { depthNow, breached };
  }, [selectedQueue]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 상단 헤더 / 검색 */}
      <section className="rounded-lg border border-border-default bg-bg-default px-4 py-3 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-18s text-text-default">Queue Dashboard</h1>
            <p className="text-12r text-text-soft">
              큐별 Depth와 임계치(Threshold), 관련 지표(Lag/In/Out)를
              모니터링합니다.
            </p>

            {selectedQueue && (
              <p className="text-11r text-text-deep">
                Selected queue:{" "}
                <span className="text-sub_point">{selectedQueue.name}</span>{" "}
                {selectedServer && (
                  <span className="text-text-soft">
                    · {selectedServer.label} ({selectedServer.region})
                  </span>
                )}
                {selectedSummary && (
                  <>
                    {" "}
                    · depth:{" "}
                    <span
                      className={
                        selectedSummary.breached
                          ? "text-danger"
                          : "text-sub_point"
                      }
                    >
                      {selectedSummary.depthNow}
                    </span>{" "}
                    / th:{" "}
                    <span className="text-text-soft">
                      {selectedQueue.threshold}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-col gap-1">
              <label className="text-11r text-text-soft">Search queue</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="queue / server / region..."
                className="h-8 w-56 rounded border border-border-light bg-bg-dark px-2 text-12r text-text-light placeholder:text-text-deep focus:outline-none focus:ring-1 focus:ring-sub_point"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 메인 영역 */}
      <section className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12">
        {/* 테이블 */}
        <div className="lg:col-span-5 rounded-lg border border-border-default bg-bg-default px-2 py-3 md:px-3 md:py-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-12b text-text-soft">Queue List</h2>
            <span className="text-[11px] text-text-deep">
              임계치 초과는 붉게 표시됩니다.
            </span>
          </div>

          <div className="rounded border border-border-light bg-bg-dark/40">
            <ReactTabulatorNoSSR
              ref={tabRef}
              data={filteredRows}
              columns={columns}
              style={{ margin: "0rem 0rem" }}
              options={{
                ...TABULATOR_OPTIONS,
                selectable: 1, // Tabulator 선택 기능 사용
                rowFormatter: (row: RowComponent) => {
                  const el = row.getElement();
                  const rowData = row.getData() as QueueRow;

                  const breached = rowData.depthNow > rowData.threshold;
                  el.classList.toggle("queue-row-breached", breached);
                },
              }}
              events={{
                // 렌더 완료 시점에 첫 row 자동 선택 (가장 안정적)
                renderComplete: () => {
                  const table = tabRef.current?.table;
                  if (!table) return;

                  const selected = table.getSelectedRows?.() ?? [];
                  if (selected.length === 0) selectFirstRow();
                },

                rowClick: (_e: MouseEvent, row: RowComponent) => {
                  row.select(); // tabulator-selected 자동 적용
                  const rowData = row.getData() as QueueRow;
                  setSelectedQueueId(rowData.id);
                },
              }}
            />
          </div>
        </div>

        {/* 차트 */}
        <div className="lg:col-span-7 flex flex-col gap-3 md:gap-4">
          <div className="rounded-lg border border-border-default bg-bg-default p-3 pb-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-12b text-text-soft">Queue Depth</h2>
              <span className="text-[11px] text-text-deep">
                Queue = solid · Threshold = red dashed
              </span>
            </div>

            <div className="h-[220px]">
              {selectedQueue ? (
                <CustomChart
                  type="line"
                  datasets={depthDatasets as any}
                  options={{
                    height: 210,
                    animationOff: true,
                    tickCount: 8,
                    useCustomLegend: true,
                  }}
                />
              ) : (
                <div className="h-full rounded border border-border-light bg-bg-dark/40" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div className="rounded-lg border border-border-default bg-bg-default p-3 pb-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-12b text-text-soft">Consumer Lag</h2>
                <span className="text-[11px] text-text-deep">trend</span>
              </div>
              <div className="h-[150px]">
                <CustomChart
                  type="line"
                  datasets={lagDatasets as any}
                  options={{
                    height: 140,
                    animationOff: true,
                    tickCount: 6,
                    useCustomLegend: true,
                  }}
                  download={false}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border-default bg-bg-default p-3 pb-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-12b text-text-soft">In / Out Msg/s</h2>
                <span className="text-[11px] text-text-deep">trend</span>
              </div>
              <div className="h-[150px]">
                <CustomChart
                  type="line"
                  datasets={inOutDatasets as any}
                  options={{
                    height: 140,
                    animationOff: true,
                    tickCount: 6,
                    useCustomLegend: true,
                  }}
                  download={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 스타일: breached / selected */}
      <style jsx global>{`
        /* 임계치 초과 row */
        .tabulator .tabulator-row.queue-row-breached {
          background: ${addAlphaToHex("#e94848", 0.18)} !important;
        }

        /* 선택 row (Tabulator 기본 클래스) */
        .tabulator .tabulator-row.tabulator-selected {
          background: ${addAlphaToHex("#89bbe4", 0.22)} !important;
          outline: 1px solid ${addAlphaToHex("#89bbe4", 0.95)};
          outline-offset: -1px;
        }

        /* 둘 다(선택 + 임계치 초과) */
        .tabulator .tabulator-row.queue-row-breached.tabulator-selected {
          background: ${addAlphaToHex("#e94848", 0.28)} !important;
          outline: 1px solid ${addAlphaToHex("#e94848", 0.95)};
        }
      `}</style>
    </div>
  );
}
