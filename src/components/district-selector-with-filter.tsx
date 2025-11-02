"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface District {
  id: string;
  code: string;
  name: string;
  stateCode: string;
  stateName: string;
}

interface DistrictSelectorWithFilterProps {
  districts: District[];
  selectedDistrictId?: string;
  onSelect: (districtId: string) => void;
  placeholder?: string;
  excludeIds?: string[];
}

const ALL_INDIAN_STATES = [
  "ANDAMAN AND NICOBAR",
  "ANDHRA PRADESH",
  "ARUNACHAL PRADESH",
  "ASSAM",
  "BIHAR",
  "CHANDIGARH",
  "CHHATTISGARH",
  "DADRA AND NAGAR HAVELI",
  "DAMAN AND DIU",
  "GOA",
  "GUJARAT",
  "HARYANA",
  "HIMACHAL PRADESH",
  "JAMMU AND KASHMIR",
  "JHARKHAND",
  "KARNATAKA",
  "KERALA",
  "LADAKH",
  "LAKSHADWEEP",
  "MADHYA PRADESH",
  "MAHARASHTRA",
  "MANIPUR",
  "MEGHALAYA",
  "MIZORAM",
  "NAGALAND",
  "ODISHA",
  "PUDUCHERRY",
  "PUNJAB",
  "RAJASTHAN",
  "SIKKIM",
  "TAMIL NADU",
  "TELANGANA",
  "TRIPURA",
  "UTTAR PRADESH",
  "UTTARAKHAND",
  "WEST BENGAL"
];

export function DistrictSelectorWithFilter({
  districts,
  selectedDistrictId,
  onSelect,
  placeholder = "Select District",
  excludeIds = []
}: DistrictSelectorWithFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");

  // Get available districts (excluding already selected ones)
  const availableDistricts = useMemo(() => {
    return districts.filter(d => !excludeIds.includes(d.id));
  }, [districts, excludeIds]);

  // Filter districts by state and search
  const filteredDistricts = useMemo(() => {
    let filtered = availableDistricts;

    // Filter by state
    if (selectedState !== "all") {
      filtered = filtered.filter(d => d.stateName === selectedState);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.code.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableDistricts, selectedState, searchQuery]);

  // Get available states (only states that have districts)
  const availableStates = useMemo(() => {
    const statesWithDistricts = new Set(availableDistricts.map(d => d.stateName));
    return ALL_INDIAN_STATES.filter(state => statesWithDistricts.has(state));
  }, [availableDistricts]);

  // Get selected district name
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);

  const handleSelect = (districtId: string) => {
    onSelect(districtId);
    setOpen(false);
    setSearchQuery("");
    setSelectedState("all");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          {selectedDistrict ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedDistrict.name}</span>
              <span className="text-xs text-muted-foreground">{selectedDistrict.stateName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select District</DialogTitle>
          <DialogDescription>
            Filter by state and search for a district
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All States ({availableDistricts.length} districts)
                </SelectItem>
                {availableStates.map((state) => {
                  const count = availableDistricts.filter(d => d.stateName === state).length;
                  return (
                    <SelectItem key={state} value={state}>
                      {state} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* District List */}
          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-4 space-y-2">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((district) => (
                  <button
                    key={district.id}
                    onClick={() => handleSelect(district.id)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:border-primary transition-colors"
                  >
                    <div className="font-medium">{district.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{district.stateName}</span>
                      <span>•</span>
                      <span>Code: {district.code}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No districts found</p>
                  {searchQuery && (
                    <p className="text-sm mt-2">
                      Try adjusting your search or filter
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredDistricts.length} of {availableDistricts.length} districts
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
