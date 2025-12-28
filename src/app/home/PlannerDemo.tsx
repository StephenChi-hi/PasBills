import React, { useState } from "react";
import Planner from "./Planner";

const PlannerDemo = () => {
  const [selected, setSelected] = useState(21);

  return (
    <>
      <Planner
        selectedDate={selected}
        onDateClick={(date) => setSelected(date)}
      />
    </>
  );
};

export default PlannerDemo;
