import { ChartPoint } from "./dashboard";

export type QueueSeries = {
  id: string;
  name: string;
  serverId: string;
  metrics: ChartPoint[];
};
