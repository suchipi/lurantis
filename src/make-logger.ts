import kleur from "kleur";

export const makeLogger =
  (tag: string) =>
  (...messages: Array<string>) => {
    console.log(kleur.dim(new Date().toISOString()), tag, ...messages);
  };
