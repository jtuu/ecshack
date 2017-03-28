import AssemblageData from "./AssemblageData";
import {ComponentType} from "../../Enum";
import {ConstantPosition} from "../Components/ConstantPosition";
import {SpriteId} from "../../Enum";

const PlayerAssemblageData: AssemblageData = {
  [ComponentType.TileReference]: {},
  [ComponentType.Renderable]: {
    spriteId: SpriteId.CAPY,
    layer: 1
  },
  [ComponentType.KeyboardControlled]: {
    needsInput: true
  },
  [ComponentType.Movement]: {}
};
export default PlayerAssemblageData;
