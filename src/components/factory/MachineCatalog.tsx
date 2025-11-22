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

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty
} from "@/components/ui/command";

import { getAllAccessories, Accessory } from "../../supabase/getAccessories";
import { Software, getAllSoftwares } from "../../supabase/getSoftwares.ts"; // adjust path if needed

import { Check } from "lucide-react";


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

  const [selectedOptionals, setSelectedOptionals] = useState<Optional[]>([]);
  const [optionalsTotal, setOptionalsTotal] = useState<number>(0);

const [accessories, setAccessories] = useState<Accessory[]>([]);
const [loadingAccessories, setLoadingAccessories] = useState(true);

const [accessoryCategory, setAccessoryCategory] = useState<Accessory[]>([]);

const [softwares, setSoftwares] = useState<Software[]>([]);
const [selectedSoftwares, setSelectedSoftwares] = useState<Software[]>([]);
const [loadingSoftwares, setLoadingSoftwares] = useState<boolean>(false);


useEffect(() => {
  async function loadAccessories() {
    const data = await getAllAccessories();
    setAccessories(data);
    setLoadingAccessories(false);
  }
  loadAccessories();
}, []);


useEffect(() => {
  const fetchSoftwares = async () => {
    setLoadingSoftwares(true);
    const data = await getAllSoftwares();
    setSoftwares(data);
    setLoadingSoftwares(false);
  };

  fetchSoftwares();
}, []);

  const toggleOptional = (optional: Optional) => {
    setSelectedOptionals((prev) => {
      const exists = prev.find((o) => o.id === optional.id);
      let updated;

      if (exists) {
        updated = prev.filter((o) => o.id !== optional.id);
      } else {
        updated = [...prev, optional];
      }

      const total = updated.reduce((sum, opt) => sum + Number(opt.price), 0);
      setOptionalsTotal(total);

      return updated;
    });
  };

  useEffect(() => {
    async function load() {
      const data = await getMachines();
      setMachines(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredMachines = solution
    ? machines.filter(
        (m) => m.type?.toLowerCase() === solution.toLowerCase()
      )
    : machines;

  const handleAddOptionals = async (machine: Machine) => {
    setSelectedMachine(machine);
    setSelectedOptionals([]);   // ✅ Reset previous data
    setOptionalsTotal(0);
    setOptionalsOpen(true);
    setOptionalsLoading(true);

    const data = await getOptionalsByMachine(machine.id);
    setOptionals(data);

    setOptionalsLoading(false);
  };

return (
  <div className="h-full w-70 bg-white border-r border-slate-100 shadow-inner overflow-hidden">

    {/* MASTER SCROLL */}
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col">

        {/* FILTER PANEL */}
        <div className="p-2 border-b border-slate-200 bg-slate-50  top-0 z-10">
          <div className="space-y-1">

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

            <div>
              <label className="text-xs font-bold text-slate-600">Automation</label>
              <Select value={automation} onValueChange={setAutomation}>
                <SelectTrigger className="w-full h-7 text-xs">
                  <SelectValue placeholder="Select Automation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Semi-automatic">Semi Automatic</SelectItem>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        {/* MACHINE LIST */}
        <div className="p-2">
          <p className="text-xs font-bold text-slate-600 mb-1">Machines</p>

          {/* Machine scroll only */}
          <div className="h-[40vh] border rounded-md">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-3">
                {loading ? (
                  <p className="text-center text-sm text-slate-500">Loading machines…</p>
                ) : filteredMachines.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">No machines found.</p>
                ) : (
                  filteredMachines.map((machine) => (
                    <Card
                      key={machine.id}
                      className="p-2 cursor-pointer hover:shadow-md hover:bg-blue-50/40 transition-all rounded-lg border"
                      onClick={() => onMachineSelect(machine)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100">
                          <img src="favicon.png" className="object-contain w-full h-full" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-xs truncate">
                            {machine.machine_name}
                          </h3>
                          <Badge variant="secondary" className="text-[10px] mt-1">
                            {machine.type}
                          </Badge>
                        </div>

                        <button
                          className="text-[10px] px-2 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
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
          </div>
        </div>

{/* ACCESSORIES LIST - MULTISELECT WITH FETCHED DATA */}
<div className="py-4">
  <label className="text-xs font-bold text-slate-600">Accessories</label>

  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full h-8 px-2 text-xs justify-between"
      >
        {accessoryCategory.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {accessoryCategory.map((acc) => (
              <Badge
                key={acc.id}
                className="text-[10px] flex items-center gap-1"
              >
                {acc.accessory_name}

                {/* REMOVE BUTTON */}
                <button
                  className="text-red-500 text-[10px] ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccessoryCategory((prev: any[]) =>
                      prev.filter((p) => p.id !== acc.id)
                    );
                  }}
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          "Select Accessories"
        )}
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-[240px] p-0">
      {loadingAccessories ? (
        <div className="p-2 text-xs text-slate-500">Loading...</div>
      ) : (
        <Command>
          {/* SEARCH */}
          <div className="p-2">
            <CommandInput placeholder="Search accessories..." />
          </div>

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup>
              {accessories.map((item) => {
                const selected = accessoryCategory.some((x) => x.id === item.id);

                return (
                  <CommandItem
                    key={item.id}
                    value={item.accessory_name}
                    className="flex items-center justify-between"
                    onSelect={() => {
                      setAccessoryCategory((prev: any[]) =>
                        selected
                          ? prev.filter((p) => p.id !== item.id)
                          : [...prev, item]
                      );
                    }}
                  >
                    <div>
                      <span className="text-xs">{item.accessory_name}</span>
                      {item.price && (
                        <p className="text-[10px] text-green-600">
                          ₹{item.price}
                        </p>
                      )}
                    </div>

                    {/* ADD BUTTON */}
                    <Button
                      variant={selected ? "destructive" : "secondary"}
                      className="h-5 text-[10px] px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccessoryCategory((prev: any[]) =>
                          selected
                            ? prev.filter((p) => p.id !== item.id)
                            : [...prev, item]
                        );
                      }}
                    >
                      {selected ? "Remove" : "Add"}
                    </Button>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {/* CLEAR ALL BUTTON */}
          {accessoryCategory.length > 0 && (
            <div className="p-2 border-t bg-slate-50">
              <Button
                variant="destructive"
                className="w-full h-7 text-xs"
                onClick={() => setAccessoryCategory([])}
              >
                Clear All
              </Button>
            </div>
          )}
        </Command>
      )}
    </PopoverContent>
  </Popover>
</div>


{/* SOFTWARES LIST - MULTISELECT WITH FETCHED DATA */}
<div className="py-4">
  <label className="text-xs font-bold text-slate-600">Softwares</label>

  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full h-8 px-2 text-xs justify-between"
      >
        {selectedSoftwares.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedSoftwares.map((sw) => (
              <Badge
                key={sw.id}
                className="text-[10px] flex items-center gap-1"
              >
                {sw.software_name}

                {/* REMOVE BUTTON */}
                <button
                  className="text-red-500 text-[10px] ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSoftwares((prev: any[]) =>
                      prev.filter((p) => p.id !== sw.id)
                    );
                  }}
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          "Select Softwares"
        )}
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-[260px] p-0">
      {loadingSoftwares ? (
        <div className="p-2 text-xs text-slate-500">Loading...</div>
      ) : (
        <Command>
          {/* SEARCH */}
          <div className="p-2">
            <CommandInput placeholder="Search softwares..." />
          </div>

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup>
              {softwares.map((item) => {
                const selected = selectedSoftwares.some((x) => x.id === item.id);

                return (
                  <CommandItem
                    key={item.id}
                    value={item.software_name}
                    className="flex items-center justify-between"
                    onSelect={() => {
                      setSelectedSoftwares((prev: any[]) =>
                        selected
                          ? prev.filter((p) => p.id !== item.id)
                          : [...prev, item]
                      );
                    }}
                  >
                    <div>
                      <span className="text-xs">{item.software_name}</span>
                      {item.price && (
                        <p className="text-[10px] text-blue-600">
                          ₹{item.price}
                        </p>
                      )}
                    </div>

                    {/* ADD / REMOVE BUTTON */}
                    <Button
                      variant={selected ? "destructive" : "secondary"}
                      className="h-5 text-[10px] px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSoftwares((prev: any[]) =>
                          selected
                            ? prev.filter((p) => p.id !== item.id)
                            : [...prev, item]
                        );
                      }}
                    >
                      {selected ? "Remove" : "Add"}
                    </Button>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {/* CLEAR ALL */}
          {selectedSoftwares.length > 0 && (
            <div className="p-2 border-t bg-slate-50">
              <Button
                variant="destructive"
                className="w-full h-7 text-xs"
                onClick={() => setSelectedSoftwares([])}
              >
                Clear All
              </Button>
            </div>
          )}
        </Command>
      )}
    </PopoverContent>
  </Popover>
</div>




        {/* OPTION MODAL - untouched */}
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
                {optionals.map((opt) => {
                  const isChecked = selectedOptionals.some((o) => o.id === opt.id);

                  return (
                    <div key={opt.id} className="flex gap-2 border p-2 rounded-md">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOptional(opt)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{opt.optional_name}</p>
                          <p className="text-xs text-green-600 font-semibold">₹{opt.price}</p>
                        </div>
                        {opt.features && (
                          <p className="text-xs text-slate-500 mt-1">{opt.features}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t mt-3 flex justify-between items-center">
              <div className="text-sm font-semibold text-slate-600">
                Optionals Total: 
                <span className="ml-1 text-green-600">
                  ₹{optionalsTotal.toLocaleString()}
                </span>
              </div>

              <button
                className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
                onClick={() => {
                  if (!selectedMachine) return;

                  onMachineSelect({
                    ...selectedMachine,
                    selectedOptionals,
                    optionalsCost: optionalsTotal
                  } as Machine);

                  setOptionalsOpen(false);
                }}
              >
                Add Machine
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </ScrollArea>
  </div>
);

};
