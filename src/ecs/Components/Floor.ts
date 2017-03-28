import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface FloorState extends ComponentState{

}

export interface FloorComponent extends Component<FloorState>{
  state: FloorState;
}

export const Floor: FloorComponent = {
  enum: ComponentType.Floor,
  name: ComponentType[ComponentType.Floor],
  state: {
    
  }
}
