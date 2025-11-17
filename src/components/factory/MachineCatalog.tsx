import { useEffect, useState } from "react";
import { Machine } from "@/types/machine";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getMachines } from "../../supabase/getMachines"; // <-- NEW

interface MachineCatalogProps {
  onMachineSelect: (machine: Machine) => void;
}

export const MachineCatalog = ({ onMachineSelect }: MachineCatalogProps) => {
  const [segment, setSegment] = useState("Kitchen");
  const [solution, setSolution] = useState("Panel Dividing");
  const [capacity, setCapacity] = useState("");
  const [automation, setAutomation] = useState("");

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch from Supabase
  useEffect(() => {
    async function load() {
      const data = await getMachines();
      setMachines(data);
      setLoading(false);
    }
    load();
  }, []);

  // 🔍 Filter machines based on dropdown
  const filteredMachines = solution
    ? machines.filter((m) => m.type?.toLowerCase() === solution.toLowerCase())
    : machines;

  return (
    <div className="h-full w-70 flex flex-col bg-white border-r border-slate-100 shadow-inner">
      {/* === FILTER PANEL === */}
      <div className="p-2 border-b border-slate-200 bg-slate-50">
        <div className="space-y-1">
          {/* Segment Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600">Segment</label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Select Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kitchen">Kitchen & Wardrobe</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                <SelectItem value="Turnkey Interiors">Turnkey Interiors</SelectItem>
                <SelectItem value="Doors">Doors</SelectItem>
                <SelectItem value="School furniture">School furniture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Capacity Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600">Capacity / Shift</label>
            <Select value={capacity} onValueChange={setCapacity}>
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Select Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50-100">50-100 boards</SelectItem>
                <SelectItem value="100-200">100-200 boards</SelectItem>
                <SelectItem value="200-300">200-300 boards</SelectItem>
                <SelectItem value="300-400+">300-400+ boards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Automation Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600">Automation</label>
            <Select value={automation} onValueChange={setAutomation}>
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Select Automation Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Semi-automatic">Semi Automatic</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Solution Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600">Homag Solutions</label>
            <Select value={solution} onValueChange={setSolution}>
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Select Solution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Press">Press</SelectItem>
                <SelectItem value="Panel Dividing">Panel Dividing</SelectItem>
                <SelectItem value="Edge Bander">Edge Bander</SelectItem>
                <SelectItem value="CNC Machines">CNC Machines</SelectItem>
                <SelectItem value="Dust collector">Dust Collector</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* === MACHINE LIST === */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 ">
          {loading ? (
            <p className="text-center text-sm text-slate-500">Loading machines…</p>
          ) : filteredMachines.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No machines found.</p>
          ) : (
            filteredMachines.map((machine) => (
              <Card
                key={machine.id}
                className="p-2 cursor-pointer hover:shadow-md hover:bg-blue-50/40 transition-all duration-200 rounded-lg border"
                onClick={() => onMachineSelect(machine)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                    <img
                      src="favicon.png"
                      alt={machine.machine_name}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs text-slate-800 truncate leading-tight">
                      {machine.machine_name}
                    </h3>

                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0">
                        {machine.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
