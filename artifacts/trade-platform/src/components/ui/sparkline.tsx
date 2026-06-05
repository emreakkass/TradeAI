interface SparklineProps {
  symbol: string;
  changePercent: number;
  width?: number;
  height?: number;
  points?: number;
}

function deterministicRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateSparklineData(symbol: string, changePercent: number, numPoints: number): number[] {
  const seed = symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0) * 31, 1);
  const rng = deterministicRng(seed);
  const trend = changePercent > 0 ? 0.56 : 0.44;
  const data: number[] = [100];
  for (let i = 1; i < numPoints; i++) {
    const up = rng() < trend;
    const magnitude = rng() * 2.5;
    data.push(data[i - 1] + (up ? magnitude : -magnitude));
  }
  return data;
}

export function Sparkline({ symbol, changePercent, width = 80, height = 32, points = 14 }: SparklineProps) {
  const data = generateSparklineData(symbol, changePercent, points);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const coords = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = [
    ...coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`),
    `L${coords[coords.length - 1][0].toFixed(1)},${height}`,
    `L${coords[0][0].toFixed(1)},${height}`,
    "Z",
  ].join(" ");

  const isPositive = changePercent >= 0;
  const strokeColor = isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const fillId = `spark-${symbol}-${isPositive ? "pos" : "neg"}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${fillId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
