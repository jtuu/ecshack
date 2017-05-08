import {AssemblageData} from "./AssemblageData";
import {ComponentType} from "../../Enum";
import {SpriteId} from "../../Enum";

export const DummyCreatureAssemblageData: AssemblageData = {
  [ComponentType.TileReference]: {},
  [ComponentType.Renderable]: {
    spriteId: SpriteId.MISSING,
    layer: 1
  },
  [ComponentType.AIControlled]: {
    needsInput: false
  },
  [ComponentType.SimpleWalker]: {},
  [ComponentType.Movement]: {},
  [ComponentType.Vision]: {
    shouldRender: false
  },
  [ComponentType.Energy]: {
    speed: 110,
    value: 0
  },
  [ComponentType.Solid]: {}
};
