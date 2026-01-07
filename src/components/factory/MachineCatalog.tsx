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
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

import { Checkbox } from "@/components/ui/checkbox";


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
  onGlobalAccessoriesChange?: (accessories: Accessory[]) => void;
  onGlobalSoftwaresChange?: (softwares: Software[]) => void;
}



export const MachineCatalog = ({
  onMachineSelect,
  onGlobalAccessoriesChange,
  onGlobalSoftwaresChange, // ✅ add here
}: MachineCatalogProps) =>{
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

const [accessoryCategory, setAccessoryCategory] = useState<SelectedAccessory[]>([]);

const [softwares, setSoftwares] = useState<Software[]>([]);
const [selectedSoftwares, setSelectedSoftwares] = useState<SelectedSoftware[]>([]);
const [loadingSoftwares, setLoadingSoftwares] = useState<boolean>(false);


const [openAccessoriesDrawer, setOpenAccessoriesDrawer] = useState(false);
const [openSoftwareDrawer, setOpenSoftwareDrawer] = useState(false);

const [customDialogOpen, setCustomDialogOpen] = useState(false);
const [pendingCustomMachine, setPendingCustomMachine] = useState<Machine | null>(null);

const [customWidth, setCustomWidth] = useState(3);   // meters
const [customLength, setCustomLength] = useState(5); // meters

const [customMachineName, setCustomMachineName] = useState("");
const [workingAreaDialogOpen, setWorkingAreaDialogOpen] = useState(false);
const [workingAreaWidth, setWorkingAreaWidth] = useState(4);   // meters
const [workingAreaLength, setWorkingAreaLength] = useState(3); // meters
const [workingAreaName, setWorkingAreaName] = useState("Buffer Space");


type SelectedAccessory = Accessory & {
  qty: number;
};

type SelectedSoftware = Software & { qty: number };

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
                  <SelectItem value="Custom Machine">Others</SelectItem>

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

                {/* CUSTOM WORKING AREA – only for Custom Machine */}
{solution === "Custom Machine" && (
  <Card
    className="p-3 rounded-xl border hover:shadow-md hover:bg-slate-50 transition-all"
  >
    <div className="flex items-center gap-3">

      {/* Thumbnail (same size as machines) */}
{/* Thumbnail – same as other machines */}
<div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 shrink-0">
  <img
    src="favicon.png"
    alt="Homag"
    className="object-contain w-8 h-8"
  />
</div>


      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-xs break-words leading-snug">
          Custom Space
        </h3>

      </div>

      {/* Actions – SAME pattern as machine */}
      <div className="flex flex-col gap-1 shrink-0">
<button
  className="text-[10px] px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
  onClick={(e) => {
    e.stopPropagation();
    setWorkingAreaWidth(4);
    setWorkingAreaLength(3);
    setWorkingAreaDialogOpen(true);
  }}
>
  Add to Layout
</button>

      </div>

    </div>
  </Card>
)}

                {loading ? (
                  <p className="text-center text-sm text-slate-500">Loading machines…</p>
                ) : filteredMachines.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">No machines found.</p>
                ) : (
                  filteredMachines.map((machine) => (
                  <Card
                    key={machine.id}
                    className="p-3 rounded-xl border hover:shadow-md hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">

                      {/* Thumbnail */}
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 shrink-0">
                        <img src="favicon.png" className="object-contain w-8 h-8" />
                      </div>

                      {/* Info */}
<div className="flex-1 min-w-0">
<h3
  className="font-semibold text-xs w-[138px] break-words whitespace-normal leading-snug"
>
  {machine.machine_name}
</h3>

                  <p className="mt-0 leading-none">
                    {Number.isFinite(machine.productivity_boards_min) && (
                      <span className="text-[11px] leading-none font-normal text-slate-500">
                        Avg ({Math.round(
                          ((machine.productivity_boards_min ?? 0) +
                            (machine.productivity_boards_max ??
                              machine.productivity_boards_min ??
                              0)) /
                            2
                        )} boards/shift)
                      </span>
                    )}
                  </p>


                        {/* Meta actions */}
{/* Meta actions */}
{solution !== "Press" && (
  <div className="flex items-center gap-1 mt-1">
    {machine.youtube_link && (
      <button
        className="text-[10px] px-2 py-0.5 rounded-md border text-red-600 border-red-300 hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
          window.open(machine.youtube_link, "_blank");
        }}
      >
        YouTube
      </button>
    )}

    {machine.machine_spec && (
      <button
        className="text-[10px] px-2 py-0.5 rounded-md border text-slate-600 border-slate-300 hover:bg-slate-100"
        onClick={(e) => {
          e.stopPropagation();
          window.open(machine.machine_spec, "_blank");
        }}
      >
        Spec
      </button>
    )}
  </div>
)}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          className="text-[10px] px-3 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddOptionals(machine);
                          }}
                        >
                          Optionals
                        </button>

