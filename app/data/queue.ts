import { ChartPoint } from "../types/dashboard";
import { QueueSeries } from "../types/queue";

const POINTS = 24; // 최근 24 포인트 (예: 24 * 5분 = 2시간)
const BASE_TS = 1_700_000_000_000;

// deterministic한 시계열 생성 (5분 간격)
export const buildQueueSeries = (
  serverIndex: number,
  queueIndex: number
): ChartPoint[] =>
  Array.from({ length: POINTS }, (_, i) => ({
    timestamp: BASE_TS + i * 5 * 60 * 1000,
    value: 10 + ((serverIndex * 17 + queueIndex * 11 + i * 5) % 110),
  }));

// 큐 목록 (서버별)
export const QUEUES: QueueSeries[] = [
  // KR-MAIN-1
  {
    id: "q-kr-main-1-0",
    name: "queue.payment.process",
    serverId: "kr-main-1",
    metrics: buildQueueSeries(0, 0),
  },
  {
    id: "q-kr-main-1-1",
    name: "queue.payment.retry",
    serverId: "kr-main-1",
    metrics: buildQueueSeries(0, 1),
  },
  {
    id: "q-kr-main-1-2",
    name: "queue.notification.email",
    serverId: "kr-main-1",
    metrics: buildQueueSeries(0, 2),
  },
  {
    id: "q-kr-main-1-3",
    name: "queue.notification.sms",
    serverId: "kr-main-1",
    metrics: buildQueueSeries(0, 3),
  },
  {
    id: "q-kr-main-1-4",
    name: "queue.user.signup",
    serverId: "kr-main-1",
    metrics: buildQueueSeries(0, 4),
  },

  // KR-MAIN-2
  {
    id: "q-kr-main-2-0",
    name: "queue.order.create",
    serverId: "kr-main-2",
    metrics: buildQueueSeries(1, 0),
  },
  {
    id: "q-kr-main-2-1",
    name: "queue.order.cancel",
    serverId: "kr-main-2",
    metrics: buildQueueSeries(1, 1),
  },
  {
    id: "q-kr-main-2-2",
    name: "queue.settlement.daily",
    serverId: "kr-main-2",
    metrics: buildQueueSeries(1, 2),
  },
  {
    id: "q-kr-main-2-3",
    name: "queue.settlement.monthly",
    serverId: "kr-main-2",
    metrics: buildQueueSeries(1, 3),
  },

  // US-CENTRAL-1
  {
    id: "q-us-central-1-0",
    name: "queue.analytics.event",
    serverId: "us-central-1",
    metrics: buildQueueSeries(2, 0),
  },
  {
    id: "q-us-central-1-1",
    name: "queue.analytics.batch",
    serverId: "us-central-1",
    metrics: buildQueueSeries(2, 1),
  },
  {
    id: "q-us-central-1-2",
    name: "queue.cache.warmup",
    serverId: "us-central-1",
    metrics: buildQueueSeries(2, 2),
  },
  {
    id: "q-us-central-1-3",
    name: "queue.search.index",
    serverId: "us-central-1",
    metrics: buildQueueSeries(2, 3),
  },
];

export type MetricPoint = { timestamp: number; value: number };

export type QueueItem = {
  id: string;
  serverId: string;
  name: string;
  threshold: number;

  depth: MetricPoint[];
  lag: MetricPoint[];
  inMsgPerSec: MetricPoint[];
  outMsgPerSec: MetricPoint[];
};

const NOW = Date.now();
const POINTS2 = 60; // 최근 60포인트
const STEP_MS = 60_000; // 1분 간격

const ts = (i: number) => NOW - (POINTS2 - 1 - i) * STEP_MS;

// 시계열 생성기
function genSeries(params: {
  base: number;
  amp: number;
  wave: number; // 파동 주기(작을수록 출렁임 잦음)
  spikeEvery?: number; // N포인트마다 스파이크
  spikeAdd?: number; // 스파이크 크기
  min?: number;
  max?: number;
}) {
  const {
    base,
    amp,
    wave,
    spikeEvery = 0,
    spikeAdd = 0,
    min = 0,
    max = Number.POSITIVE_INFINITY,
  } = params;

  return Array.from({ length: POINTS }, (_, i) => {
    const w = Math.sin(i / wave);
    const spike = spikeEvery > 0 && i % spikeEvery === 0 ? spikeAdd : 0;
    const raw = base + amp * w + spike;
    const clamped = Math.min(max, Math.max(min, raw));
    return { timestamp: ts(i), value: Math.round(clamped) };
  });
}

function genLagFromDepth(depth: MetricPoint[], scale = 18, bias = 2) {
  return depth.map((p, i) => {
    const wobble = Math.cos(i / 7) * 2;
    return {
      timestamp: p.timestamp,
      value: Math.max(0, Math.round(p.value / scale + bias + wobble)),
    };
  });
}

