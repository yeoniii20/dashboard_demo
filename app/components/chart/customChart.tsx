import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  RadialLinearScale,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Bubble,
  Radar,
  PolarArea,
} from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { useEffect, useRef, useState } from "react";
import { merge } from "lodash";
import { ChartSkeleton } from "../skeleton/chartSkeleton";
import { addAlphaToHex } from "@/app/utils/alphaToHex";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  RadialLinearScale,
  BarElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

type Dataset = {
  label: string;
  data: any;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
  tension?: number;
  borderDash?: number[];
  pointRadius?: number;
  borderWidth?: number;
  chartType?: "line" | "bar";
};

type ChartWidgetProps = {
  type: "line" | "bar" | "pie" | "doughnut" | "bubble" | "radar" | "polarArea";
  datasets: Dataset[];
  options?: {
    backgroundColor?: string;
    borderColor?: string;
    showLegend?: boolean;
    legendPosition?: "top" | "bottom" | "left" | "right";
    legendColor?: string;
    height?: number;
    animationOff?: boolean;
    useCustomLegend?: boolean;
    useCustomPieLegend?: boolean;
    /** x축 tick 개수 제한 (옵셔널) */
    tickCount?: number;
  };
  onElementClick?: (data: {
    datasetIndex: number;
    index: number;
    label: any;
    value: any;
    datasetLabel: string;
  }) => void;
  download?: boolean;
};

