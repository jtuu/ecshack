import {EntityManager} from "./EntityManager";
import {Component} from "./Components/Component";
import {ComponentIdentity} from "./Components/ComponentUtils";

/*
export default class Entity extends Number{
  private static idCounter: number = 0;

  constructor(private entityManager: EntityManager){
    super(Entity.idCounter++);
  }

  public static isEntity(arg: any): boolean{
    return !isNaN(arg);
  }

  public toNumber(): number{
    return Number(this);
  }

  public getComponent<C extends Component<any>>(ident: ComponentIdentity<any>): Component<any>{
    return this.entityManager.getComponent(this, ident);
  }

  public hasComponent<C extends Component<any>>(ident: ComponentIdentity<any>): boolean{
    return this.entityManager.hasComponent(this, ident);
  }

  public hasAllComponents<C extends Component<any>>(...ident: Array<ComponentIdentity<any>>): boolean{
    return this.entityManager.hasAllComponents(this, ...ident);
  }
}
*/

export type Entity = number;
