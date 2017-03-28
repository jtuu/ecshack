import {ComponentType} from "../../Enum";

export interface ComponentState{
  [key: string]: any;
}

export interface Component<S extends ComponentState>{
  enum: ComponentType;
  name: string;
  state: S;
}
