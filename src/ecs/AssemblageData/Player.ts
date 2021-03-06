import {AssemblageData} from "./AssemblageData";
import {ComponentType} from "../../Enum";
import {SpriteId} from "../../Enum";

export const PlayerAssemblageData: AssemblageData = {
  [ComponentType.TileReference]: {},
  [ComponentType.Renderable]: {
    spriteId: SpriteId.CAPY,
    layer: 1
  },
  [ComponentType.KeyboardControlled]: {
    needsInput: false
  },
  [ComponentType.Movement]: {},
  [ComponentType.Vision]: {
    shouldRender: true
  },
  [ComponentType.Energy]: {
    speed: 110,
    value: 0
  },
  [ComponentType.Solid]: {}
};
