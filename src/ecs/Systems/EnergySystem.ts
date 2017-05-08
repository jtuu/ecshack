import {System} from "./System";
import {ComponentType, Direction} from "../../Enum";
import {Entity} from "../Entity";
import {engine, entityManager} from "../../EngineWorker";
import {getController} from "../EntityUtils";

const maxEnergy = 100;
const speedEnergyValue = [
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,
  2,  2,  2,  2,  2,  2,  2,  3,  3,  3,
  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,
  5,  5,  5,  5,  6,  6,  7,  7,  8,  9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36, 36, 37, 37,
  38, 38, 39, 39, 40, 40, 40, 41, 41, 41,
  42, 42, 42, 43, 43, 43, 44, 44, 44, 44,
  45, 45, 45, 45, 45, 46, 46, 46, 46, 46,
  47, 47, 47, 47, 47, 48, 48, 48, 48, 48,
  49, 49, 49, 49, 49, 49, 49, 49, 49, 49,
  49, 49, 49, 49, 49, 49, 49, 49, 49, 49
];

export class EnergySystem extends System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Energy];

  public update(entities: Iterable<Entity>){
    for(const entity of entities){
      const energy = entityManager.getComponent(entity, ComponentType.Energy).state;
      energy.value += speedEnergyValue[energy.speed];

      if(energy.value >= maxEnergy){
        const controller = getController(entity);
        if(controller){
          controller.needsInput = true;
        }
      }
    }
    return false;
  }
}
