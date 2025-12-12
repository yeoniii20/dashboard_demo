import { ChartPoint } from "../types/dashboard";
import { TopicSeries } from "../types/topic";

const POINTS = 24; // 최근 24 포인트
const BASE_TS = 1_700_000_000_000;

// deterministic 시계열 생성 (5분 간격)
const buildTopicSeries = (
  serverIndex: number,
  topicIndex: number
): ChartPoint[] =>
  Array.from({ length: POINTS }, (_, i) => ({
    timestamp: BASE_TS + i * 5 * 60 * 1000,
    value: 20 + ((serverIndex * 23 + topicIndex * 13 + i * 7) % 90),
  }));

export const TOPICS: TopicSeries[] = [
  // KR-MAIN-1
  {
    id: "t-kr-main-1-0",
    name: "topic.user.activity",
    serverId: "kr-main-1",
    metrics: buildTopicSeries(0, 0),
  },
  {
    id: "t-kr-main-1-1",
    name: "topic.order.event",
    serverId: "kr-main-1",
    metrics: buildTopicSeries(0, 1),
  },
  {
    id: "t-kr-main-1-2",
    name: "topic.payment.event",
    serverId: "kr-main-1",
    metrics: buildTopicSeries(0, 2),
  },
  {
    id: "t-kr-main-1-3",
    name: "topic.notification.broadcast",
    serverId: "kr-main-1",
    metrics: buildTopicSeries(0, 3),
  },
  {
    id: "t-kr-main-1-4",
    name: "topic.notification.personal",
    serverId: "kr-main-1",
    metrics: buildTopicSeries(0, 4),
  },

  // KR-MAIN-2
  {
    id: "t-kr-main-2-0",
    name: "topic.inventory.change",
    serverId: "kr-main-2",
    metrics: buildTopicSeries(1, 0),
  },
  {
    id: "t-kr-main-2-1",
    name: "topic.shipping.status",
    serverId: "kr-main-2",
    metrics: buildTopicSeries(1, 1),
  },
  {
    id: "t-kr-main-2-2",
    name: "topic.settlement.result",
    serverId: "kr-main-2",
    metrics: buildTopicSeries(1, 2),
  },
  {
    id: "t-kr-main-2-3",
    name: "topic.billing.event",
    serverId: "kr-main-2",
    metrics: buildTopicSeries(1, 3),
  },

  // US-CENTRAL-1
  {
    id: "t-us-central-1-0",
    name: "topic.analytics.raw",
    serverId: "us-central-1",
    metrics: buildTopicSeries(2, 0),
  },
  {
    id: "t-us-central-1-1",
    name: "topic.analytics.aggregated",
    serverId: "us-central-1",
    metrics: buildTopicSeries(2, 1),
  },
  {
    id: "t-us-central-1-2",
    name: "topic.search.query",
    serverId: "us-central-1",
    metrics: buildTopicSeries(2, 2),
  },
  {
    id: "t-us-central-1-3",
    name: "topic.search.indexing",
    serverId: "us-central-1",
    metrics: buildTopicSeries(2, 3),
  },
];