function genInOut(params: {
  baseIn: number;
  baseOut: number;
  amp: number;
  wave: number;
  outLag?: number;
}) {
  const { baseIn, baseOut, amp, wave, outLag = 2 } = params;

  const inSeries = Array.from({ length: POINTS }, (_, i) => {
    const v = baseIn + amp * Math.sin(i / wave) + Math.cos(i / 9) * 3;
    return { timestamp: ts(i), value: Math.max(0, Math.round(v)) };
  });

  const outSeries = Array.from({ length: POINTS }, (_, i) => {
    const j = Math.max(0, i - outLag);
    const v = baseOut + amp * Math.sin(j / wave) + Math.cos(j / 10) * 2;
    return { timestamp: ts(i), value: Math.max(0, Math.round(v)) };
  });

  return { inSeries, outSeries };
}

export const QUEUES_STATUS: QueueItem[] = [
  // -----------------------
  // kr-main-1
  // -----------------------
  (() => {
    const depth = genSeries({
      base: 135,
      amp: 28,
      wave: 5,
      spikeEvery: 17,
      spikeAdd: 55,
      min: 0,
    });
    const lag = genLagFromDepth(depth, 14, 3);
    const { inSeries, outSeries } = genInOut({
      baseIn: 105,
      baseOut: 98,
      amp: 18,
      wave: 4.5,
      outLag: 2,
    });

    return {
      id: "q-kr-main-1-payment",
      serverId: "kr-main-1",
      name: "queue.payment.events",
      threshold: 150,
      depth,
      lag,
      inMsgPerSec: inSeries,
      outMsgPerSec: outSeries,
    };
  })(),

  (() => {
    const depth = genSeries({
      base: 70,
      amp: 18,
      wave: 6,
      spikeEvery: 0,
      spikeAdd: 0,
      min: 0,
    });
    const lag = genLagFromDepth(depth, 22, 1);
    const { inSeries, outSeries } = genInOut({
      baseIn: 80,
      baseOut: 82,
      amp: 12,
      wave: 6,
      outLag: 1,
    });

    return {
      id: "q-kr-main-1-order",
      serverId: "kr-main-1",
      name: "queue.order.created",
      threshold: 150,
      depth,
      lag,
      inMsgPerSec: inSeries,
      outMsgPerSec: outSeries,
    };
  })(),

  (() => {
    const depth = genSeries({
      base: 160,
      amp: 22,
      wave: 7,
      spikeEvery: 23,
      spikeAdd: 35,
      min: 0,
    });
    const lag = genLagFromDepth(depth, 16, 2);
    const { inSeries, outSeries } = genInOut({
      baseIn: 92,
      baseOut: 88,
      amp: 14,
      wave: 7,
      outLag: 3,
    });

    return {
      id: "q-kr-main-1-noti",
      serverId: "kr-main-1",
      name: "queue.notification.push",
      threshold: 165,
      depth,
      lag,
      inMsgPerSec: inSeries,
      outMsgPerSec: outSeries,
    };
  })(),

  // -----------------------
  // kr-edge-2
  // -----------------------
  (() => {
    const depth = genSeries({
      base: 185,
      amp: 30,
      wave: 5.5,
      spikeEvery: 19,
      spikeAdd: 60,
      min: 0,
    });
    const lag = genLagFromDepth(depth, 13, 4);
    const { inSeries, outSeries } = genInOut({
      baseIn: 120,
      baseOut: 105,
      amp: 22,
      wave: 5,
      outLag: 3,
    });

    return {
      id: "q-kr-edge-2-shipment",
      serverId: "kr-edge-2",
      name: "queue.shipment.update",
      threshold: 200,
      depth,
      lag,
      inMsgPerSec: inSeries,
      outMsgPerSec: outSeries,
    };
  })(),

  (() => {
    const depth = genSeries({
      base: 95,
      amp: 16,
      wave: 8,
      spikeEvery: 0,
      spikeAdd: 0,
      min: 0,
    });
    const lag = genLagFromDepth(depth, 24, 1);
    const { inSeries, outSeries } = genInOut({
      baseIn: 75,
      baseOut: 77,
      amp: 10,
      wave: 8,
      outLag: 1,
    });

    return {
      id: "q-kr-edge-2-audit",
      serverId: "kr-edge-2",
      name: "queue.audit.log",
      threshold: 160,
      depth,
      lag,
      inMsgPerSec: inSeries,
      outMsgPerSec: outSeries,
    };
  })(),

  (() => {
    const depth = genSeries({
      base: 170,
      amp: 18,
      wave: 9,
      spikeEvery: 29,
      spikeAdd: 25,
      min: 0,
    });
    const lag = genLagFromDepth(depth, 12, 5);
    const { inSeries, outSeries } = genInOut({
      baseIn: 98,
      baseOut: 85,
      amp: 16,
      wave: 9,
      outLag: 4,
    });

    return {
      id: "q-kr-edge-2-analytics",
      serverId: "kr-edge-2",
      name: "queue.analytics.ingest",
      threshold: 205,
      depth,
      lag,
      inMsgPerSec: inSeries,
      outMsgPerSec: outSeries,
    };
  })(),
];
