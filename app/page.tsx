"use client";

import { BubblePoint, RadarPoint, ChartPoint } from "@/app/types/dashboard";
import CardSection from "./contents/cardSection";
import ChartSection1 from "./contents/chartSection1";
import ChartSection2 from "./contents/chartSection2";
import ChartSection3 from "./contents/chartSection3";

const bubblePerfData: BubblePoint[] = [
  // 상단 오른쪽: 빌드 시간 길고, 커버리지 높음
  { x: 6.8, y: 93, r: 9, label: "web" },
  { x: 6.2, y: 90, r: 7.5, label: "api" },
  { x: 5.7, y: 88, r: 6, label: "worker" },
  { x: 7.4, y: 85, r: 7, label: "admin" },

  // 중앙~왼쪽 아래: 빌드 시간 짧고, 커버리지 낮음)
  { x: 4.1, y: 78, r: 4, label: "user1" },
  { x: 4.4, y: 72, r: 3.5, label: "user2" },
  { x: 4.8, y: 48, r: 3.8, label: "user3" },
  { x: 5.0, y: 62, r: 3.2, label: "user4" },
];

const radarQualityData: RadarPoint[] = [
  { label: "Test Coverage", value: 82 },
  { label: "Build Stability", value: 90 },
  { label: "Issue Response", value: 75 },
  { label: "Code Review", value: 88 },
  { label: "Deployment Speed", value: 70 },
];

export default function DashboardContent() {
  const points = 8;
  const BASE_TS = 1_700_000_000_000;

  // ────────────── 메인 빌드/이슈 데이터 ──────────────
  const buildDurationData: ChartPoint[] = Array.from(
    { length: points },
    (_, i) => ({
      timestamp: BASE_TS + i * 60 * 60 * 1000,
      value: 4 + ((i * 2) % 5),
    })
  );

  const buildDurationDataPrev: ChartPoint[] = Array.from(
    { length: points },
    (_, i) => ({
      timestamp: BASE_TS + i * 60 * 60 * 1000,
      value: 3 + ((i * 3) % 6),
    })
  );

  const openIssuesTotal: ChartPoint[] = Array.from(
    { length: points },
    (_, i) => ({
      timestamp: BASE_TS + i * 60 * 60 * 1000,
      value: 5 + ((i * 4) % 8),
    })
  );

  const openIssuesCritical: ChartPoint[] = Array.from(
    { length: points },
    (_, i) => ({
      timestamp: BASE_TS + i * 60 * 60 * 1000,
      value: 1 + (i % 3),
    })
  );

  // ────────────── 하단에 추가할 데이터들 ──────────────
  // Build 성공/실패 추이 (막대 차트)
  const buildSucceeded: ChartPoint[] = Array.from(
    { length: points },
    (_, i) => ({
      timestamp: BASE_TS + i * 60 * 60 * 1000,
      value: 8 - (i % 3), // 8,7,6 반복 느낌
    })
  );

  const buildFailed: ChartPoint[] = Array.from({ length: points }, (_, i) => ({
    timestamp: BASE_TS + i * 60 * 60 * 1000,
    value: i % 3,
  }));

  // Test Coverage (%) 추이 (라인 차트)
  const testCoverageTrend = {
    primary: 3.41,
    replica: 6.273,
    available: 7.8,
  };

  const testCoverageTrend2 = {
    primary: 34,
    replica: 63,
    available: 78,
  };

  // ────────────── 카드용 요약 숫자 ──────────────
  const latestDuration =
    buildDurationData[buildDurationData.length - 1]?.value ?? 0;

  const avgDuration =
    Math.round(
      (buildDurationData.reduce((sum, p) => sum + p.value, 0) /
        buildDurationData.length) *
        10
    ) / 10;

  const totalOpenIssues =
    openIssuesTotal[openIssuesTotal.length - 1]?.value ?? 0;
  const totalCriticalIssues =
    openIssuesCritical[openIssuesCritical.length - 1]?.value ?? 0;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 상단 요약 카드 영역 */}
      <CardSection
        data={{
          latestDuration: latestDuration,
          avgDuration: avgDuration,
          totalOpenIssues: totalOpenIssues,
          totalCriticalIssues: totalCriticalIssues,
        }}
      />

      {/* 1단: (Build Success + Test Coverage) */}
      <ChartSection3
        points={points}
        data={{
          testCoverageTrend: testCoverageTrend,
          testCoverageTrend2: testCoverageTrend2,
          buildSucceeded: buildSucceeded,
          buildFailed: buildFailed,
        }}
      />
      {/* 2단: Fancy Charts (Bubble + Radar) */}
      <ChartSection2
        data={{
          bubblePerfData: bubblePerfData,
          openIssuesTotal: openIssuesTotal,
          openIssuesCritical: openIssuesCritical,
        }}
      />
      {/* 3단: (Duration + Issues) */}
      <ChartSection1
        points={points}
        data={{
          buildDurationData: buildDurationData,
          buildDurationDataPrev: buildDurationDataPrev,
          radarQualityData: radarQualityData,
        }}
      />
    </div>
  );
}
