"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function SlotPicker({ days, onSelectSlot }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const firstDayWithSlots =
    days.find((day) => day.slots.length > 0)?.date || days[0]?.date;

  const [activeTab, setActiveTab] = useState(firstDayWithSlots);

  const confirmSelection = () => {
    if (selectedSlot) onSelectSlot(selectedSlot);
  };

  return (
    <div className="space-y-6 bg-black p-4 rounded-xl ">
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* 🔥 Top Date Tabs */}
        <TabsList className="flex flex-col overflow-x-auto bg-[#111] rounded-xl p-2 gap-2">
          {days.map((day) => (
            <TabsTrigger
              key={day.date}
              value={day.date}
              disabled={day.slots.length === 0}
              className="
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                bg-[#1a1a1a] text-gray-400
                data-[state=active]:bg-[#2a2a2a]
                data-[state=active]:text-white
                disabled:opacity-30 disabled:cursor-not-allowed
                whitespace-nowrap transition-all
              "
            >
              <span>
                {format(new Date(day.date), "MMM d")}
              </span>

              <span className="text-xs text-gray-500">
                ({format(new Date(day.date), "EEE")})
              </span>

              {day.slots.length > 0 && (
                <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-md">
                  {day.slots.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 🔥 Slots Section */}
        {days.map((day) => (
          <TabsContent
            key={day.date}
            value={day.date}
            className="mt-4"
          >
            {day.slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No available slots for this day.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Date Heading */}
                <h3 className="text-base font-semibold text-white mb-2">
                  {day.displayDate}
                </h3>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {day.slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime;

                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-medium
                          transition-all border backdrop-blur-sm

                          ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40 scale-105"
                              : "bg-[#151515] text-gray-300 border-[#2a2a2a] hover:bg-[#1f1f1f] hover:border-emerald-500/40"
                          }
                        `}
                      >
                        <Clock
                          className={`h-4 w-4 ${
                            isSelected
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        />

                        <span>
                          {format(
                            new Date(slot.startTime),
                            "h:mm a"
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 🔥 Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={confirmSelection}
          disabled={!selectedSlot}
          className="
            bg-emerald-500 hover:bg-emerald-600
            text-black font-semibold px-6 py-2 rounded-lg
            disabled:opacity-40 flex items-center
          "
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}