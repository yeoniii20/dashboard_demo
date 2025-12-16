// Chart.js/react-chartjs-2에서 만들어진 chartData를 xlsx로 저장하는 유틸
type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "doughnut"
  | "bubble"
  | "radar"
  | "polarArea";

type ChartDataLike = {
  labels?: any[];
  datasets: Array<{
    label?: string;
    data: any;
  }>;
};

type ExportXlsxParams = {
  chartData: ChartDataLike;
  type: ChartType;
  filename?: string;
  sheetName?: string;
};

const toSafeFileName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "chart_data.xlsx";
  return trimmed.toLowerCase().endsWith(".xlsx") ? trimmed : `${trimmed}.xlsx`;
};

const isTimePoint = (v: any): v is { x: number; y: number } =>
  v && typeof v === "object" && typeof v.x === "number" && "y" in v;

const isBubblePoint = (v: any): v is { x: number; y: number; r?: number } =>
  v &&
  typeof v === "object" &&
  typeof v.x === "number" &&
  typeof v.y === "number";

const formatTime = (x: any) => {
  if (typeof x === "number") return new Date(x).toLocaleString();
  const d = new Date(x);
  return isNaN(d.getTime()) ? String(x) : d.toLocaleString();
};

export async function exportChartDataToXlsx({
  chartData,
  type,
  filename = "chart_data.xlsx",
  sheetName = "ChartData",
}: ExportXlsxParams) {
  if (!chartData?.datasets?.length) return;

  const XLSX = await import("xlsx");
  const { saveAs } = await import("file-saver");

  let rows: Record<string, any>[] = [];

  // 1) LINE / BAR : time-series {x,y} 배열
  if (type === "line" || type === "bar") {
    const timeSet = new Set<number>();

    const series = chartData.datasets.map((ds, dsIdx) => {
      const label = ds.label ?? `Series ${dsIdx + 1}`;
      const points = Array.isArray(ds.data) ? ds.data : [];

      const map = new Map<number, any>();
      points.forEach((p: any) => {
        if (!isTimePoint(p)) return;
        timeSet.add(p.x);
        map.set(p.x, p.y);
      });

      return { label, map };
    });

    const times = Array.from(timeSet).sort((a, b) => a - b);

    rows = times.map((t) => {
      const row: Record<string, any> = { Time: formatTime(t) };
      series.forEach((s) => {
        row[s.label] = s.map.get(t) ?? null;
      });
      return row;
    });
  }

  // 2) PIE / DOUGHNUT / POLARAREA : labels + number[]
  else if (type === "pie" || type === "doughnut" || type === "polarArea") {
    const labels = chartData.labels ?? [];
    rows = [];

    chartData.datasets.forEach((ds, dsIdx) => {
      const dsLabel = ds.label ?? `Dataset ${dsIdx + 1}`;
      const values: any[] = Array.isArray(ds.data) ? ds.data : [];

      labels.forEach((lb, i) => {
        rows.push({
          Dataset: dsLabel,
          Label: lb,
          Value: values[i] ?? null,
        });
      });
    });
  }

  // 3) RADAR : labels + number[] (dataset 여러 개일 수 있음)
  else if (type === "radar") {
    const labels = chartData.labels ?? [];
    const dsList = chartData.datasets.map((ds, dsIdx) => ({
      label: ds.label ?? `Series ${dsIdx + 1}`,
      values: Array.isArray(ds.data) ? ds.data : [],
    }));

    rows = labels.map((lb, i) => {
      const row: Record<string, any> = { Label: lb };
      dsList.forEach((ds) => (row[ds.label] = ds.values[i] ?? null));
      return row;
    });
  }

  // 4) BUBBLE : {x,y,r}[]
  else if (type === "bubble") {
    rows = [];
    chartData.datasets.forEach((ds, dsIdx) => {
      const dsLabel = ds.label ?? `Dataset ${dsIdx + 1}`;
      const points: any[] = Array.isArray(ds.data) ? ds.data : [];

      points.forEach((p) => {
        if (!isBubblePoint(p)) return;
        rows.push({
          Dataset: dsLabel,
          X: p.x,
          Y: p.y,
          R: p.r ?? null,
        });
      });
    });
  }

  // 5) 기타 타입
  else {
    rows = [{ chartData: JSON.stringify(chartData) }];
  }

  if (!rows.length) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, toSafeFileName(filename));
}
