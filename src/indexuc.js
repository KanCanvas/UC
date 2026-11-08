import UC, { semantics } from "./compilerUC.js";

const source = "& hello { world } { world!hello }";

const result = UC.match(source, "Program");

if (result.succeeded()) {
  const javascript = semantics(result).toJS();

  console.log(javascript);
} else {
  console.log(result.message);
}