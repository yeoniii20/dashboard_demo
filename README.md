# Queue / Topic Monitoring Dashboard (WIP)

메시지 큐·토픽·서버 상태를 한 눈에 볼 수 있는 관제용 대시보드 UI입니다.  
Next.js + TypeScript + TailwindCSS + Chart.js + React Tabulator 조합으로 구현되었습니다.

> 이 프로젝트는 실제 운영 환경이 아닌, **UI/UX 및 대시보드 설계용 프로토타입**입니다.

---

## 개발 환경

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **스타일링**: TailwindCSS (커스텀 다크 테마)
- **패키지 매니저**: Yarn

---

## 사용 라이브러리

대시보드의 핵심 구성 요소에 사용된 주요 라이브러리입니다.

- **Chart.js**
  - 라인/바/파이/도넛/버블/레이더/폴라 차트 렌더링
  - `time` 스케일 + `chartjs-adapter-date-fns`로 시계열 표현
- **react-chartjs-2**
  - Chart.js를 React 컴포넌트 형태로 사용하기 위한 래퍼
  - `CustomChart` 컴포넌트의 베이스
- **react-tabulator**
  - 서버 리스트 테이블 구현
  - 정렬/리사이즈/반응형/툴팁 등의 고급 테이블 기능 제공
- **Tabulator (Semantic UI 테마)**
  - `tabulator_semanticui.min.css` 기반 커스텀 다크 테마
- **lodash.merge**
  - 차트 옵션 병합용 유틸
- **xlsx**, **file-saver**
  - 차트 데이터 Excel 다운로드 기능 구현

---

## Features

### 1. 공통 레이아웃 (`LayoutShell`)

- 상단 **헤더**
  - 프로젝트 타이틀: `Queue Dashboard`
  - 간단한 상태 배지 (예: `Status: Online`, `v0.1.0`)
- 좌측 **사이드바 내비게이션**
  - 대메뉴: `Dashboard`
    - 소메뉴: `Overview`
  - 대메뉴: `Detail`
    - 소메뉴: `Server`, `Queue`, `Topic`
  - 현재 경로에 따라 활성 메뉴 하이라이트
- **모바일 오버레이 메뉴**
  - 햄버거 버튼 클릭 시 화면을 덮는 오버레이 + 왼쪽 슬라이드 사이드바
  - 사이드/오버레이 바깥 클릭 또는 “닫기” 버튼으로 닫기
  - 메뉴 클릭 시 `router.push()` 후 자동으로 메뉴 닫기
- 하단 **푸터**
  - Cluster / Servers / Queues 등 간단한 정보 표기
  - Latency, Uptime 등 관제실 분위기의 메트릭 배지

---

### 2. Tailwind 기반 다크 테마

`tailwind.config.ts`를 커스텀해서 VSCode Dark 느낌의 디자인 시스템을 구성했습니다.

- 컬러 토큰
  - `bg.default`, `bg.dark`, `bg.hover`, `bg.night`
  - `text.light`, `text.default`, `text.soft`, `text.deep`
  - `border.light`, `border.default`
  - 포인트 컬러: `point`, `sub_point`, `lightblue`, `darkblue`, `warning`, `error` 등
- 폰트 사이즈 & weight 토큰
  - `36eb`, `24b`, `18s`, `14m`, `12r` 등 숫자+굵기 체계
- 브레이크포인트
  - `sm`, `md`, `lg`, `lx`, `lx1`, `xl2` 등으로 반응형 레이아웃 구성
- 유틸리티
  - 커스텀 스크롤바: `.custom-scrollbar`
  - 스크롤 숨김: `.no-scrollbar`

이 테마를 모든 페이지/차트/테이블에 공통 적용해서, 일관된 다크 대시보드 UI를 유지합니다.

---

### 3. 커스텀 차트 컴포넌트 (`CustomChart`)

