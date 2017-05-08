import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface SimpleWalkerState extends ComponentState{}

export interface SimpleWalkerComponent extends Component<SimpleWalkerState>{
  state: SimpleWalkerState;
}

export const SimpleWalker: SimpleWalkerComponent = {
  enum: ComponentType.SimpleWalker,
  name: ComponentType[ComponentType.SimpleWalker],
  state: {}
}
