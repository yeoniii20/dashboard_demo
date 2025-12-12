import CustomChart from "@/app/components/chart/customChart";
import { ChartPoint } from "@/app/types/dashboard";

interface ChartSectionProps {
  points: number;
  data: {
    buildDurationData: ChartPoint[];
    buildDurationDataPrev: ChartPoint[];
    openIssuesTotal: ChartPoint[];
    openIssuesCritical: ChartPoint[];
  };
}

const ChartSection1 = ({ data, points }: ChartSectionProps) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {/* Build Duration */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Build Duration (min)</h3>
          <span className="text-[11px] text-text-soft">
            Last {points} runs (demo)
          </span>
        </div>

        <CustomChart
          type="bar"
          datasets={[
            {
              label: "Current",
              data: data.buildDurationData,
              borderColor: "#4ec9b0",
              backgroundColor: "#4ec9b033",
              fill: true,
            },
            {
              label: "Previous",
              data: data.buildDurationDataPrev,
              borderColor: "#d7ba7d",
              backgroundColor: "#d7ba7d33",
              fill: true,
            },
          ]}
          options={{
            height: 220,
            legendPosition: "bottom",
            showLegend: true,
            tickCount: 6,
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
              borderColor: "#9cdcfe",
              backgroundColor: "#9cdcfe33",
              fill: true,
            },
            {
              label: "Critical Issues",
              data: data.openIssuesCritical,
              borderColor: "#f44747",
              backgroundColor: "#f4474733",
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

export default ChartSection1;