<button
  className="text-[10px] px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
  onClick={(e) => {
    e.stopPropagation();

if (machine.type === "Custom Machine") {
  setPendingCustomMachine(machine);
  setCustomWidth(3);
  setCustomLength(5);
  setCustomMachineName(""); // ✅ reset
  setCustomDialogOpen(true);
  return;
}


    onMachineSelect(machine);
  }}
>
  Add to Layout
</button>

                      </div>

                    </div>
                  </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

<p>Accessories Selection</p>
{/* ACCESSORIES LIST - MULTISELECT WITH FETCHED DATA */}
<Drawer open={openAccessoriesDrawer} onOpenChange={setOpenAccessoriesDrawer}>
  <DrawerTrigger asChild>
    <Button
      variant="outline"
      className="w-full h-8 text-xs"
      onClick={() => setOpenAccessoriesDrawer(true)}
    >
      {accessoryCategory.length > 0
        ? `${accessoryCategory.length} selected`
        : "Select Accessories"}
    </Button>
  </DrawerTrigger>

  <DrawerContent className="p-4">
    <DrawerHeader>
      <DrawerTitle>Select Accessories</DrawerTitle>
    </DrawerHeader>

    <div className="max-h-[60vh] overflow-y-auto space-y-2">
      {accessories.map((item) => {
        const existing = accessoryCategory.find((x) => x.id === item.id);
        const selected = !!existing;

        const updateQty = (delta) => {
          setAccessoryCategory((prev) =>
            prev.map((a) =>
              a.id === item.id
                ? { ...a, qty: Math.max(1, (a.qty || 1) + delta) }
                : a
            )
          );
        };

        return (
          <div
            key={item.id}
            className="flex items-center justify-between border p-2 rounded-lg"
          >
            {/* NAME + PRICE */}
            <div className="text-xs">
              <p>{item.accessory_name}</p>
              <p className="text-[10px] text-green-600">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-2">

              {/* QTY BUTTONS – only show if checked */}
              {selected && (
                <div className="flex items-center border rounded px-2">
                  <button
                    className="px-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQty(-1);
                    }}
                  >
                    –
                  </button>

                  <span className="px-1 text-xs">
                    {existing.qty || 1}
                  </span>

                  <button
                    className="px-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQty(1);
                    }}
                  >
                    +
                  </button>
                </div>
              )}

              <Checkbox
                checked={selected}
                onCheckedChange={() =>
                  setAccessoryCategory((prev) =>
                    selected
                      ? prev.filter((p) => p.id !== item.id)
                      : [...prev, { ...item, qty: 1 }]
                  )
                }
              />
            </div>
          </div>
        );
      })}
    </div>

    <DrawerFooter>
      <Button
        variant="destructive"
        onClick={() => setAccessoryCategory([])}
      >
        Clear All
      </Button>

      <Button
        onClick={() => {
          if (onGlobalAccessoriesChange) {
            onGlobalAccessoriesChange(accessoryCategory);
          }
          setOpenAccessoriesDrawer(false);
        }}
      >
        Apply
      </Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>



<p>Software Selection</p>
{/* SOFTWARES LIST - MULTISELECT WITH FETCHED DATA */}
<Drawer open={openSoftwareDrawer} onOpenChange={setOpenSoftwareDrawer}>
  <DrawerTrigger asChild>
    <Button
      variant="outline"
      className="w-full h-8 text-xs"
      onClick={() => setOpenSoftwareDrawer(true)}
    >
      {selectedSoftwares.length > 0
        ? `${selectedSoftwares.length} selected`
        : "Select Softwares"}
    </Button>
  </DrawerTrigger>

