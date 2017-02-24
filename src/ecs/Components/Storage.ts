import {Component, ComponentState} from "./Component";
import {ComponentEnum} from "../../Enum";
import Entity from "../Entity";

export interface StorageState extends ComponentState{
  contents: Array<Entity>;
  maxSize: number;
}

export interface StorageComponent extends Component<StorageState>{
  state: StorageState;
}

export const Storage: StorageComponent = {
  enum: ComponentEnum.Storage,
  name: ComponentEnum[ComponentEnum.Storage],
  state: {
    contents: [],
    maxSize: 0
  }
}
