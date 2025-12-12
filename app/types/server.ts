export type ServerRow = {
  id: string;
  name: string;
  cluster: string;
  region: string;
  role: "primary" | "replica";
  status: "Healthy" | "Degraded" | "Down";
  cpu: number; // %
  memory: number; // %
  queueCount: number;
  topicCount: number;
  latencyMs: number;
  uptime: string;
};
