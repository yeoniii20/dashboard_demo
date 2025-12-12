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
