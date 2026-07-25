import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  HistogramData,
  LineData as LwLineData,
  CrosshairMode,
  Time
} from 'lightweight-charts';

import { Indicator } from '../../../types/market';
import { calculateSMA, calculateEMA } from '../../../utils/chart';

import { ChartLoading } from './ChartLoading';
import { ChartLegend } from './ChartLegend';
import { PriceBadge } from './PriceBadge';
import { ChartToolbar } from './ChartToolbar';
import { ChartTooltip } from './ChartTooltip';
import { IndicatorsMenu } from './IndicatorsMenu';
import { ErrorCard } from '../../common/ErrorCard';
import { EmptyState } from '../../common/EmptyState';

import styles from './TradingChart.module.css';

interface TooltipData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  x: number;
  y: number;
}

export interface ChartMarker {
  time: number;
  position: 'aboveBar' | 'belowBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
}

export interface OrderLine {
  price: number;
  color: string;
  text: string;
}

interface TradingChartProps {
  asset: string;
  timeframe: string;
  candles: any[];
  quote: any;
  marketStatus: any;
  loading: boolean;
  error: string | null;
  onTimeframeChange: (tf: any) => void;
  markers?: ChartMarker[];
  orderLines?: OrderLine[];
  realTimeTick?: { price: number; time: number; volume: number } | null;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
  asset,
  timeframe,
  candles,
  quote,
  marketStatus,
  loading,
  error,
  onTimeframeChange,
  markers = [], 
  orderLines = [],
  realTimeTick
}) => {

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  // Indicator series refs
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Live Candle Ref
  const liveCandleRef = useRef<any>(null);

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const [indicators, setIndicators] = useState<Indicator[]>([
    { id: 'sma20', name: 'SMA', type: 'SMA', visible: false, period: 20, color: '#2962FF' },
    { id: 'ema20', name: 'EMA', type: 'EMA', visible: false, period: 20, color: '#FF6D00' },
    { id: 'vol', name: 'Volume', type: 'Volume', visible: true },
    { id: 'rsi', name: 'RSI', type: 'RSI', visible: false },
    { id: 'macd', name: 'MACD', type: 'MACD', visible: false },
    { id: 'bb', name: 'Bollinger Bands', type: 'BollingerBands', visible: false },
  ]);

  const toggleIndicator = (id: string) => {
    setIndicators(prev => prev.map(ind => ind.id === id ? { ...ind, visible: !ind.visible } : ind));
  };

  useEffect(() => {
    if (!chartContainerRef.current || loading || candles.length === 0) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    // 1. Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: 'rgba(0, 0, 0, 0.05)' },
        horzLines: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(0, 0, 0, 0.1)',
        timeVisible: true,
      },
      autoSize: true,
    });
    chartRef.current = chart;

    // 2. Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#16a34a',
      downColor: '#dc2626',
      borderVisible: false,
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });
    candleSeriesRef.current = candleSeries;

    const formattedCandles = candles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeries.setData(formattedCandles);
    
    if (formattedCandles.length > 0) {
      liveCandleRef.current = { 
        ...formattedCandles[formattedCandles.length - 1],
        volume: candles[candles.length - 1].volume || 0 
      };
    }

    // 3. Add Volume Series (Histogram)
    const volumeInd = indicators.find(i => i.id === 'vol');
    if (volumeInd?.visible) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // set as an overlay
      });
      
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8, // highest point of volume will be at 80% of chart
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;

      const formattedVolume = candles.map(c => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(22, 163, 74, 0.5)' : 'rgba(220, 38, 38, 0.5)'
      }));
      volumeSeries.setData(formattedVolume);
    }

    // 4. Add SMA
    const smaInd = indicators.find(i => i.id === 'sma20');
    if (smaInd?.visible && smaInd.period) {
      const smaData = calculateSMA(candles, smaInd.period);
      const smaSeries = chart.addLineSeries({
        color: smaInd.color,
        lineWidth: 2,
        crosshairMarkerVisible: false,
      });
      smaSeries.setData(smaData.map(d => ({ time: d.time as Time, value: d.value })));
      smaSeriesRef.current = smaSeries;
    }

    // 5. Add EMA
    const emaInd = indicators.find(i => i.id === 'ema20');
    if (emaInd?.visible && emaInd.period) {
      const emaData = calculateEMA(candles, emaInd.period);
      const emaSeries = chart.addLineSeries({
        color: emaInd.color,
        lineWidth: 2,
        crosshairMarkerVisible: false,
      });
      emaSeries.setData(emaData.map(d => ({ time: d.time as Time, value: d.value })));
      emaSeriesRef.current = emaSeries;
    }

    // 6. Set Markers
    if (markers.length > 0) {
      candleSeries.setMarkers(markers.map(m => ({
        time: m.time as Time,
        position: m.position,
        color: m.color,
        shape: m.shape,
        text: m.text,
      })));
    } else {
      candleSeries.setMarkers([]);
    }

    // 7. Set Order Lines
    // We clear existing price lines (not natively supported to list them, so we'll just not support dynamic updates of order lines within the same instance for this mock, or we can just create them)
    // Actually, createPriceLine returns an object we can remove later. For simplicity we'll just add them on mount/update.
    orderLines.forEach(line => {
      candleSeries.createPriceLine({
        price: line.price,
        color: line.color,
        lineWidth: 2,
        lineStyle: 3, // dashed
        axisLabelVisible: true,
        title: line.text,
      });
    });

    // 8. Crosshair Tooltip logic
    chart.subscribeCrosshairMove(param => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setTooltipData(null);
        return;
      }

      const data = param.seriesData.get(candleSeries) as CandlestickData;
      if (!data) {
        setTooltipData(null);
        return;
      }
      
      const volData = volumeSeriesRef.current ? param.seriesData.get(volumeSeriesRef.current) as HistogramData : { value: 0 };
      
      // format time depending on type
      let dateStr = '';
      if (typeof param.time === 'string') {
        dateStr = param.time;
      } else if (typeof param.time === 'number') {
        const d = new Date(param.time * 1000);
        dateStr = d.toLocaleDateString();
      } else if (typeof param.time === 'object') {
        dateStr = `${param.time.year}-${param.time.month}-${param.time.day}`;
      }

      const containerWidth = chartContainerRef.current!.clientWidth;
      const containerHeight = chartContainerRef.current!.clientHeight;
      
      const tooltipWidth = 150;
      const tooltipHeight = 180;
      
      let x = param.point.x + 15;
      let y = param.point.y + 15;
      
      if (x + tooltipWidth > containerWidth) {
        x = param.point.x - tooltipWidth - 15;
      }
      
      if (y + tooltipHeight > containerHeight) {
        y = param.point.y - tooltipHeight - 15;
      }

      setTooltipData({
        time: dateStr,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: volData.value,
        x,
        y,
      });
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, indicators, loading]);

  // Handle Real-Time Tick Update
  useEffect(() => {
    if (!realTimeTick || !candleSeriesRef.current || !liveCandleRef.current) return;
    
    const live = liveCandleRef.current;
    const newPrice = realTimeTick.price;
    
    // Instead of updating the same candle, we append a new one
    // We increment time by 1 day (86400 seconds) so it plots a new candle on the chart
    const newCandle = {
      time: (live.time as number) + 86400,
      open: live.close,
      high: Math.max(live.close, newPrice),
      low: Math.min(live.close, newPrice),
      close: newPrice,
      volume: realTimeTick.volume || 100
    };
    
    candleSeriesRef.current.update(newCandle);
    liveCandleRef.current = newCandle;
    
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.update({
        time: newCandle.time,
        value: newCandle.volume,
        color: newPrice >= newCandle.open ? 'rgba(22, 163, 74, 0.5)' : 'rgba(220, 38, 38, 0.5)'
      });
    }
  }, [realTimeTick]);

  if (!asset) {
    return (
      <EmptyState 
        type="search"
        title="Select an asset"
        description="Select an asset from the Popular list or search to view its chart."
      />
    );
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  return (
    <div className={styles.chartWrapper}>
      
      <div className={styles.chartHeader}>
        <ChartLegend quote={quote} status={marketStatus} />
        {quote && (
          <PriceBadge 
            symbol={quote.symbol} 
            price={quote.price} 
            changePercent={quote.changePercent} 
          />
        )}
      </div>

      <div className={styles.chartControls}>
        <ChartToolbar selectedTimeframe={timeframe as any} onSelect={onTimeframeChange} />
        <IndicatorsMenu indicators={indicators} onToggle={toggleIndicator} />
      </div>

      <div className={styles.chartContainer}>
        {loading ? (
          <ChartLoading />
        ) : (
          <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        )}
        <ChartTooltip data={tooltipData} />
      </div>

    </div>
  );
};
