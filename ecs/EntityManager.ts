import {ComponentEnum} from "../Enum";
import {Component, ComponentState} from "./Components/Component";
import * as Components from "./Components";
import {
  isComponent,
  isComponentEnum,
  isComponentName,
  getDefaultComponent,
  createComponent,
  getComponentEnum
} from "./Components/ComponentUtils";
import Entity from "./Entity";
import AssemblageData from "./AssemblageData";
import {intersection} from "lodash";

export default class EntityManager{
  private entityCounter: number = 0;
  private entityStore: Map<ComponentEnum, Map<Entity, Component<any>>> = new Map();

  constructor(){}

  public createEntity(): Entity{
    return new Entity();
  }

  public createEntityFromAssemblage(assemblage: AssemblageData): Entity{
    const entity = new Entity();
    for(const [name, state] of Object.entries(assemblage)){
      this.addComponent(entity, createComponent(getDefaultComponent(name), state));
    }
    return entity;
  }

  public addComponent<S extends ComponentState, C extends Component<S>>(entity: Entity, component: C, state?: S): Entity{
    component = createComponent(component, (state || {}));
    var map = this.entityStore.get(component.enum);
    if(!map){
      map = new Map();
      this.entityStore.set(component.enum, map);
    }
    map.set(entity, component);
    return entity;
  }

  public removeComponent<C extends Component<any>>(entity: Entity, component: C): Entity{
    const map = this.entityStore.get(component.enum);
    map.delete(entity);
    if(!map.size){
      this.entityStore.delete(component.enum);
    }
    return entity;
  }

  public getComponent<C extends Component<any>>(entity: Entity, component: C): C;
  public getComponent<C extends Component<any>>(entity: Entity, componentEnum: ComponentEnum): C;
  public getComponent<C extends Component<any>>(entity: Entity, componentOrEnum: C | ComponentEnum): C{
    const componentEnum: ComponentEnum = getComponentEnum(componentOrEnum);
    if(componentEnum){
      const map = this.entityStore.get(componentEnum);
      if(map){
        return (<C>map.get(entity));
      }
    }

    throw new Error("No such component: " + componentOrEnum);
  }

  public hasComponent<C extends Component<any>>(entity: Entity, componentOrEnum: C | ComponentEnum): boolean{
    const componentEnum: ComponentEnum = getComponentEnum(componentOrEnum);
    const map = this.entityStore.get(componentEnum);
    if(map){
      return map.has(entity);
    }

    throw new Error("No such component: " + componentOrEnum);
  }

  public hasAllComponents<C extends Component<any>>(entity: Entity, ...componentOrEnum: Array<C | ComponentEnum>): boolean{
    const componentEnum: ComponentEnum = getComponentEnum(componentOrEnum[0]);

    const map = this.entityStore.get(componentEnum);
    if(map){
      for(const item of componentOrEnum){
        if(!this.hasComponent(entity, item))return false;
      }
      return true;
    }

    throw new Error("No such component: " + componentOrEnum);
  }

  private getAllHelper<C extends Component<any>>(componentOrEnum: C | ComponentEnum): Array<Entity>{
    const componentEnum: ComponentEnum = getComponentEnum(componentOrEnum);
    const map = this.entityStore.get(componentEnum);
    return Array.from(map.keys());
  }

  public getAll<C extends Component<any>>(...componentOrEnum: Array<C | ComponentEnum>): Array<Entity>{
    if(!componentOrEnum.length)return [];

    var result = this.getAllHelper(componentOrEnum[0]);
    for(let i = 1; i < componentOrEnum.length; i++){
      result = intersection(result, this.getAllHelper(componentOrEnum[i]));
    }
    return result;
  }

  public removeEntity(entity: Entity): void{
    for(const map of this.entityStore.values()){
      map.delete(entity);
    }
  }
}