`Chart.js` + `react-chartjs-2`를 감싼 공용 컴포넌트입니다.

#### 지원 차트 타입

- Line (`type="line"`)
- Bar (`type="bar"`)
- Pie (`type="pie"`)
- Doughnut (`type="doughnut"`)
- Bubble (`type="bubble"`)
- Radar (`type="radar"`)
- Polar Area (`type="polarArea"`)

#### 데이터 포맷

* **시간 시계열(line/bar)**  

  ```ts
  type ChartPoint = { timestamp: number; value: number };
  ```

  내부에서 `timestamp → x`, `value → y`로 변환 후 `time` 스케일로 렌더링

* **원형/폴라(pie/doughnut/polarArea)**

  ```ts
  const data = { primary: 34, replica: 63, available: 78 };
  ```

* **버블(bubble)**

  ```ts
  type BubblePoint = { x: number; y: number; r: number; label?: string };
  ```

#### 주요 옵션

* `legendPosition`, `showLegend`
* `useCustomLegend`, `useCustomPieLegend`

  * DOM 기반의 외부 커스텀 레전드 생성
  * 항목 클릭 시 데이터 토글, 숨김 상태에 따라 스타일 변경
* `height`, `tickCount`, `animationOff`
* `onElementClick` 콜백

  * 차트 포인트 클릭 시 데이터 전달
* **Excel 다운로드 기능**

  * hover 시 좌측 하단에 다운로드 버튼 노출
  * 현재 차트 데이터를 `xlsx` + `file-saver`로 `.xlsx` 파일로 저장

#### 시간 축 처리

* `chartjs-adapter-date-fns` 사용
* 전체 span에 따라 자동으로 포맷 변경

  * 1일 이하: `HH:mm:ss`
  * 1일 이상: `MM/dd HH:mm`
* `tickCount`에 따라 x축 tick 개수 제한

---

### 4. Overview Dashboard 페이지

전반적인 빌드/이슈/품질 상태를 한 번에 보여주는 페이지입니다.

구성:

* 상단 요약 카드 3개

  * Active Branch
  * Last Build Duration (최근 빌드 시간, 평균 포함)
  * Open Issues (총 개수, Critical 개수)
* 1단: 차트 2개

  * **Build Duration (bar)**

    * Current vs Previous 비교
  * **Open Issues Trend (line)**

    * Total vs Critical
* 2단: “fancy” 차트 영역

  * **Build Performance Bubble**

    * x: 빌드 시간, y: 커버리지, r: 영향도
    * 서비스별(web, api, worker, admin 등) 버블로 시각화
  * **Quality Radar**

    * Test Coverage / Build Stability / Issue Response / Code Review / Deployment Speed 등 품질 지표를 Radar로 표현
* 3단:

  * **Test Coverage – Doughnut**
  * **Test Coverage – Polar Area**

    * 동일 데이터를 다른 관점에서 표현
  * **Build Result per Run (bar + line 혼합)**

    * Succeeded: 막대 그래프
    * Failed: 같은 x축 위에 선 그래프 (혼합 차트)

<img width="1900" height="611" alt="image" src="https://github.com/user-attachments/assets/bd8468c0-1b5b-4284-988f-b6bcbfc8f667" />
<img width="1900" height="874" alt="image" src="https://github.com/user-attachments/assets/1debd927-ed7a-4799-87c0-ec748940ca7f" />

---

### 5. Queue Dashboard 페이지

`/dashboard/queue`

* 상단 필터 영역

  * Server 선택 드롭다운
  * Queue 이름 검색 인풋
  * 선택된 서버/리전 정보 표시
* 본문: 큐별 **라인 차트 카드** 그리드

  * 반응형 레이아웃

    * `1 → 2 → 3 → 4 → 5` 컬럼로 점진적 증가
  * 각 카드에 표시되는 내용

    * Queue 이름 (`queue.payment.process`, `queue.notification.email` 등)
    * now / max pendingMessages 표시
    * `CustomChart` line 차트로 pendingMessages 추이 표시
  * 시계열 데이터는 SSR-safe한 deterministic 로직으로 생성

