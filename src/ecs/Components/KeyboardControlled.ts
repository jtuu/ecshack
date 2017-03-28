import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface KeyboardControlledState extends ComponentState{
  needsInput: boolean;
}

export interface KeyboardControlledComponent extends Component<KeyboardControlledState>{
  state: KeyboardControlledState;
}

export const KeyboardControlled: KeyboardControlledComponent = {
  enum: ComponentType.KeyboardControlled,
  name: ComponentType[ComponentType.KeyboardControlled],
  state: {
    needsInput: false
  }
}
