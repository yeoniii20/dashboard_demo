export type ChartPoint = {
  timestamp: number;
  value: number;
};

export type TimePoint = {
  timestamp: number;
  value: number;
};

export type BubblePoint = {
  x: number;
  y: number;
  r: number;
  label?: string;
};

export type RadarPoint = {
  label: string;
  value: number;
};
