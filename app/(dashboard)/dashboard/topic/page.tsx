"use client";

import { useMemo, useState } from "react";
import CustomChart from "@/app/components/chart/customChart";
import { TOPICS } from "@/app/data/topic";
import { SERVERS } from "@/app/data/server";

export default function TopicDashboardContent() {
  const [selectedServerId, setSelectedServerId] = useState<string>("kr-main-1");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selectedServer = useMemo(
    () => SERVERS.find((s) => s.id === selectedServerId),
    [selectedServerId]
  );

  const filteredTopics = useMemo(
    () =>
      TOPICS.filter((t) => t.serverId === selectedServerId).filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [selectedServerId, searchTerm]
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 상단 필터 / 서치 영역 */}
      <section className="rounded-lg border border-border-default bg-bg-default px-4 py-3 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-18s text-text-default">Topic Dashboard</h1>
            <p className="text-12r text-text-soft">
              서버별 Topic의 메시지 처리량 트렌드를 모니터링합니다.
            </p>
            {selectedServer && (
              <p className="text-11 text-text-deep">
                Selected server:{" "}
                <span className="text-sub_point">{selectedServer.label}</span>{" "}
                <span className="text-text-soft">
                  ({selectedServer.region})
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {/* 서버 선택 */}
            <div className="flex flex-col gap-1">
              <label className="text-11 text-text-soft">Server</label>
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="h-8 rounded border border-border-light bg-bg-dark px-2 text-12r text-text-light focus:outline-none focus:ring-1 focus:ring-sub_point"
              >
                {SERVERS.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.label} · {server.region}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic 이름 검색 */}
            <div className="flex flex-col gap-1 md:ml-3">
              <label className="text-11 text-text-soft">Search topic</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="topic.order.event, notification..."
                className="h-8 w-52 rounded border border-border-light bg-bg-dark px-2 text-12r text-text-light placeholder:text-text-deep focus:outline-none focus:ring-1 focus:ring-sub_point"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Topic 라인 차트들 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-12b text-text-soft">
            Topics ({filteredTopics.length})
          </h2>
          <span className="text-[11px] text-text-deep">
            각 차트는 메시지 처리량 (messages/sec)을 나타냅니다.
          </span>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="rounded-lg border border-border-default bg-bg-default px-4 py-6 text-center text-12r text-text-soft">
            선택한 서버에서 검색어에 해당하는 Topic이 없습니다.
          </div>
        ) : (
          <div
            className="
              grid gap-3
              md:gap-4
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              lx:grid-cols-4
              xl2:grid-cols-5
            "
          >
            {filteredTopics.map((topic) => {
              const latest =
                topic.metrics[topic.metrics.length - 1]?.value ?? 0;
              const maxRate = topic.metrics.reduce(
                (max, p) => (p.value > max ? p.value : max),
                0
              );

              return (
                <div
                  key={topic.id}
                  className="flex flex-col gap-2 rounded-lg border border-border-default bg-bg-default p-3 pb-5"
                >
                  {/* Topic 제목 / 요약 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="truncate text-12m text-text-light">
                        {topic.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-text-deep">
                        <span className="rounded bg-bg-hover px-1.5 py-[1px]">
                          messages/sec
                        </span>
                        <span>
                          now: <span className="text-sub_point">{latest}</span>
                        </span>
                        <span className="hidden xl2:inline">
                          · max: <span className="text-warning">{maxRate}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-deep">
                      {topic.serverId}
                    </span>
                  </div>

                  {/* 라인 차트 */}
                  <div className="h-[130px]">
                    <CustomChart
                      type="line"
                      datasets={[
                        {
                          label: "messages/sec",
                          data: topic.metrics,
                          borderColor: "#91b4e2",
                          backgroundColor: "#91b4e233",
                          fill: true,
                          tension: 0.3,
                          pointRadius: 0,
                        },
                      ]}
                      options={{
                        height: 120,
                        showLegend: false,
                        animationOff: true,
                        tickCount: 4,
                        useCustomLegend: true,
                      }}
                      download={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
