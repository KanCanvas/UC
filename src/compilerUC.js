import * as ohm from "ohm-js";

const UC = ohm.grammar(String.raw`
  UC {
    Program = Declaration | DeclarationFunction | Object | CallFunction | FunctionCallMap | CallBackFunction

    Declaration = "@" Identifier "=" Expression

    Expression = Additive
              | MemberAccess
              | Object
    
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

    Body = Program*

    CallFunction = "%" Identifier "{" Arguments "}"

    ObjectName = ObjectWindow
           | NormalObjectName
           | FunctionCallMap
           | CallFunction

    Object = ObjectName ("!" ObjectName)*

    NormalObjectName = letter (letter | digit)*

    ObjectWindow = 
             "win"
             | "doc"
             | "tit"
             | "hre"
             | "bod"
             | "pro"
             | "loc"
             | "ref"
             | "sta"
             | "hea"
             | "body"
             | "html"
             | "url"
    

    FunctionCallMap = "%" ("nap" | "fil" | "fla") "{" (DeclarationFunction | CallBackFunction) "}"    
    
    CallBackFunction = "&" "{" Arguments "}" "{" Body "}" 
  }
`);

const semantics = UC.createSemantics().addOperation("toJS", {
  Program(item) {
    return item.toJS();
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
  },

  Arguments(first, commas, identifiers) {
    return [
      first.sourceString,
      ...identifiers.children.map(item => item.sourceString)
    ].join(", ");
  },

  Body(items) {
    return items.children.map((item) => {
      return item.toJS();
    })
  },

  CallFunction(percent, identifier, _open, args, _close) {
    return `${identifier.sourceString}(${args.sourceString})`;
  },

  FunctionCallMap(percent, identifier, _open, callback, _close) {
    return `map(${callback.toJS()})`;
  },

  CallBackFunction(ampersand, _open, args, _close, _open2, body, _close2) {
    return `(${args.sourceString}) => {${body.toJS()}}`;
  },

  Object(first, separators, names) {
    let result = first.toJS();
  
    for (const item of names.children) {
      result += "." + item.toJS();
    }
  
    return result;
  },

  ObjectName(value) {
    return value.toJS();
},

ObjectWindow(value) {
    const names = {
        win: "window",
        doc: "document",
        tit: "title",
        hre: "href",
        bod: "body",
        pro: "protocol",
        loc: "location",
        ref: "referrer",
        sta: "status",
        hea: "head",
        body: "body",
        html: "html",
        url: "URL"
    };

    return names[value.sourceString];
},
  
  NormalObjectName(first, rest) {
    return first.sourceString + rest.sourceString;
},

})

export { semantics };
export default UC;