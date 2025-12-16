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
import { exportChartDataToXlsx } from "@/app/utils/chart/exportChartDataToXlsx";
import ChartDownloadButton from "../button/chartDownloadButton";
import {
  buildDatasetLegendItems,
  renderLegendDOM,
  buildPieLegendItems,
} from "@/app/utils/chart/chartLegend";

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
// Chart.js에 전달할 "데이터셋" 타입 정의
// - label: 범례(legend)에 표시될 이름
// - data: 실제 데이터 (차트 타입마다 형태가 달라 any로 둠)
//   - line/bar: 보통 number[] 또는 {x,y}[]
//   - pie/doughnut: number[]
//   - bubble: {x:number,y:number,r:number}[]
// - backgroundColor/borderColor: 단일 색상 또는 데이터 포인트별 색상 배열
// - fill: line 차트에서 영역 채우기 여부
// - tension: line 곡선 부드러움(0이면 직선에 가까움)
// - borderDash: 점선 스타일(ex: [5,5])
// - pointRadius: line 차트 점 크기
// - borderWidth: 선/테두리 두께
// - chartType: 하나의 위젯에서 line+bar 섞어 그릴 때(혼합 차트) 구분용
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

// 차트 위젯 컴포넌트 Props
// - type: 기본 차트 타입 (전체 차트의 기본 형태)
// - datasets: 렌더링할 데이터셋 목록
// - options: 스타일/동작 커스터마이징 옵션 묶음
// - onElementClick: 차트 요소 클릭 시(막대/포인트/파이 조각) 콜백
// - download: 다운로드 기능(예: 이미지 저장 버튼) 노출 여부
type ChartWidgetProps = {
  type: "line" | "bar" | "pie" | "doughnut" | "bubble" | "radar" | "polarArea";
  datasets: Dataset[];
  options?: {
    // 차트(또는 캔버스) 기본 배경색
    backgroundColor?: string;

    // 기본 테두리 색(필요 시 전역 기본값처럼 사용)
    borderColor?: string;

    // 기본 범례 표시 여부
    showLegend?: boolean;

    // 범례 위치
    legendPosition?: "top" | "bottom" | "left" | "right";

    // 범례 텍스트 색상(다크모드 등에서 유용)
    legendColor?: string;

    // 차트 높이(px). 부모 레이아웃에 따라 고정 높이 필요할 때 사용
    height?: number;

    // 애니메이션 비활성화(대시보드/실시간 차트에서 성능 개선)
    animationOff?: boolean;

    // 기본 legend 대신 커스텀 legend UI를 사용할지 여부
    useCustomLegend?: boolean;

    // pie/doughnut 전용 커스텀 legend UI를 사용할지 여부
    useCustomPieLegend?: boolean;

    // x축 tick(눈금) 개수 제한: 데이터가 많을 때 라벨 겹침 방지용
    tickCount?: number;
  };

  // 차트 요소 클릭 핸들러
  // - datasetIndex: 클릭된 데이터셋 인덱스
  // - index: 해당 데이터 포인트 인덱스
  // - label: 라벨(보통 x축 또는 항목명)
  // - value: 값(보통 y값 또는 slice 값)
  // - datasetLabel: 클릭된 데이터셋의 label
  onElementClick?: (data: {
    datasetIndex: number;
    index: number;
    label: any;
    value: any;
    datasetLabel: string;
  }) => void;

  // 다운로드 기능 활성화 여부(기본 true)
  download?: boolean;
};

// CustomChart 컴포넌트 시그니처
// - type/datasets/options 기반으로 Chart.js 컴포넌트를 렌더링하고
// - 클릭/다운로드 등 부가 기능을 제공하는 래퍼 역할
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
  const datasetLegendRef = useRef<HTMLDivElement>(null);
  const pieLegendRef = useRef<HTMLDivElement>(null);
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
  }, [datasets, options, isPieChart, type]);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;
    const chart = chartRef.current;
    const legendColor = options?.legendColor ?? "#afb4bb";

    if (options?.useCustomLegend && datasetLegendRef.current) {
      const rerender = () => {
        const items = buildDatasetLegendItems(chart);
        renderLegendDOM({
          container: datasetLegendRef.current!,
          items,
          legendColor,
          variant: "dataset",
          rerender,
        });
      };
      rerender();
    }

    if (options?.useCustomPieLegend && pieLegendRef.current) {
      const rerender = () => {
        const items = buildPieLegendItems(chart);
        renderLegendDOM({
          container: pieLegendRef.current!,
          items,
          legendColor,
          variant: "pie",
          rerender,
        });
      };
      rerender();
    }
  }, [
    chartData,
    options?.useCustomLegend,
    options?.useCustomPieLegend,
    options?.legendColor,
  ]);

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

    await exportChartDataToXlsx({
      chartData,
      type,
      filename: "chart_data.xlsx",
      sheetName: "ChartData",
    });
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
      <ChartDownloadButton
        visible={hovered && download}
        onClick={handleDownloadExcel}
        title="Download chart data"
      />
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
          ref={datasetLegendRef}
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

      {options?.useCustomPieLegend && (
        <div
          ref={pieLegendRef}
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
