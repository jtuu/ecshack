import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface TileState extends ComponentState{
  isSeen: boolean;
  isEntry: boolean;
}

export interface TileComponent extends Component<TileState>{
  state: TileState;
}

export const Tile: TileComponent = {
  enum: ComponentType.Tile,
  name: ComponentType[ComponentType.Tile],
  state: {
    isSeen: null,
    isEntry: null
  }
}
