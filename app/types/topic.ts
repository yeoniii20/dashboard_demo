import { ChartPoint } from "./dashboard";

export type TopicSeries = {
  id: string;
  name: string;
  serverId: string;
  metrics: ChartPoint[];
};
