import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  canvasWidth: number;
  canvasHeight: number;
  isHistoryEmpty: boolean;
  isRedoEmpty: boolean;
}

const initialState: UIState = {
  canvasWidth: 500,
  canvasHeight: 500,
  isHistoryEmpty: true,
  isRedoEmpty: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCanvasWidth(state, action: PayloadAction<number>) {
      state.canvasWidth = action.payload;
    },
    setCanvasHeight(state, action: PayloadAction<number>) {
      state.canvasHeight = action.payload;
    },
    setHistoryFlags(state, action: PayloadAction<{ isHistoryEmpty: boolean; isRedoEmpty: boolean }>) {
      state.isHistoryEmpty = action.payload.isHistoryEmpty;
      state.isRedoEmpty = action.payload.isRedoEmpty;
    },
  },
});

export const { setCanvasWidth, setCanvasHeight, setHistoryFlags } = uiSlice.actions;
export default uiSlice.reducer;