const CustomChart = ({
  type,
  datasets,
  options,
  onElementClick,
  download = true,
}: ChartWidgetProps) => {
  const [chartData, setChartData] = useState<any | null>(null);
  const [chartOptions, setChartOptions] = useState<any>();
  const [hovered, setHovered] = useState<boolean>(false);
  const chartRef = useRef<any>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const pieOriginalValuesRef = useRef<number[]>([]);

  const isPieChart =
    type === "pie" || type === "doughnut" || type === "polarArea";
  const isBubbleChart = type === "bubble";
  const isRadarChart = type === "radar";

  const DEFAULT_MAX_TICKS = 20;

  const baseOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !(options?.useCustomPieLegend || options?.useCustomLegend),

        labels:
          isPieChart && !options?.useCustomPieLegend
            ? {
                font: {
                  size: 14,
                  weight: "500",
                },
                color: options?.legendColor ?? "#afb4bb",
              }
            : {
                font: {
                  size: 12,
                },
                color: options?.legendColor ?? "#afb4bb",
              },

        position: options?.legendPosition ?? "bottom",
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            // 라인/바 차트 → dataset label + 값
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;

            // 파이차트 → 값만 표시
            if (isPieChart || isRadarChart) return `${context.raw}`;
            if (isBubbleChart) return `${value}`;

            return `[ ${datasetLabel} ] ${value}`;
          },
        },
      },
    },

    // y축만 기본 설정, x축은 아래 useEffect에서 span 보고 동적으로 설정
    scales: !isPieChart
      ? {
          y: {
            beginAtZero: true,
          },
        }
      : undefined,
  };

  const renderPieLegend = (chart: any) => {
    const legendContainer = legendRef.current;
    if (!legendContainer) return;

    const labels = chart.options.plugins.legend.labels.generateLabels(chart);
    legendContainer.innerHTML = "";

    labels.forEach((label: any, sliceIndex: number) => {
      const meta = chart.getDatasetMeta(0);
      const arc = meta.data[sliceIndex];

      const isHidden = arc.hidden === true;

      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "6px";
      item.style.padding = "4px 8px";
      item.style.cursor = "pointer";
      item.style.userSelect = "none";
      item.style.opacity = isHidden ? "0.4" : "1";

      const colorBox = document.createElement("span");
      colorBox.style.width = "40px";
      colorBox.style.height = "18px";
      const border = label.strokeStyle;
      colorBox.style.backgroundColor = label.strokeStyle;
      // colorBox.style.backgroundColor = addAlphaToHex(border, 0.2);
      colorBox.style.border = `1px solid ${border}`;

      const text = document.createElement("span");
      text.textContent = label.text;
      text.style.fontSize = "14px";
      text.style.fontWeight = "400";
      text.style.color = options?.legendColor ?? "#afb4bb";
      text.style.textDecoration = isHidden ? "line-through" : "none";

      item.onclick = () => {
        arc.hidden = !arc.hidden;

        chart.update();
        renderPieLegend(chart);
      };

      item.appendChild(colorBox);
      item.appendChild(text);
      legendContainer.appendChild(item);
    });
  };

  // External Legend Renderer
  const renderExternalLegend = (chart: any) => {
    const legendContainer = legendRef.current;
    if (!legendContainer) return;

    const labels = chart.options.plugins.legend.labels.generateLabels(chart);

    // 기존 legend 초기화
    legendContainer.innerHTML = "";

    labels.forEach((label: any) => {
      const meta = chart.getDatasetMeta(label.datasetIndex);
      const isHidden = meta.hidden === true;

      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "4px";
      item.style.padding = "2px 4px";
      item.style.cursor = "pointer";
      item.style.userSelect = "none";

      // 숨겨진 상태 → 흐리게
      item.style.opacity = isHidden ? "0.4" : "1";

      const colorBox = document.createElement("span");
      colorBox.style.width = "10px";
      colorBox.style.height = "10px";
      const border = label.strokeStyle;
      const background = addAlphaToHex(border, 0.2);

      colorBox.style.backgroundColor = background;
      colorBox.style.border = `1px solid ${border}`;
      colorBox.style.borderWidth = "2px";

      const text = document.createElement("span");
      text.style.color = options?.legendColor ?? "#afb4bb";
      text.style.fontSize = "12px";
      text.textContent = label.text;

      // 가운데 선(취소선) 적용
      text.style.textDecoration = isHidden ? "line-through" : "none";

      item.onclick = () => {
        const meta = chart.getDatasetMeta(label.datasetIndex);
        meta.hidden = meta.hidden === null ? true : !meta.hidden;
        chart.update();

        // hidden state 반영
        const nowHidden = meta.hidden === true;
        item.style.opacity = nowHidden ? "0.4" : "1";
        text.style.textDecoration = nowHidden ? "line-through" : "none";
      };

      item.appendChild(colorBox);
      item.appendChild(text);
      legendContainer.appendChild(item);
    });
  };

  useEffect(() => {
    if (!datasets || datasets.length === 0) return;

    // Pie 전용 데이터 처리
    if (isPieChart) {
      const main = datasets[0];
      const obj = main.data as Record<string, number>;

      const labels = Object.keys(obj);
      const pieValues = Object.values(obj);
      pieOriginalValuesRef.current = pieValues;

      const borderColors = Array.isArray(main.borderColor)
        ? main.borderColor
        : typeof main.borderColor === "string"
        ? labels.map(() => main.borderColor)
        : ["#ff6384", "#36a2eb", "#ffce56"].slice(0, labels.length);

      const backgroundColors = borderColors.map((c) =>
        typeof c === "string" ? addAlphaToHex(c, 0.2) : ""
      );

      setChartData({
        labels,
        datasets: [
          {
            label: main.label,
            data: pieValues,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      });

      const extraForRadial =
        type === "polarArea"
          ? {
              scales: {
                r: {
                  ticks: {
                    showLabelBackdrop: false,
                    backdropColor: "rgba(0,0,0,0)",
                  },
                },
              },
            }
          : {};

      const finalOptions = merge({}, baseOptions, extraForRadial, options);

      if (options?.animationOff) {
        finalOptions.animation = { duration: 0 };
        finalOptions.transitions = {
          active: { animation: { duration: 0 } },
        };
      }

      setChartOptions(finalOptions);
      return;
    }

    // 2) RADAR
    if (isRadarChart) {
      const first = datasets[0];
      const points = first.data as { label: string; value: number }[];

      const labels = points.map((p) => p.label);

      const radarDatasets = datasets.map((ds) => ({
        label: ds.label,
        data: (ds.data as { label: string; value: number }[]).map(
          (p) => p.value
        ),
        borderColor: ds.borderColor ?? "#9cdcfe",
        backgroundColor:
          ds.backgroundColor ??
          addAlphaToHex(
            typeof ds.borderColor === "string" ? ds.borderColor : "#9cdcfe",
            0.2
          ),
        fill: ds.fill ?? true,
        borderWidth: ds.borderWidth ?? 1.5,
      }));

      const extraForRadial =
        type === "radar"
          ? {
              scales: {
                r: {
                  ticks: {
                    showLabelBackdrop: false,
                    backdropColor: "rgba(0,0,0,0)",
                  },
                },
              },
            }
          : {};

      let finalOptions = merge(
        {},
        baseOptions,
        extraForRadial,
        {
          scales: {
            r: {
              beginAtZero: true,
              showLabelBackdrop: false,
              backdropColor: "transparent",
            },
          },
        },
        options
      );

      if (options?.animationOff) {
        finalOptions.animation = { duration: 0 };
        finalOptions.transitions = {
          active: { animation: { duration: 0 } },
        };
      }

      setChartData({ labels, datasets: radarDatasets });
      setChartOptions(finalOptions);
      return;
    }

    // 3) BUBBLE
    if (isBubbleChart) {
      // ds.data: [{ x, y, r }]
      const bubbleDatasets = datasets.map((ds) => ({
        label: ds.label,
        data: ds.data, // 그대로 전달
        borderColor: ds.borderColor ?? "#4ec9b0",
        backgroundColor:
          ds.backgroundColor ??
          addAlphaToHex(
            typeof ds.borderColor === "string" ? ds.borderColor : "#4ec9b0",
            0.2
          ),
        borderWidth: ds.borderWidth ?? 1.5,
      }));

      const xScale: any = {
        type: "linear",
        ticks: {
          autoSkip: true,
          maxTicksLimit: options?.tickCount ?? DEFAULT_MAX_TICKS,
        },
      };

      const yScale: any = {
        beginAtZero: true,
      };

      let finalOptions = merge(
        {},
        baseOptions,
        { scales: { x: xScale, y: yScale } },
        options
      );

      if (options?.animationOff) {
        finalOptions.animation = { duration: 0 };
        finalOptions.transitions = {
          active: { animation: { duration: 0 } },
        };
      }

      setChartData({ datasets: bubbleDatasets });
      setChartOptions(finalOptions);
      return;
    }

    // Line/Bar 데이터 변환
    const transformed = datasets.map((ds) => ({
      type: ds.chartType ?? type,
      label: ds.label,
      data: ds.data.map((item: any) => ({
        x: new Date(item.timestamp).getTime(),
        y: item.value,
      })),
      borderColor: ds.borderColor ?? "rgba(75, 192, 192, 1)",
      backgroundColor: ds.backgroundColor ?? "rgba(75, 192, 192, 0.2)",
      fill: ds.fill ?? false,
      tension: ds.tension ?? 0.2,
      borderDash: ds.borderDash,
      pointRadius: ds.pointRadius ?? 2,
      borderWidth: ds.borderWidth ?? 1.5,
    }));

    // 전체 x 범위(span) 계산
    let minX = Infinity;
    let maxX = -Infinity;

    transformed.forEach((ds) => {
      ds.data.forEach((pt: any) => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
      });
    });

    const hasRange = isFinite(minX) && isFinite(maxX);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const span = hasRange ? maxX - minX : 0;
    const isOverOneDay = hasRange && span > oneDayMs;

    // 1일 초과 / 이하에 따라 x축 포맷 분기
    //  - 1일 초과  → MM/dd HH:mm
    //  - 1일 이하  → HH:mm:ss
    const timeDisplayFormat = isOverOneDay ? "MM/dd HH:mm" : "HH:mm:ss";

    const xScale: any = {
      type: "time",
      time: {
        unit: "minute",
        displayFormats: {
          minute: timeDisplayFormat, // 1일 초과: MM:dd HH:mm / 이하: HH:mm:ss
        },
        tooltipFormat: "yyyy-MM-dd HH:mm:ss",
      },
      ticks: {
        source: "data", // 데이터가 있는 x에서만 tick 생성
        autoSkip: true,
        maxTicksLimit: options?.tickCount ?? DEFAULT_MAX_TICKS,
      },
    };
    if (options?.tickCount) {
      xScale.ticks.maxTicksLimit = options.tickCount;
    }

    // tick 개수 옵션 반영
    if (options?.tickCount) {
      xScale.ticks.maxTicksLimit = options.tickCount;
    }

    let finalOptions = merge(
      {},
      baseOptions,
      { scales: { x: xScale } },
      options
    );

    if (options?.animationOff) {
      finalOptions.animation = { duration: 0 };
      finalOptions.transitions = {
        active: { animation: { duration: 0 } },
      };
    }

    setChartData({ datasets: transformed });
    setChartOptions(finalOptions);
  }, [datasets, options, isPieChart]);

  // legend 렌더링 적용
  useEffect(() => {
    if (!chartRef.current || !chartData) return;
    const chart = chartRef.current;

    if (options?.useCustomLegend) {
      renderExternalLegend(chart);
    }

    if (options?.useCustomPieLegend) {
      renderPieLegend(chart);
    }
  }, [chartData, options?.useCustomLegend, options?.useCustomPieLegend]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current || !chartData || !onElementClick) return;

    const chart = chartRef.current;
    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      "nearest",
      { intersect: true },
      true
    );

    if (elements.length === 0) return;

    const { datasetIndex, index } = elements[0];
    const dataset = chartData.datasets[datasetIndex];
    const value = dataset.data[index];
    const label = chartData.labels?.[index];
    const datasetLabel = dataset.label;

    onElementClick({ datasetIndex, index, label, value, datasetLabel });
  };

  const handleDownloadExcel = async () => {
    if (!chartData) return;

    const XLSX = await import("xlsx");
    const { saveAs } = await import("file-saver");

    const dataForExcel = chartData.datasets[0].data.map((point: any) => ({
      Time: new Date(point.x).toLocaleString(),
      Value: point.y,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ChartData");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "chart_data.xlsx");
  };

  if (!chartData) return <ChartSkeleton />;

  return (
    <div
      style={{
        height: options?.height ?? 200,
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && download && (
        <div className="p_a_bl5">
          <button
            type="button"
            title="download"
            className="btn btn-icon btn-outline-light btn_t_xs"
            onClick={handleDownloadExcel}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              borderRadius: 4,
              padding: 2,
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <i className="wems_i_download2 icon-sm fs-5"></i>
          </button>
        </div>
      )}
      {type === "bar" && (
        <Bar
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {type === "line" && (
        <Line
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {type === "pie" && (
        <Pie
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {type === "doughnut" && (
        <Doughnut
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {type === "bubble" && (
        <Bubble
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {type === "radar" && (
        <Radar
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {type === "polarArea" && (
        <PolarArea
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          onClick={handleClick}
        />
      )}
      {/* External Legend 영역 (스크롤 지원) */}
      {options?.useCustomLegend && (
        <div
          ref={legendRef}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            maxHeight: 45,
            overflowY: "auto",
            paddingRight: 2,
          }}
        />
      )}
      {/* Pie Legend 영역 */}
      {options?.useCustomPieLegend && (
        <div
          ref={legendRef}
          style={{
            display: "flex",
            flexDirection: "column",
            justifySelf: "center",
            marginTop: 10,
          }}
        />
      )}
    </div>
  );
};

export default CustomChart;
