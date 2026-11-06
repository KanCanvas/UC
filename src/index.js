import finalObject from "./finalObject.json" with { type: "json" };

// Один кусок текста -> один узел. Сначала вся строка, потом значение внутри неё.
function readPiece(text, rules) {
    const source = text.trim();

    for (const rule of rules) {
        if (rule.code && rule.groups && !Array.isArray(rule.groups)) {
            const pairs = Object.entries(rule.code);
            const found = pairs.find(([, syntax]) => syntax === source);
            const groups = {};
            for (const [key, syntax] of pairs) {
                groups[syntax] = rule.groups[key];
            }

            if (!found && rule.pattern) {
                const split = source.match(rule.pattern);
                if (!split) continue;

                return {
                    meaning: rule.meaning,
                    code: pairs.map(([, syntax]) => syntax),
                    groups,
                    head: split[1],
                    rest: readPiece(split[2], rules)
                };
            }

            if (!found) continue;

            return {
                meaning: rule.meaning,
                code: pairs.map(([, syntax]) => syntax),
                groups
            };
        }

        const parts = source.match(rule.pattern);
        if (!parts) continue;

        const node = { meaning: rule.meaning };

        if (rule.words) {
            node.words = rule.words
        }

        if (rule.maps) {
            node.maps = rule.maps
            node.pattern = rule.pattern
            node.patternCallback = rule.patternCallback
            node.input = source
            node.codeText = rule.code
            node.callbackText = rule.callback
            node.endText = rule.codeEnd
        }

        rule.groups.forEach((groupName, index) => {
            const piece = parts[index + 1];

            if (groupName === "name") {
                node.name = piece;
                return;
            }

            const child = readPiece(piece, rules);

            if (groupName === "body") {
                node.body = [child];
                return;
            }

            node[groupName] = child;
        });

        return node;
    }

    return { meaning: "text", text: source };
}

// Узел -> кусок JavaScript. Новый meaning добавляйте сюда.
function emit(node) {
    if (node.meaning === "text") {
        return node.text;
    }

    if (node.meaning === "name") {
        return node.name;
    }

    if (node.meaning === "call") {
        return `${node.name}()`;
    }

    if (node.meaning === "add") {
        return `${emit(node.left)} + ${emit(node.right)}`;
    }

    if (node.meaning === "const") {
        return `const ${node.name} = ${emit(node.value)};`;
    }

    if (node.meaning === "function") {
        const result = node.body.map((part) => emit(part)).join(", ");
        return `function ${node.name}() {\n  return ${result};\n}`;
    }

    let results = "";
    let name1 = "";
    let name2 = "";

    let JSCODE = "";
    if (node.meaning === "window") {
        if (node.rest) {
            return (node.groups[node.head] || "") + emit(node.rest);
        }

        const code = finalObject.source.map((line) => {
            let result = "";
            node.code.map((code) => {
                if (line === code) {
                    result = node.groups[code];
                }
                return;
            })
            results = line.match(node.pattern);
            name1 = results[1];
            name2 = results[2];
            node.code.map((code) => {
                if (code === name1) {
                    JSCODE = node.groups[code];
                }
            })
            return result;

        });
        return code.find((line) => line);
    }

    if (node.meaning === "map") {
        let code2 = node.input.match(node.pattern);
        let codes = code2[1];
        let codes2 = code2[2];
        let codes3 = code2[3];
        let callbackText = node.callbackText;
        let callbackJs = node.maps.code2;
        let callbackBody = "";

        if (node.patternCallback) {
            const shape = codes2.match(node.patternCallback);
            const expected = callbackText.match(node.patternCallback);
            if (shape) {
                callbackBody = shape[4];
                codes2 = shape[1] + shape[3] + shape[5];
                const bodyNode = readPiece(callbackBody.trim(), finalObject.language);
                const bodyJs = emit(bodyNode);

                callbackJs = shape[1] + shape[2] + shape[3] + bodyJs + shape[5];
            }
            if (expected) callbackText = expected[1] + expected[3] + expected[5];
        }

        [node.codeText, callbackText, node.endText].forEach((code) => {
            if (code === node.codeText && /^[%&] nap\{$/.test(codes)) {
                JSCODE = JSCODE + node.maps.code1
            }
            if (code === codes2) {
                JSCODE = JSCODE + callbackJs
            }
            if (code === codes3) {
                JSCODE = JSCODE + node.maps.code3
            }
        })
        return JSCODE;
    }

    return "";
}

const program = finalObject.source.map((line) => readPiece(line, finalObject.language));
const javascript = program.map((node) => emit(node)).join("\n");

console.log(JSON.stringify(program, null, 2));
console.log(javascript);
