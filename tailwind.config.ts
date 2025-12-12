import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        point: "#4ec9b0",
        sub_point: "#9cdcfe",
        lightblue: "#569cd6",
        blue: "#007acc",
        semiblue: "##1177bb",
        darkblue: "#0e639c",
        deepblue: "#094771",
        green: "#6a9955",
        sub_green: "#b5cea8",
        warning: "#d7ba7d",
        sub_warning: "#dcdcaa",
        error: "#f44747",
        sub_error: "#ce9178",
        text: {
          light: "#d4d4d4",
          default: "#cccccc",
          soft: "#9ca3af",
          dark: "#8c959f",
          deep: "#6b7280",
        },
        bg: {
          hover: "#2d2d30",
          default: "#252526",
          dark: "#1e1e1e",
          night: "#1b1b1b",
        },
        border: {
          light: "#3c3c3c",
          default: "#2d2d30",
        },
      },

      boxShadow: {
        default: "2px 2px 12px 0px rgba(0, 0, 0, 0.12)",
        border: "0px -3px 20px 0px rgba(0, 0, 0, 0.05)",
        modal: "0px -6px 30px 0px rgba(0, 0, 0, 0.08)",
      },
      maxWidth: {
        "screen-xl2": "1920px",
      },
      screens: {
        sm: "360px",
        md: "768px",
        lg: "1024px",
        lx: "1288px",
        lx1: "1630px",
        xl2: "1920px",
      },
      fontSize: {
        "36eb": ["36px", { fontWeight: "800" }],
        "28eb": ["28px", { fontWeight: "800" }],
        "24eb": ["24px", { fontWeight: "800" }],
        "22eb": ["22px", { fontWeight: "800" }],
        "18eb": ["18px", { fontWeight: "800" }],

        "30b": ["30px", { fontWeight: "700" }],
        "24b": ["24px", { fontWeight: "700" }],
        "16b": ["16px", { fontWeight: "700" }],
        "14b": ["14px", { fontWeight: "700" }],
        "12b": ["12px", { fontWeight: "700" }],

        "60s": ["60px", { fontWeight: "600" }],
        "48s": ["48px", { fontWeight: "600" }],
        "44s": ["44px", { fontWeight: "600" }],
        "36s": ["36px", { fontWeight: "600" }],
        "30s": ["30px", { fontWeight: "600" }],
        "26s": ["26px", { fontWeight: "600" }],
        "24s": ["24px", { fontWeight: "600" }],
        "22s": ["22px", { fontWeight: "600" }],
        "20s": ["20px", { fontWeight: "600" }],
        "18s": ["18px", { fontWeight: "600" }],
        "16s": ["16px", { fontWeight: "600" }],
        "14s": ["14px", { fontWeight: "600" }],
        "12s": ["12px", { fontWeight: "600" }],

        "36m": ["36px", { fontWeight: "500" }],
        "24m": ["24px", { fontWeight: "500" }],
        "22m": ["22px", { fontWeight: "500" }],
        "20m": ["20px", { fontWeight: "500" }],
        "18m": ["18px", { fontWeight: "500" }],
        "16m": ["16px", { fontWeight: "500" }],
        "14m": ["14px", { fontWeight: "500" }],
        "12m": ["12px", { fontWeight: "500" }],

        "36r": ["36px", { fontWeight: "400" }],
        "24r": ["24px", { fontWeight: "400" }],
        "22r": ["22px", { fontWeight: "400" }],
        "20r": ["20px", { fontWeight: "400" }],
        "18r": ["18px", { fontWeight: "400" }],
        "16r": ["16px", { fontWeight: "400" }],
        "14r": ["14px", { fontWeight: "400" }],
        "12r": ["12px", { fontWeight: "400" }],

        "24l": ["24px", { fontWeight: "300" }],
      },
    },
  },
  plugins: [
    function (pluginAPI: PluginAPI) {
      pluginAPI.addUtilities({
        ".custom-scrollbar": {
          position: "relative", // 부모 요소에 position 추가
          overflowY: "scroll", // 세로 스크롤이 항상 보이도록 설정
        },
        ".custom-scrollbar::-webkit-scrollbar": {
          width: "6px", // 스크롤바 너비
          height: "4px", // 스크롤바 높이
          marginRight: "10px",
          marginLeft: "10px",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb": {
          backgroundColor: "#6b7280",
          borderRadius: "20px",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#6b7280",
        },
        ".custom-scrollbar::-webkit-scrollbar-track": {
          backgroundColor: "#2d2d30",
          borderRadius: "20px",
        },
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
} satisfies Config;
