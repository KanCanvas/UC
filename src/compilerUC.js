import * as ohm from "ohm-js";

const UC = ohm.grammar(String.raw`
  UC {
    Program = Declaration | DeclarationFunction

    Declaration = "@" Identifier "=" Expression

    Expression = Additive
              | MemberAccess
    
    Additive = Multiplicative (AddPart | MinusPart | DevisionPart)*
    AddPart = "+" Multiplicative 
    MinusPart = "-" Multiplicative
    DevisionPart = "/" Multiplicative
    Multiplicative = Number MultiplyPart*

    MultiplyPart = "*" Number      

    Number = digit+

    MemberAccess = "window.document.body.innerHTML"
    
    Identifier = letter (letter | digit)*

    DeclarationFunction = "&" Identifier "{" Arguments "}" "{" Body "}"

    Arguments = Identifier ("," Identifier)*
    
  }
`);

const semantics = UC.createSemantics().addOperation("toJS", {
  Program(item) {
    return item.children.map((item) => {
      return item.toJS();
    }).join("\n");
  },

  Declaration(_at, identifier, _eq, expression) {
    return `const ${identifier.sourceString} = ${expression.toJS()};`;
  },
  Expression(value) {
    return value.toJS();
  },

  Additive(first, rest) {
    let result = first.toJS();

    for (const item of rest.children) {
      result += item.toJS();
    }

    return result;
  },

  AddPart(_plus, number) {
    return " + " + number.toJS();
  },

  MinusPart(_minus, number) {
    return " - " + number.toJS();
  },

  DevisionPart(_devision, number) {
    return " / " + number.toJS();
  },

  Multiplicative(first, rest) {
    let result = first.toJS();
    for (const item of rest.children) {
      result += item.toJS();
    }
    return result;
  },

  MultiplyPart(_times, number) {
    return " * " + number.toJS();
  },

  Number(value) {
    return value.sourceString;
  },

  MemberAccess(value) {
    return value.sourceString;
  },

  Identifier(first, rest) {
    return first.sourceString + rest.sourceString;
  },

  DeclarationFunction(
    _ampersand,
    name,
    _open1,
    args,
    _close1,
    _open2,
    body,
    _close2
  ) {
    return `function ${name.sourceString}(${args.sourceString}){${body.toJS()}}`
  }
})

export { semantics };
export default UC;