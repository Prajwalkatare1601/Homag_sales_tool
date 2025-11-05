import { Machine, MACHINE_CATALOG } from "@/types/machine";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MachineCatalogProps {
  onMachineSelect: (machine: Machine) => void;
}

export const MachineCatalog = ({ onMachineSelect }: MachineCatalogProps) => {
  return (
    <div className="h-full flex flex-col bg-panel-bg border-r border-panel-border">
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-lg font-semibold">Machine Catalog</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click to place on layout
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {MACHINE_CATALOG.map((machine) => (
            <Card
              key={machine.id}
              className="p-4 cursor-pointer hover:shadow-elevated transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onMachineSelect(machine)}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${machine.color}20` }}
                >
                  {machine.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {machine.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {machine.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {machine.width}m × {machine.height}m
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: machine.color,
                        color: machine.color 
                      }}
                    >
                      {machine.type}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Output:</span>
                      <span className="font-medium text-metric-positive">
                        {machine.productivity} u/h
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Saves:</span>
                      <span className="font-medium text-metric-positive">
                        {machine.timeSaving}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
