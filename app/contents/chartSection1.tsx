import CustomChart from "@/app/components/chart/customChart";
import { ChartPoint, RadarPoint } from "@/app/types/dashboard";

interface ChartSectionProps {
  points: number;
  data: {
    buildDurationData: ChartPoint[];
    buildDurationDataPrev: ChartPoint[];
    radarQualityData: RadarPoint[];
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
              borderColor: "#53679e",
              backgroundColor: "#53679e33",
              fill: true,
            },
            {
              label: "Previous",
              data: data.buildDurationDataPrev,
              borderColor: "#7dd7d7",
              backgroundColor: "#7dd7d733",
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

      {/* Radar Chart */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Quality Radar</h3>
          <span className="text-[11px] text-text-soft">
            Team quality metrics
          </span>
        </div>

        <CustomChart
          type="radar"
          datasets={[
            {
              label: "Current",
              data: data.radarQualityData,
              borderColor: "#bcd3dd",
              backgroundColor: "#bcd3dd33",
              fill: true,
            },
          ]}
          options={{
            height: 240,
            showLegend: true,
            legendPosition: "bottom",
            useCustomLegend: true,
          }}
        />
      </div>
    </section>
  );
};

export default ChartSection1;
