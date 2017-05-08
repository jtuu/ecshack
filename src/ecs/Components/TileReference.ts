import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";
import {Entity} from "../Entity"

export interface TileReferenceState extends ComponentState{
  tile: Entity;
}

export interface TileReferenceComponent extends Component<TileReferenceState>{
  state: TileReferenceState;
}

export const TileReference: TileReferenceComponent = {
  enum: ComponentType.TileReference,
  name: ComponentType[ComponentType.TileReference],
  state: {
    tile: null
  }
}
