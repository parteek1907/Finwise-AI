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
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '@/utils/formatters';

import { ChartLoading } from './ChartLoading';
import { ChartHeader } from './ChartHeader';
import { ChartTooltip } from './ChartTooltip';
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
  loading: boolean;
  error: string | null;
  onTimeframeChange: (tf: any) => void;
  markers?: ChartMarker[];
  orderLines?: OrderLine[];
  realTimeTick?: { price: number; time: number; volume: number } | null;
  chartType?: 'candle' | 'line' | 'area';
  onChartTypeChange?: (type: 'candle' | 'line' | 'area') => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
  asset,
  timeframe,
  candles,
  quote,
  loading,
  error,
  onTimeframeChange,
  markers = [], 
  orderLines = [],
  realTimeTick,
  chartType = 'candle',
  onChartTypeChange
}) => {

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  // Indicator series refs
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Live Candle Ref
  const liveCandleRef = useRef<any>(null);

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const { preferredCurrency } = useSettingsStore(state => state.financial || {});

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

    // 2. Add Main Series (Candle, Line, or Area)
    let mainSeries: ISeriesApi<any>;
    let formattedData: any[];

    if (chartType === 'line') {
      mainSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      formattedData = candles.map(c => ({
        time: c.time as Time,
        value: c.close,
      }));
    } else if (chartType === 'area') {
      mainSeries = chart.addAreaSeries({
        lineColor: '#2962FF',
        topColor: 'rgba(41, 98, 255, 0.28)',
        bottomColor: 'rgba(41, 98, 255, 0.05)',
        lineWidth: 2,
      });
      formattedData = candles.map(c => ({
        time: c.time as Time,
        value: c.close,
      }));
    } else {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#16a34a',
        downColor: '#dc2626',
        borderVisible: false,
        wickUpColor: '#16a34a',
        wickDownColor: '#dc2626',
      });
      formattedData = candles.map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
    }

    mainSeriesRef.current = mainSeries;
    mainSeries.setData(formattedData);
    
    if (formattedData.length > 0) {
      // Store the base data for live updates
      const lastBaseCandle = candles[candles.length - 1];
      liveCandleRef.current = {
        time: lastBaseCandle.time as Time,
        open: lastBaseCandle.open,
        high: lastBaseCandle.high,
        low: lastBaseCandle.low,
        close: lastBaseCandle.close,
        volume: lastBaseCandle.volume || 0 
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
      mainSeries.setMarkers(markers.map(m => ({
        time: m.time as Time,
        position: m.position,
        color: m.color,
        shape: m.shape,
        text: m.text,
      })));
    } else {
      mainSeries.setMarkers([]);
    }

    // 7. Set Order Lines
    orderLines.forEach(line => {
      mainSeries.createPriceLine({
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

      const data = param.seriesData.get(mainSeries) as any;
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
        dateStr = formatDate(d);
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
        open: data.open !== undefined ? data.open : data.value,
        high: data.high !== undefined ? data.high : data.value,
        low: data.low !== undefined ? data.low : data.value,
        close: data.close !== undefined ? data.close : data.value,
        volume: volData.value as number,
        x,
        y,
      });
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
    };
  }, [candles, indicators, loading, chartType]);

  // Handle Real-Time Tick Update
  useEffect(() => {
    if (!realTimeTick || !mainSeriesRef.current || !liveCandleRef.current) return;
    
    const live = liveCandleRef.current;
    const newPrice = realTimeTick.price;
    
    const tickMs = realTimeTick.time; // ms
    let tickChartTime: Time;
    
    if (['1M', '3M', '6M', '1Y', 'ALL'].includes(timeframe)) {
      // Daily charts: format as 'YYYY-MM-DD'
      tickChartTime = new Date(tickMs).toISOString().split('T')[0] as Time;
    } else if (timeframe === '1D') {
      // 5-minute periods for 1D chart
      const periodSec = 5 * 60;
      tickChartTime = (Math.floor((tickMs / 1000) / periodSec) * periodSec) as Time;
    } else {
      // 15-minute periods for 5D chart
      const periodSec = 15 * 60;
      tickChartTime = (Math.floor((tickMs / 1000) / periodSec) * periodSec) as Time;
    }
    
    let newCandle: any;
    
    if (tickChartTime !== live.time && tickChartTime > live.time) {
      newCandle = {
        time: tickChartTime,
        open: newPrice,
        high: newPrice,
        low: newPrice,
        close: newPrice,
        volume: realTimeTick.volume || 0
      };
    } else {
      // Update existing candle
      newCandle = {
        time: live.time,
        open: Number(live.open),
        high: Math.max(Number(live.high), newPrice),
        low: Math.min(Number(live.low), newPrice),
        close: newPrice,
        volume: (live.volume || 0) + (realTimeTick.volume || 0)
      };
    }
    
    if (chartType === 'line' || chartType === 'area') {
      mainSeriesRef.current.update({
        time: newCandle.time,
        value: newCandle.close
      } as any);
    } else {
      mainSeriesRef.current.update({
        time: newCandle.time,
        open: newCandle.open,
        high: newCandle.high,
        low: newCandle.low,
        close: newCandle.close
      } as any);
    }
    
    liveCandleRef.current = newCandle;
    
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.update({
        time: newCandle.time,
        value: newCandle.volume,
        color: newPrice >= newCandle.open ? 'rgba(22, 163, 74, 0.5)' : 'rgba(220, 38, 38, 0.5)'
      });
    }
  }, [realTimeTick, timeframe, chartType]);

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
      
      <ChartHeader 
        quote={quote}
        selectedTimeframe={timeframe as any}
        onSelectTimeframe={onTimeframeChange}
        indicators={indicators}
        onToggleIndicator={toggleIndicator}
        chartType={chartType}
        onChartTypeChange={onChartTypeChange}
      />

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
