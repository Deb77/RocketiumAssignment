import { createContext, useContext } from "react";
import type { CanvasActionsContextType, CanvasStateContextType } from "./types";

export const CanvasStateContext = createContext<
  CanvasStateContextType | undefined
>(undefined);
export const CanvasActionsContext = createContext<
  CanvasActionsContextType | undefined
>(undefined);

export const useCanvas = (): CanvasStateContextType &
  CanvasActionsContextType => {
  const state = useContext(CanvasStateContext);
  const actions = useContext(CanvasActionsContext);
  if (!state || !actions) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return { ...state, ...actions };
};

export const useCanvasState = (): CanvasStateContextType => {
  const state = useContext(CanvasStateContext);
  if (!state) {
    throw new Error("useCanvasState must be used within a CanvasProvider");
  }
  return state;
};

export const useCanvasActions = (): CanvasActionsContextType => {
  const actions = useContext(CanvasActionsContext);
  if (!actions) {
    throw new Error("useCanvasActions must be used within a CanvasProvider");
  }
  return actions;
};
