import CustomChart from "@/app/components/chart/customChart";
import { BubblePoint, ChartPoint } from "@/app/types/dashboard";

interface ChartSection {
  data: {
    bubblePerfData: BubblePoint[];
    openIssuesTotal: ChartPoint[];
    openIssuesCritical: ChartPoint[];
  };
}

const ChartSection2 = ({ data }: ChartSection) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {/* Bubble Chart */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Build Performance Bubble</h3>
          <span className="text-[11px] text-text-soft">
            x: duration, y: coverage, r: impact
          </span>
        </div>

        <CustomChart
          type="bubble"
          datasets={[
            {
              label: "Services",
              data: data.bubblePerfData,
              borderColor: "#e0b1a2",
              backgroundColor: "#e0b1a233",
            },
          ]}
          options={{
            height: 220,
            showLegend: true,
            legendPosition: "bottom",
            animationOff: true,
            useCustomLegend: true,
          }}
        />
      </div>

      {/* Open Issues Trend */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Open Issues Trend</h3>
          <span className="text-[11px] text-text-soft">Total vs Critical</span>
        </div>

        <CustomChart
          type="line"
          datasets={[
            {
              label: "Total Open Issues",
              data: data.openIssuesTotal,
              borderColor: "#9cfed5",
              backgroundColor: "#9cfed533",
              fill: true,
            },
            {
              label: "Critical Issues",
              data: data.openIssuesCritical,
              borderColor: "#f49547",
              backgroundColor: "#f4954733",
              fill: true,
            },
          ]}
          options={{
            height: 220,
            legendPosition: "bottom",
            showLegend: true,
            tickCount: 5,
            animationOff: true,
            useCustomLegend: true,
          }}
        />
      </div>
    </section>
  );
};

export default ChartSection2;
