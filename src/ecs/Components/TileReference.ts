import {Component, ComponentState} from "./Component";
import {ComponentEnum} from "../../Enum";
import Entity from "../Entity"

export interface TileReferenceState extends ComponentState{
  tile: Entity;
}

export interface TileReferenceComponent extends Component<TileReferenceState>{
  state: TileReferenceState;
}

export const TileReference: TileReferenceComponent = {
  enum: ComponentEnum.TileReference,
  name: ComponentEnum[ComponentEnum.TileReference],
  state: {
    tile: null
  }
}
