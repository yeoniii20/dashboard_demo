import { addAlphaToHex } from "@/app/utils/alphaToHex";

export type LegendVariant = "pie" | "dataset";

export type LegendItem = {
  text: string;
  strokeStyle: string;
  hidden: boolean;
  toggle: () => void;
};

type RenderStyle = {
  gap: string;
  padding: string;
  boxWidth: string;
  boxHeight: string;
  fontSize: string;
  fontWeight: string;
  useAlphaBackground: boolean;
};

const PIE_STYLE: RenderStyle = {
  gap: "6px",
  padding: "4px 8px",
  boxWidth: "40px",
  boxHeight: "18px",
  fontSize: "14px",
  fontWeight: "400",
  useAlphaBackground: false,
};

const DATASET_STYLE: RenderStyle = {
  gap: "4px",
  padding: "2px 4px",
  boxWidth: "10px",
  boxHeight: "10px",
  fontSize: "12px",
  fontWeight: "400",
  useAlphaBackground: true,
};

// Pie용 아이템 생성: arc.hidden 토글
export const buildPieLegendItems = (chart: any): LegendItem[] => {
  const labels = chart.options.plugins.legend.labels.generateLabels(chart);
  const meta = chart.getDatasetMeta(0);

  return labels.map((label: any, sliceIndex: number) => {
    const arc = meta.data[sliceIndex];
    const hidden = arc?.hidden === true;

    return {
      text: label.text,
      strokeStyle: label.strokeStyle,
      hidden,
      toggle: () => {
        arc.hidden = !arc.hidden;
        chart.update();
      },
    };
  });
};

// Dataset용 아이템 생성: meta.hidden 토글
export const buildDatasetLegendItems = (chart: any): LegendItem[] => {
  const labels = chart.options.plugins.legend.labels.generateLabels(chart);

  return labels.map((label: any) => {
    const meta = chart.getDatasetMeta(label.datasetIndex);
    const hidden = meta?.hidden === true;

    return {
      text: label.text,
      strokeStyle: label.strokeStyle,
      hidden,
      toggle: () => {
        meta.hidden = meta.hidden === null ? true : !meta.hidden;
        chart.update();
      },
    };
  });
};

// 공통 DOM 렌더러 (Pie/External)
export const renderLegendDOM = (params: {
  container: HTMLDivElement;
  items: LegendItem[];
  legendColor: string;
  variant: LegendVariant;
  rerender?: () => void;
}) => {
  const { container, items, legendColor, variant, rerender } = params;
  const style = variant === "pie" ? PIE_STYLE : DATASET_STYLE;

  container.innerHTML = "";
  const frag = document.createDocumentFragment();

  items.forEach((it) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = style.gap;
    item.style.padding = style.padding;
    item.style.cursor = "pointer";
    item.style.userSelect = "none";
    item.style.opacity = it.hidden ? "0.4" : "1";

    const colorBox = document.createElement("span");
    colorBox.style.width = style.boxWidth;
    colorBox.style.height = style.boxHeight;

    const border = it.strokeStyle;
    colorBox.style.border = `1px solid ${border}`;
    colorBox.style.borderWidth = "2px";
    colorBox.style.backgroundColor = style.useAlphaBackground
      ? addAlphaToHex(border, 0.2)
      : border;

    const text = document.createElement("span");
    text.textContent = it.text;
    text.style.fontSize = style.fontSize;
    text.style.fontWeight = style.fontWeight;
    text.style.color = legendColor;
    text.style.textDecoration = it.hidden ? "line-through" : "none";

    item.onclick = () => {
      it.toggle();
      rerender?.();
    };

    item.appendChild(colorBox);
    item.appendChild(text);
    frag.appendChild(item);
  });

  container.appendChild(frag);
};
