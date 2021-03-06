import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";
import {Controller} from ".";

export interface KeyboardControlledState extends Controller{
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
