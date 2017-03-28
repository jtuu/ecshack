import {KeyCode, CommandType} from "./Enum";

export const keyCodeCommandMap = {
  [KeyCode.DOM_VK_NUMPAD1]: CommandType.MOVE_DOWN_LEFT,
  [KeyCode.DOM_VK_NUMPAD2]: CommandType.MOVE_DOWN,
  [KeyCode.DOM_VK_NUMPAD3]: CommandType.MOVE_DOWN_RIGHT,
  [KeyCode.DOM_VK_NUMPAD4]: CommandType.MOVE_LEFT,
  [KeyCode.DOM_VK_NUMPAD6]: CommandType.MOVE_RIGHT,
  [KeyCode.DOM_VK_NUMPAD7]: CommandType.MOVE_UP_LEFT,
  [KeyCode.DOM_VK_NUMPAD8]: CommandType.MOVE_UP,
  [KeyCode.DOM_VK_NUMPAD9]: CommandType.MOVE_UP_RIGHT
};
