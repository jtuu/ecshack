import {Component, ComponentState} from "./Component";
import {ComponentType, Direction} from "../../Enum";

export interface MovementState extends ComponentState{
  direction: Direction;
}

export interface MovementComponent extends Component<MovementState>{
  state: MovementState;
}

export const Movement: MovementComponent = {
  enum: ComponentType.Movement,
  name: ComponentType[ComponentType.Movement],
  state: {
    direction: null
  }
}
