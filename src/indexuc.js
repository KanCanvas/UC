import UC, { semantics } from "./compilerUC.js";

const source = "@ total = 100 + 200*200 - 100/10";

const result = UC.match(source, "Program");

if (result.succeeded()) {
  const javascript = semantics(result).toJS();

  console.log(javascript);
} else {
  console.log(result.message);
}