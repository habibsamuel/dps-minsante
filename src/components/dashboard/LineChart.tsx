import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { colors } from '@/theme';

type Point = { label: string; value: number };

type Props = {
  data: Point[];
  color: string;
  /** Identifiant unique du dégradé (un par graphique affiché). */
  id: string;
  height?: number;
  /** Suffixe de l'axe vertical, ex. « % ». */
  unit?: string;
};

const PAD = { top: 16, right: 16, bottom: 28, left: 40 };
const TICKS = [0, 25, 50, 75, 100];

export function LineChart({ data, color, id, height = 200, unit = '' }: Props) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const baseline = PAD.top + innerH;

  const x = (i: number) =>
    PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (value: number) =>
    PAD.top + innerH - (Math.max(0, Math.min(100, value)) / 100) * innerH;

  const pts = data.map((point, i) => ({ x: x(i), y: y(point.value) }));

  // Courbe lissée : tangentes horizontales, jamais de dépassement.
  const line = pts.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = pts[i - 1];
    const mid = (prev.x + point.x) / 2;
    return `${path} C ${mid} ${prev.y}, ${mid} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const area =
    pts.length > 1 ? `${line} L ${pts[pts.length - 1].x} ${baseline} L ${pts[0].x} ${baseline} Z` : '';

  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <View onLayout={onLayout} style={{ width: '100%', height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.28} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Grille et axe vertical */}
          {TICKS.map((tick) => (
            <View key={tick} />
          ))}
          {TICKS.map((tick) => (
            <Line
              key={`line-${tick}`}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={colors.line}
              strokeWidth={1}
              strokeDasharray={tick === 0 ? undefined : '4 5'}
            />
          ))}
          {TICKS.map((tick) => (
            <SvgText
              key={`label-${tick}`}
              x={PAD.left - 8}
              y={y(tick) + 3.5}
              fontSize={10}
              fontFamily="Comfortaa_500Medium"
              fill={colors.muted}
              textAnchor="end"
            >
              {`${tick}${unit}`}
            </SvgText>
          ))}

          {/* Zone + courbe */}
          {area ? <Path d={area} fill={`url(#${id})`} /> : null}
          {pts.length > 1 ? (
            <Path d={line} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
          ) : null}

          {/* Points */}
          {pts.map((point, i) => {
            const last = i === pts.length - 1;
            return (
              <Circle
                key={`dot-${i}`}
                cx={point.x}
                cy={point.y}
                r={last ? 6 : 4}
                fill={last ? color : '#FFFFFF'}
                stroke={color}
                strokeWidth={last ? 3 : 2}
              />
            );
          })}

          {/* Dates */}
          {data.map((point, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <SvgText
                key={`date-${i}`}
                x={x(i)}
                y={height - 8}
                fontSize={10}
                fontFamily="Comfortaa_500Medium"
                fill={colors.muted}
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            ) : null,
          )}
        </Svg>
      ) : null}
    </View>
  );
}