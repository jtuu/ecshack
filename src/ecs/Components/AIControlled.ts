import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";
import {Controller} from ".";

export interface AIControlledState extends Controller{
}

export interface AIControlledComponent extends Component<AIControlledState>{
  state: AIControlledState;
}

export const AIControlled: AIControlledComponent = {
  enum: ComponentType.AIControlled,
  name: ComponentType[ComponentType.AIControlled],
  state: {
    needsInput: false
  }
}
