import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  canvasWidth: number;
  canvasHeight: number;
  isHistoryEmpty: boolean;
  isRedoEmpty: boolean;
  isCommentMode: boolean;
}

const initialState: UIState = {
  canvasWidth: 500,
  canvasHeight: 500,
  isHistoryEmpty: true,
  isRedoEmpty: true,
  isCommentMode: false,
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
    setIsCommentMode(state, action: PayloadAction<boolean>) {
      state.isCommentMode = action.payload;
    },
  },
});

export const { setCanvasWidth, setCanvasHeight, setHistoryFlags, setIsCommentMode } = uiSlice.actions;
export default uiSlice.reducer;
