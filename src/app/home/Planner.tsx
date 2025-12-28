import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { 
  HiOutlineChevronRight, 
  HiOutlineCalendarDays, 
  HiOutlineCurrencyDollar 
} from "react-icons/hi2";

interface PlannerProps {
  selectedDate: number;
  onDateClick?: (date: number) => void;
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dates = [
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
];

const Planner: React.FC<PlannerProps> = ({ selectedDate, onDateClick }) => {
  return (
    <div className=" p-4 sm:p-6 rounded-2xl [32px] w-full border border-gray-200 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Paragraph3 className="text-xl font-bold text-gray-900">
          Planner
        </Paragraph3>
        <HiOutlineChevronRight className="w-5 h-5 text-blue-500 cursor-pointer" />
      </div>

      {/* Calendar Grid */}
      <div className="mb-8">
        {/* Day Labels */}
        <div className="grid grid-cols-7 mb-4">
          {days.map((day) => (
            <Paragraph1
              key={day}
              className="text-center text-sm font-medium text-blue-500"
            >
              {day}
            </Paragraph1>
          ))}
        </div>

        {/* Date Rows */}
        <div className="space-y-6">
          {dates.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 items-center">
              {week.map((date) => {
                const isSelected = date === selectedDate;
                return (
                  <div
                    key={date}
                    className="flex flex-col items-center relative"
                  >
                    <button
                      onClick={() => onDateClick?.(date)}
                      className={`w-10 h-8 flex items-center justify-center rounded-xl text-sm font-bold transition-all
                        ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-gray-900 hover:bg-gray-200"
                        }`}
                    >
                      {date}
                    </button>

                    {/* Dollar Icon Indicator for selected date */}
                    {isSelected && (
                      <div className="absolute -bottom-6 w-6 h-6 rounded-full bg-[#B2B599] flex items-center justify-center border-2 border-white">
                        <HiOutlineCurrencyDollar className="w-3.5 h-3.5 text-[#4A4D35]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* This Week Card */}
        <div className="bg-[#FFF4E8] border border-orange-400 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 bg-orange-500 rounded-md">
              <HiOutlineCalendarDays className="w-4 h-4 text-white" />
            </div>
            <Paragraph1 className="text-sm font-bold text-orange-500">
              This week
            </Paragraph1>
          </div>
          <Paragraph1 className="text-sm font-bold text-gray-900">
            Bonus
          </Paragraph1>
        </div>

        {/* Next Week Card */}
        <div className="bg-[#EBF3FF] border border-blue-400 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 bg-blue-500 rounded-md">
              <HiOutlineCalendarDays className="w-4 h-4 text-white" />
            </div>
            <Paragraph1 className="text-sm font-bold text-blue-500">
              Next week
            </Paragraph1>
          </div>
          <Paragraph1 className="text-sm font-bold text-gray-900">
            Bonus
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default Planner;