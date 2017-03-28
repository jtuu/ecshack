import {createStore, applyMiddleware} from "redux";
import {UIStateReducer, UIState} from "./Reducers";

export const store = createStore<UIState>(UIStateReducer);
export const {dispatch} = store;
