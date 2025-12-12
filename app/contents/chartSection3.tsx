import CustomChart from "@/app/components/chart/customChart";
import { ChartPoint } from "@/app/types/dashboard";

interface ChartSection {
  points: number;
  data: {
    testCoverageTrend: Object;
    testCoverageTrend2: Object;
    buildSucceeded: ChartPoint[];
    buildFailed: ChartPoint[];
  };
}

const ChartSection3 = ({ points, data }: ChartSection) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Test Coverage Trend */}
        <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-12b text-text-light">Test Coverage (%)</h3>
            <span className="text-[11px] text-text-soft">
              Last {points} runs
            </span>
          </div>

          <CustomChart
            type="doughnut"
            datasets={[
              {
                label: "Coverage",
                data: data.testCoverageTrend,
                borderColor: ["#eee487", "#dc91e5", "#91b4e2"],
              },
            ]}
            options={{
              height: 220,
              showLegend: true,
              tickCount: 5,
              useCustomLegend: true,
            }}
          />
        </div>
        {/* Test Coverage Trend */}
        <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-12b text-text-light">Test Coverage (Polar)</h3>
            <span className="text-[11px] text-text-soft">
              primary / replica / available
            </span>
          </div>

          <CustomChart
            type="polarArea"
            datasets={[
              {
                label: "Coverage",
                data: data.testCoverageTrend2,
                borderColor: ["#64cfa8", "#fa90a0", "#8cbefc"],
              },
            ]}
            options={{
              height: 220,
              showLegend: true,
              useCustomLegend: true,
            }}
          />
        </div>
      </div>

      {/* Build Success / Failed Trend */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Build Result per Run</h3>
          <span className="text-[11px] text-text-soft">
            Succeeded vs Failed
          </span>
        </div>

        <CustomChart
          type="bar"
          datasets={[
            {
              label: "Succeeded",
              data: data.buildSucceeded,
              chartType: "bar",
              borderColor: "#9d9da5",
              backgroundColor: "#9d9da533",
            },
            {
              label: "Failed",
              data: data.buildFailed,
              chartType: "line",
              borderColor: "#f44747",
              fill: false,
              pointRadius: 1,
              borderDash: [5, 2],
            },
          ]}
          options={{
            height: 220,
            showLegend: true,
            tickCount: 6,
            useCustomLegend: true,
          }}
        />
      </div>
    </section>
  );
};

export default ChartSection3;
