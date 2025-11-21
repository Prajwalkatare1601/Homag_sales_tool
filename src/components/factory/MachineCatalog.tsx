import { useEffect, useState } from "react";
import { Machine } from "@/types/machine";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getMachines } from "../../supabase/getMachines";
import { getOptionalsByMachine, Optional } from "../../supabase/getOptionals";

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

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [optionals, setOptionals] = useState<Optional[]>([]);
  const [optionalsOpen, setOptionalsOpen] = useState(false);
  const [optionalsLoading, setOptionalsLoading] = useState(false);

  

  // Fetch machines
  useEffect(() => {
    async function load() {
      const data = await getMachines();
      setMachines(data);
      setLoading(false);
    }
    load();
  }, []);

  // Filter machines based on solution
  const filteredMachines = solution
    ? machines.filter((m) => m.type?.toLowerCase() === solution.toLowerCase())
    : machines;

  // Fetch optionals when button clicked
  const handleAddOptionals = async (machine: Machine) => {
    setSelectedMachine(machine);
    setOptionalsOpen(true);
    setOptionalsLoading(true);

    const data = await getOptionalsByMachine(machine.id);
    setOptionals(data);

    setOptionalsLoading(false);
  };

  return (
    <div className="h-full w-70 flex flex-col bg-white border-r border-slate-100 shadow-inner">

      {/* === FILTER PANEL === */}
      <div className="p-2 border-b border-slate-200 bg-slate-50">
        <div className="space-y-1">

          {/* SEGMENT */}
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

          {/* CAPACITY */}
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

          {/* AUTOMATION */}
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

          {/* SOLUTION */}
          <div>
            <label className="text-xs font-bold text-slate-600">Homag Solutions</label>
            <Select value={solution} onValueChange={setSolution}>
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Select Solution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Press">Press</SelectItem>
                <SelectItem value="Panel Dividing">Panel Dividing</SelectItem>
                <SelectItem value="Edgeband">Edge Bander</SelectItem>
                <SelectItem value="CNC drilling">CNC Machines</SelectItem>
                <SelectItem value="Dust collector (accessories)">Dust Collector</SelectItem>
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

                  {/* ICON */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                    <img src="favicon.png" alt={machine.machine_name} className="object-contain w-full h-full" />
                  </div>

                  {/* INFO */}
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

                  {/* OPTION BUTTON */}
                  <button
                    className="text-[10px] px-2 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddOptionals(machine);
                    }}
                  >
                    Optionals
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* === OPTION MODAL === */}
      <Dialog open={optionalsOpen} onOpenChange={setOptionalsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMachine?.machine_name} - Optionals
            </DialogTitle>
          </DialogHeader>

          {optionalsLoading ? (
            <p className="text-sm text-slate-500">Loading optionals...</p>
          ) : optionals.length === 0 ? (
            <p className="text-sm text-slate-500">No optionals available.</p>
          ) : (
            <div className="space-y-2">
              {optionals.map((opt) => (
                <div 
                  key={opt.id} 
                  className="border rounded-md p-2 hover:bg-slate-50"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{opt.optional_name}</p>
                    <p className="text-xs text-green-600 font-semibold">₹{opt.price}</p>
                  </div>
                  {opt.features && (
                    <p className="text-xs text-slate-500 mt-1">{opt.features}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};