<DrawerContent className="p-4">
  <DrawerHeader>
    <DrawerTitle>Select Softwares</DrawerTitle>
  </DrawerHeader>

  <div className="max-h-[60vh] overflow-y-auto space-y-2">
    {loadingSoftwares ? (
      <p className="text-xs text-slate-500">Loading softwares…</p>
    ) : softwares.length === 0 ? (
      <p className="text-xs text-slate-500">No softwares found.</p>
    ) : (
      softwares.map((sw) => {
        const existing = selectedSoftwares.find((x) => x.id === sw.id);
        const selected = !!existing;

        const updateQty = (delta: number) => {
          setSelectedSoftwares((prev) =>
            prev.map((s) =>
              s.id === sw.id
                ? { ...s, qty: Math.max(1, (s.qty || 1) + delta) }
                : s
            )
          );
        };

        return (
          <div
            key={sw.id}
            className="flex items-center justify-between border p-2 rounded-lg"
          >
            {/* NAME + PRICE */}
            <div className="text-xs">
              <p>{sw.software_name}</p>
              <p className="text-[10px] text-blue-600">
                ₹{sw.price}
              </p>
            </div>

            <div className="flex items-center gap-2">

              {/* QTY BUTTONS – only if selected */}
              {selected && (
                <div className="flex items-center border rounded px-2">
                  <button
                    className="px-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQty(-1);
                    }}
                  >
                    –
                  </button>

                  <span className="px-1 text-xs">
                    {existing.qty || 1}
                  </span>

                  <button
                    className="px-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQty(1);
                    }}
                  >
                    +
                  </button>
                </div>
              )}

              {/* CHECKBOX */}
              <Checkbox
                checked={selected}
                onCheckedChange={() =>
                  setSelectedSoftwares((prev) =>
                    selected
                      ? prev.filter((p) => p.id !== sw.id)
                      : [...prev, { ...sw, qty: 1 }]
                  )
                }
              />
            </div>
          </div>
        );
      })
    )}
  </div>

  <DrawerFooter className="flex justify-between">
    <Button variant="destructive" onClick={() => setSelectedSoftwares([])}>
      Clear All
    </Button>

    <Button
      onClick={() => {
        if (onGlobalSoftwaresChange) {
          onGlobalSoftwaresChange(selectedSoftwares);
        }
        setOpenSoftwareDrawer(false);
      }}
    >
      Apply
    </Button>
  </DrawerFooter>
</DrawerContent>

</Drawer>





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
        <br />

        <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>

{/* WORKING AREA DIALOG */}
<Dialog
  open={workingAreaDialogOpen}
  onOpenChange={setWorkingAreaDialogOpen}
>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Custom Working Space</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-600">
          Working Area Name
        </label>
        <input
          type="text"
          value={workingAreaName}
          onChange={(e) => setWorkingAreaName(e.target.value)}
          className="w-full border rounded-md px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600">
          Width (meters)
        </label>
        <input
          type="number"
          min={0.5}
          step={0.1}
          value={workingAreaWidth}
          onChange={(e) => setWorkingAreaWidth(Number(e.target.value))}
          className="w-full border rounded-md px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600">
          Length (meters)
        </label>
        <input
          type="number"
          min={0.5}
          step={0.1}
          value={workingAreaLength}
          onChange={(e) => setWorkingAreaLength(Number(e.target.value))}
          className="w-full border rounded-md px-2 py-1 text-sm"
        />
      </div>
    </div>

    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
      <Button
        variant="outline"
        onClick={() => setWorkingAreaDialogOpen(false)}
      >
        Cancel
      </Button>

      <Button
        onClick={() => {
          onMachineSelect({
            id: -999,
            machine_name: workingAreaName || "Working Area", // ✅ FIXED
            width_mm: workingAreaWidth * 1000,
            length_mm: workingAreaLength * 1000,
            isCustom: true,
            type: "WORKING_AREA",
          } as any);

          setWorkingAreaDialogOpen(false);
        }}
      >
        Add Working Area
      </Button>
    </div>
  </DialogContent>
</Dialog>

  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Custom Machine Dimensions</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
  <label className="text-xs font-semibold text-slate-600">
    Machine Name
  </label>
  <input
    type="text"
    placeholder="Enter machine name"
    value={customMachineName}
    onChange={(e) => setCustomMachineName(e.target.value)}
    className="w-full border rounded-md px-2 py-1 text-sm"
  />
</div>

      <div>
        <label className="text-xs font-semibold text-slate-600">
          Width (meters)
        </label>
        <input
          type="number"
          min={0.5}
          step={0.1}
          value={customWidth}
          onChange={(e) => setCustomWidth(Number(e.target.value))}
          className="w-full border rounded-md px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600">
          Length (meters)
        </label>
        <input
          type="number"
          min={0.5}
          step={0.1}
          value={customLength}
          onChange={(e) => setCustomLength(Number(e.target.value))}
          className="w-full border rounded-md px-2 py-1 text-sm"
        />
      </div>

    </div>

    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
      <Button
        variant="outline"
        onClick={() => setCustomDialogOpen(false)}
      >
        Cancel
      </Button>

      <Button
        onClick={() => {
          if (!pendingCustomMachine) return;

const customMachine: Machine = {
  ...pendingCustomMachine,
  machine_name: customMachineName || pendingCustomMachine.machine_name,
  width_mm: customWidth * 1000,
  length_mm: customLength * 1000,
  isCustom: true,
};

          onMachineSelect(customMachine);

          setCustomDialogOpen(false);
          setPendingCustomMachine(null);
        }}
      >
        Add Machine
      </Button>
    </div>
  </DialogContent>
</Dialog>

      </div>
    </ScrollArea>
  </div>
);

};
