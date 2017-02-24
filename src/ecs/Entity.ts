export default class Entity{
  private static idCounter: number = 0;
  constructor(){
    return new Number(Entity.idCounter++);
  }
}
