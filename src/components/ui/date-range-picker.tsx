import { Card, CardContent } from './card';
import { Button } from './button';
import { Calendar, X } from 'lucide-react';
import { useState } from 'react';

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onClose: () => void;
  labels?: {
    title?: string;
    from?: string;
    to?: string;
    cancel?: string;
    apply?: string;
    last7Days?: string;
    last30Days?: string;
    last90Days?: string;
    thisMonth?: string;
    lastMonth?: string;
    allTime?: string;
  };
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  onClose,
  labels = {}
}: DateRangePickerProps) {
  const [tempRange, setTempRange] = useState(dateRange);

  const quickRanges = [
    {
      label: labels.last7Days || 'Last 7 days',
      getValue: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      }),
    },
    {
      label: labels.last30Days || 'Last 30 days',
      getValue: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      }),
    },
    {
      label: labels.last90Days || 'Last 90 days',
      getValue: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      }),
    },
    {
      label: labels.thisMonth || 'This month',
      getValue: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: firstDay.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
        };
      },
    },
    {
      label: labels.lastMonth || 'Last month',
      getValue: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          from: firstDay.toISOString().split('T')[0],
          to: lastDay.toISOString().split('T')[0],
        };
      },
    },
    {
      label: labels.allTime || 'All time',
      getValue: () => ({
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      }),
    },
  ];

  const handleApply = () => {
    onDateRangeChange(tempRange);
  };

  return (
    <Card className="w-[360px] border-border/40 shadow-lg">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {labels.title || 'Select date range'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Ranges */}
        <div className="p-3 border-b border-border/40">
          <div className="grid grid-cols-2 gap-2">
            {quickRanges.map((range, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  const newRange = range.getValue();
                  setTempRange(newRange);
                }}
                className="justify-start text-xs font-normal h-8"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Inputs */}
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {labels.from || 'From'}
            </label>
            <input
              type="date"
              value={tempRange.from}
              onChange={(e) => setTempRange({ ...tempRange, from: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {labels.to || 'To'}
            </label>
            <input
              type="date"
              value={tempRange.to}
              onChange={(e) => setTempRange({ ...tempRange, to: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/40 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            {labels.cancel || 'Cancel'}
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="gap-2 !bg-primary !text-primary-foreground hover:!bg-primary/90 text-xs"
          >
            {labels.apply || 'Apply'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

