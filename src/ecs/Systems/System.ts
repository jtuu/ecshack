import Entity from "../Entity";
import {ComponentType} from "../../Enum";

abstract class System{
  abstract readonly subscribedComponents: Array<ComponentType>;
  abstract update(entities: Iterable<Entity>): boolean;
}
export default System;
