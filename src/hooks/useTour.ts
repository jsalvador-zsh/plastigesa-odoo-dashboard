// src/hooks/useTour.ts
import { driver, Driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback, useMemo } from "react";

export function useTour() {
  const driverObj = useMemo(() => {
    if (typeof window === "undefined") return null;

    return driver({
      showProgress: true,
      popoverClass: 'driverjs-theme',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      steps: []
    });
  }, []);

  const startTour = useCallback((steps: DriveStep[]) => {
    if (!driverObj) return;

    driverObj.setSteps(steps);
    driverObj.drive();
  }, [driverObj]);

  return {
    startTour
  };
}
