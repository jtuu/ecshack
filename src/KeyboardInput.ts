import {KeyCode} from "./Enum";

interface KeyboardEvent{
  charCode: number;
  keyCode: number;
}

interface KeyStatus{
  status: boolean;
  pressed: boolean;
  released: boolean;
}

interface KeyboardStatus{
  [key: number]: KeyStatus;
}

interface CharStatus{
  [key: number]: boolean;
}

let keyboardStatus: KeyboardStatus = {};
let charPressed: CharStatus = {};
let anyKeyDown = false;
let anyKeyPressed = false;

export function isAnyKeyDown(): boolean{
  return anyKeyDown;
}

export function wasAnyKeyPressed(): boolean{
  return anyKeyPressed;
}

export function isKeyDown(key: KeyCode): boolean{
  return keyboardStatus[key] ? keyboardStatus[key].status : false;
}

export function wasKeyPressed(key: KeyCode): boolean{
  return keyboardStatus[key] ? keyboardStatus[key].pressed : false;
}

export function wasCharPressed(char: number | string): boolean{
  return typeof char === "string" ? charPressed[char.charCodeAt(0)] : charPressed[char];
}

export function wasKeyReleased(key: KeyCode): boolean{
  return keyboardStatus[key] ? keyboardStatus[key].released : false;
}

export function resetKeyboardInput(): void{
  anyKeyDown = false;
  anyKeyPressed = false;

  for(const keyCode of Object.keys(keyboardStatus)){
    keyboardStatus[keyCode].pressed = false;
    keyboardStatus[keyCode].released = false;
  }
  for(const asciiCode of Object.keys(charPressed)){
    charPressed[asciiCode] = false;
  }
}

export function onKeypress(event: KeyboardEvent){
  charPressed[event.charCode] = true;
  anyKeyPressed = true;
}

export function onKeydown(event: KeyboardEvent){
  anyKeyDown = true;
  if (!keyboardStatus[event.keyCode]) {
    keyboardStatus[event.keyCode] = {pressed: true, released: false, status: true};
  } else {
    keyboardStatus[event.keyCode].pressed = true;
    keyboardStatus[event.keyCode].released = false;
    keyboardStatus[event.keyCode].status = true;
  }
}

export function onKeyup(event: KeyboardEvent) {
  if (!keyboardStatus[event.keyCode]) {
    keyboardStatus[event.keyCode] = {pressed: false, released: true, status: false};
  } else {
    keyboardStatus[event.keyCode].pressed = false;
    keyboardStatus[event.keyCode].released = true;
    keyboardStatus[event.keyCode].status = false;
  }
}