<img width="1899" height="857" alt="image" src="https://github.com/user-attachments/assets/46cbc345-a636-4194-b897-3067b3e4b68d" />

---

### 6. Topic Dashboard 페이지

`/dashboard/topic`

Queue Dashboard와 동일한 UI/UX 패턴을 그대로 Topic에 적용한 페이지입니다.

* 상단

  * Server 선택
  * Topic 이름 검색
* 본문

  * Topic 별 카드 + line 차트
  * 메트릭: `messages/sec` (예시)
  * now / max rate 표기
  * 동일한 반응형 그리드 레이아웃

<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/28b93f2a-a488-4f61-9b9d-d7a7a7f08bdb" />

---

### 7. Server Dashboard 페이지 (React Tabulator)

`/dashboard/server`

서버 상태를 테이블로 모니터링하는 페이지입니다.

* 상단 필터 영역

  * Status 필터 (`All / Healthy / Degraded / Down`)
  * 검색 인풋 (server / cluster / region 기준)
  * 총 서버 수 / 현재 표시 중인 서버 수 표시
* 본문

  * `ReactTabulator`를 활용한 서버 리스트 테이블
  * 컬럼 예시

    * Server, Cluster, Region
    * Role (Primary / Replica)
    * Status (Healthy / Degraded / Down, 색상으로 구분)
    * CPU %, Memory %
    * Queues, Topics 개수
    * Latency(ms), Uptime
  * Tabulator 옵션

    * `layout: "fitColumns"`
    * 컬럼 리사이즈, responsiveLayout, tooltips
  * Next.js와의 hydration mismatch 방지를 위해

    * `dynamic(import("react-tabulator"), { ssr: false })`로 클라이언트 전용 렌더링
* 커스텀 CSS

  * 다크 테마에 맞춘 배경/보더/텍스트 색상
  * Row hover/selected 색상
  * 체크박스 커스텀 렌더링
  * 페이지네이션 버튼 스타일

<img width="1920" height="873" alt="image" src="https://github.com/user-attachments/assets/bc83977a-13c8-45c3-b581-4b2f67083baf" />

---

## Getting Started

> 실제 프로젝트 설정에 따라 패키지 매니저 및 스크립트는 변경될 수 있습니다. 아래는 **Yarn 기준 예시**입니다.

### 1. Install

```bash
yarn install
```

### 2. Development

```bash
yarn dev
```

* 기본 포트: `http://localhost:3000`

### 3. Build & Start

```bash
yarn build
yarn start
```

---

## Project Structure

```bash
app/
  (dashboard)/
    dashboard/
      page.tsx              # Overview Dashboard (빌드/이슈/품질 차트)
      server/
        page.tsx            # Server Dashboard (ReactTabulator)
      queue/
        page.tsx            # Queue Dashboard (Queue별 라인 차트)
      topic/
        page.tsx            # Topic Dashboard (Topic별 라인 차트)

components/
  chart/
    customChart.tsx         # 공용 차트 컴포넌트 (Chart.js 래퍼)
  layout/
    LayoutShell.tsx         # 헤더/사이드바/푸터 레이아웃

styles/
  tabulator_semanticui.min.css
  custom-tabulator.css      # Tabulator 다크 테마 커스텀 (선택)

tailwind.config.ts          # 다크 테마 컬러/폰트/스크린 설정
```

---

## TODO / Next Steps

* 서버/큐/토픽 데이터를 실제 API와 연동
* 시간 범위 필터 (최근 1h / 24h / 7d 등) 추가
* 알람/임계값 표시 (예: pendingMessages 스파이크 알림)
* 차트/테이블 상태를 기반으로 한 간단한 상태 요약 배너

---
