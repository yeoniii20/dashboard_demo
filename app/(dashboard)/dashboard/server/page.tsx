"use client";

import { ColumnDefinition } from "react-tabulator";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { SERVER_DATA } from "@/app/data/server";
import { ServerRow } from "@/app/types/server";

const ReactTabulatorNoSSR = dynamic(
  () => import("react-tabulator").then((m) => m.ReactTabulator),
  { ssr: false }
);

const ServerPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Healthy" | "Degraded" | "Down"
  >("ALL");

  const columns: ColumnDefinition[] = [
    { title: "Server", field: "name", widthGrow: 1 },
    { title: "Cluster", field: "cluster", widthGrow: 1 },
    {
      title: "Role",
      field: "role",
      width: 90,
      formatter: (cell: any) => {
        const value = cell.getValue();
        return value === "primary" ? "Primary" : "Replica";
      },
    },
    {
      title: "Status",
      field: "status",
      width: 100,
      formatter: (cell: any) => {
        const value: ServerRow["status"] = cell.getValue();
        const color =
          value === "Healthy"
            ? "#4ec9b0"
            : value === "Degraded"
            ? "#d7ba7d"
            : "#f44747";
        return `<span style="color:${color};font-weight:500;">${value}</span>`;
      },
    },
    {
      title: "CPU %",
      field: "cpu",
      hozAlign: "right",
      width: 90,
    },
    {
      title: "Memory %",
      field: "memory",
      hozAlign: "right",
      width: 110,
    },
    {
      title: "Queues",
      field: "queueCount",
      hozAlign: "right",
      width: 100,
    },
    {
      title: "Topics",
      field: "topicCount",
      hozAlign: "right",
      width: 100,
    },
    {
      title: "Latency (ms)",
      field: "latencyMs",
      hozAlign: "right",
      width: 125,
    },
  ];

  const filteredData = useMemo(() => {
    return SERVER_DATA.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.cluster.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.region.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 상단 헤더 / 필터 영역 */}
      <section className="rounded-lg border border-border-default bg-bg-default px-4 py-3 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-18s text-text-default">Server Dashboard</h1>
            <p className="text-12r text-text-soft">
              클러스터 내 서버 상태와 리소스 사용 현황을 테이블로 확인합니다.
            </p>
            <p className="text-11 text-text-deep">
              Total servers:{" "}
              <span className="text-sub_point">{SERVER_DATA.length}</span> ·
              Showing:{" "}
              <span className="text-sub_point">{filteredData.length}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {/* Status 필터 */}
            <div className="flex flex-col gap-1">
              <label className="text-11 text-text-soft">Status</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="h-8 rounded border border-border-light bg-bg-dark px-2 text-12r text-text-light focus:outline-none focus:ring-1 focus:ring-sub_point"
              >
                <option value="ALL">All</option>
                <option value="Healthy">Healthy</option>
                <option value="Degraded">Degraded</option>
                <option value="Down">Down</option>
              </select>
            </div>

            {/* 검색 */}
            <div className="flex flex-col gap-1 md:ml-3">
              <label className="text-11 text-text-soft">Search</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="server / cluster / region..."
                className="h-8 w-56 rounded border border-border-light bg-bg-dark px-2 text-12r text-text-light placeholder:text-text-deep focus:outline-none focus:ring-1 focus:ring-sub_point"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 서버 테이블 */}
      <section className="rounded-lg border border-border-default bg-bg-default px-2 py-3 md:px-3 md:py-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-12b text-text-soft">Server List</h2>
          <span className="text-[11px] text-text-deep">
            정렬, 컬럼 리사이즈, 스크롤이 가능합니다.
          </span>
        </div>

        <div className="rounded border border-border-light bg-bg-dark/40">
          <ReactTabulatorNoSSR
            data={filteredData}
            columns={columns}
            layout={"fitColumns"}
            style={{ margin: "0rem 0rem" }}
            options={{
              //   height: 420,
              resizableColumns: true,
              responsiveLayout: "collapse",
              tooltips: true,
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default ServerPage;
