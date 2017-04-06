import {engine} from "./EngineWorker";
import Rng from "./Random";

const maxIters = 150;
const alphabetStart = "a".charCodeAt(0);

const consonants: Array<string> = "bcdfghjklmnpqrstvwxz".split("");
function isConsonant(char: string): boolean{
  return consonants.indexOf(char) > -1;
}

const weightedVowels: Array<string> = "aeiouaeiouaeiouy  ".split("");
function getWeightedRandomVowel(seed: number): string{
  return weightedVowels[seed % (weightedVowels.length - 1)];
}

const enum ConsonantSet{
  BB = 0,
  EB = 27,
  BE = 14,
  EE = 56,
  BM = 0,
  EM = 67,
  END = ConsonantSet.EM
}
const consonantSets: Array<string> = [
  "kl", "gr", "cl", "cr", "fr",
  "pr", "tr", "tw", "br", "pl",
  "bl", "str", "shr", "thr",

  "sm", "sh", "ch", "th", "ph",
  "pn", "kh", "gh", "mn", "ps",
  "st", "sk", "sch",

  "ts", "cs", "xt", "nt", "ll",
  "rr", "ss", "wk", "wn", "ng",
  "cw", "mp", "ck", "nk", "dd",
  "tt", "bb", "pp", "nn", "mm",
  "kk", "gg", "ff", "pt", "tz",
  "dgh", "rgh", "rph", "rch",

  "cz", "xk", "zx", "xz", "cv",
  "vv", "nl", "rh", "dw", "nw",
  "khl"
];
function getRandomConsonantSet(seed: number): string{
  return consonantSets[seed];
}

const weightedConsonants: Array<string> = "bbccddffgghhjkkllmmnnppqrrssttvwxzcdfghlmnrstlmnrst".split("");
function getWeightedRandomConsonant(seed: number): string{
  return weightedConsonants[seed % (weightedConsonants.length - 1)];
}

export function makeName1(seed?: number){
  var rng: Rng;
  if(seed === undefined){
    rng = engine.worldGenRng;
  }else{
    rng = new Rng(seed);
  }

  var name: string = "";
  var hasSpace: boolean = false;
  var desiredNameLength: number = Math.min(
    WORLDGEN_NAME_MAX_LENGTH,
    3 + rng.genrand_int32() % 5
    + ((rng.genrand_int32() % 5 === 0) ? rng.genrand_int32() % 6 : 1)
  );

  for(let iters = 0; iters < maxIters && name.length < desiredNameLength; ++iters){
    const prevChar = name.length ? name[name.length - 1] : "";
    const penultChar = name.length > 1 ? name[name.length - 2] : "";

    if(
      !name
      || prevChar === " "
    ){
      name += String.fromCharCode(alphabetStart + (rng.genrand_int32() % 26));
    }else if(
      !hasSpace
      && name.length > 5
      && name.length < desiredNameLength - 4
      && rng.genrand_int32() % 5
    ){
      name += " ";
    }else if(
      name
      && (isConsonant(prevChar)
        || (name.length > 1
          && !isConsonant(prevChar)
          && isConsonant(penultChar)
          && rng.genrand_int32() % 5 <= 1)
      )
    ){
      const vowel = getWeightedRandomVowel(rng.genrand_int32());

      if(vowel === " "){
        if(
          desiredNameLength < 7
            || name.length <= 2
            || name.length >= desiredNameLength - 3
            || prevChar === " "
            || penultChar === " "
            || name.length > 2
              && isConsonant(prevChar)
              && isConsonant(penultChar)
        ){
          continue;
        }
      }else if(
        name.length > 1
        && vowel === prevChar
        && (
          vowel === "y"
          || vowel === "i"
          || rng.genrand_int32() % 5 <= 1
        )
      ){
        continue;
      }

      name += vowel;
    }else{
      const isBeginning = !!(!name || prevChar === " ");
      const isEnd = !!(name.length >= desiredNameLength - 2);

      if(
        (desiredNameLength > 3 || name)
        && rng.genrand_int32() % 7 <= 1
        && (!isBeginning || !isEnd)
      ){
        const first = (isBeginning ? ConsonantSet.BB : (isEnd ? ConsonantSet.BE : ConsonantSet.BM));
        const last = (isBeginning ? ConsonantSet.EB : (isEnd ? ConsonantSet.EE : ConsonantSet.EM));
        const range = last - first;

        const consonantSeed = rng.genrand_int32() % range + first;

        const consonantSet = getRandomConsonantSet(consonantSeed);

        desiredNameLength += consonantSet.length - 2;
        name += consonantSet;
      }else{
        name += getWeightedRandomConsonant(rng.genrand_int32());
      }
    }

    if(name[name.length - 1] === " "){
      hasSpace = true;
    }
  }

  const lastChar = name[name.length - 1];
  if(
    name
    && lastChar !== " "
    && lastChar !== "y"
    && !isConsonant(lastChar)
    && (
      name.length < desiredNameLength
      || (
        desiredNameLength < 8
        && rng.genrand_int32() % 3
      )
    )
  ){
    name += getWeightedRandomConsonant(rng.genrand_int32());
  }

  if(name.length < 4){
    name = "capy";
  }

  return name;
}

const translators: Array<(rng: Rng) => string> = [
   rng => rng.pick("aeiou"),
   rng => rng.pick("aeiou") + rng.pick("aeiou"),
   rng => rng.pick("dhjkmnstvwxyzbgpcflr"),
   rng => rng.pick("bgpcf") + rng.pick("lr"),
   rng => rng.pick(["st", "sl", "sw", "sh", "ch", "th", "dr", "tw", "ph", "tr", "wh", "gh", "zh"]),
   rng => rng.pick(["ss", "tt", "zz", "ff", "ll", "rr", "dd"]),
   rng => rng.pick(["bb", "gg", "cc", "mm", "nn", "pp"])
];

export function makeName2(seed?: number){
  var rng: Rng;
  if(seed === undefined){
    rng = engine.worldGenRng;
  }else{
    rng = new Rng(seed);
  }

  const genArr: Array<number> = Array(4);
  genArr[0] = rng.random2(5);
  for(let i = 1; i < genArr.length; i++){
    if(genArr[i - 1] === 0 || genArr[i - 1] === 1){
      genArr[i] = rng.random2(5) + 2;
    }else{
      genArr[i] = rng.random2(2);
    }
  }
  const genArrLast = genArr[genArr.length - 1];
  if(genArrLast === 3 || genArrLast === 4 || genArrLast === 6){
    genArr.push(rng.random2(2));
  }

  var name: string = genArr.map(val => translators[val](rng)).join("");

  name = name.replace(/([aiu])\1/g, (full, g1) => {
    return g1 + rng.pick("aeiou".replace(g1, ""));
  });

  name = name.replace(/([aeiou])[aeiou]/g, (full, g1) => {
    return rng.random2(5) > 2 ? g1 : full;
  });

  return name;
}

export function makeName(seed?: number){
  var rng: Rng;
  if(seed === undefined){
    rng = engine.worldGenRng;
  }else{
    rng = new Rng(seed);
  }

  return rng.coinflip() ? makeName1(seed) : makeName2(seed);
}
