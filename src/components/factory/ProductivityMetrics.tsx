import { useMemo } from "react";
import { PlacedMachine } from "@/types/machine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  DollarSign, 
  Download,
  Factory
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductivityMetricsProps {
  placedMachines: PlacedMachine[];
  layoutDimensions: { width: number; height: number };
  onGenerateReport: () => void;
}

export const ProductivityMetrics = ({ 
  placedMachines, 
  layoutDimensions,
  onGenerateReport 
}: ProductivityMetricsProps) => {
  const metrics = useMemo(() => {
    const totalProductivity = placedMachines.reduce(
      (sum, m) => sum + m.productivity, 
      0
    );
    const avgTimeSaving = placedMachines.length > 0
      ? placedMachines.reduce((sum, m) => sum + m.timeSaving, 0) / placedMachines.length
      : 0;
    
    const machineArea = placedMachines.reduce(
      (sum, m) => sum + (m.width * m.height), 
      0
    );
    const totalArea = layoutDimensions.width * layoutDimensions.height;
    const spaceUtilization = (machineArea / totalArea) * 100;

    const estimatedCostSaving = totalProductivity * 25 * avgTimeSaving / 100;
    
    return {
      totalProductivity,
      avgTimeSaving: Math.round(avgTimeSaving),
      spaceUtilization: Math.round(spaceUtilization),
      estimatedCostSaving: Math.round(estimatedCostSaving),
      machineCount: placedMachines.length,
      totalArea,
      usedArea: Math.round(machineArea * 10) / 10,
    };
  }, [placedMachines, layoutDimensions]);

  const getMachinesByType = () => {
    const types: Record<string, number> = {};
    placedMachines.forEach(m => {
      types[m.type] = (types[m.type] || 0) + 1;
    });
    return types;
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg border-l border-panel-border">
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-lg font-semibold">Productivity Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time performance metrics
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Machines
                </span>
              </div>
              <p className="text-2xl font-bold">{metrics.machineCount}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-metric-positive/10 to-metric-positive/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-metric-positive" />
                <span className="text-xs font-medium text-muted-foreground">
                  Output
                </span>
              </div>
              <p className="text-2xl font-bold text-metric-positive">
                {metrics.totalProductivity}
              </p>
              <p className="text-xs text-muted-foreground mt-1">units/hour</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Time Saved
                </span>
              </div>
              <p className="text-2xl font-bold text-secondary">
                {metrics.avgTimeSaving}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">average</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium text-muted-foreground">
                  Cost Saved
                </span>
              </div>
              <p className="text-2xl font-bold text-accent">
                ${metrics.estimatedCostSaving}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per day</p>
            </Card>
          </div>

          {/* Space Utilization */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  Space Utilization
                </span>
              </div>
              <Badge 
                variant={metrics.spaceUtilization > 70 ? "default" : "secondary"}
              >
                {metrics.spaceUtilization}%
              </Badge>
            </div>
            <Progress value={metrics.spaceUtilization} className="h-2 mb-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Used: {metrics.usedArea} m²</span>
              <span>Total: {metrics.totalArea} m²</span>
            </div>
          </Card>

          {/* Machine Breakdown */}
          {placedMachines.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Machine Types</h3>
              <div className="space-y-2">
                {Object.entries(getMachinesByType()).map(([type, count]) => (
                  <div 
                    key={type}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm">{type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Efficiency Insights */}
          {placedMachines.length > 0 && (
            <Card className="p-4 bg-gradient-primary text-white">
              <h3 className="text-sm font-semibold mb-2">💡 Insights</h3>
              <ul className="space-y-2 text-xs">
                {metrics.spaceUtilization < 40 && (
                  <li>• Consider adding more machines to optimize space</li>
                )}
                {metrics.spaceUtilization > 80 && (
                  <li>• Excellent space utilization! Layout is efficient</li>
                )}
                {metrics.avgTimeSaving > 40 && (
                  <li>• High-efficiency machines selected</li>
                )}
                {metrics.totalProductivity > 200 && (
                  <li>• Production capacity exceeds 200 units/hour</li>
                )}
                <li>• Estimated annual savings: ${(metrics.estimatedCostSaving * 365).toLocaleString()}</li>
              </ul>
            </Card>
          )}

          {/* Report Generation */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={onGenerateReport}
            disabled={placedMachines.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>

          {placedMachines.length === 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Place machines on the layout to view metrics
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
