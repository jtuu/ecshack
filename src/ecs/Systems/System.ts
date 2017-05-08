import {Entity} from "../Entity";
import {ComponentType} from "../../Enum";

export abstract class System{
  public abstract readonly subscribedComponents: Array<ComponentType>;
  public abstract update(entities: Iterable<Entity>): boolean;

  public afterUpdate(): void{}
}
