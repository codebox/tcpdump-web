const os = require('os');

const REGEXP_TOP_LEVEL = /([0-9.:]+) ([^ ]+) (.*)/;

function wrapRegExp(regexpText, propNames, base = {}) {
    const text = `^${regexpText}$`,
        regexp = new RegExp(text, 'i');

    return {
        match(text) {
            const match = text.match(regexp);
            if (match) {
                const result = {...base};
                propNames.forEach((name ,i) => {
                    result[name] = match[i+1];
                });
                return result;
            }
        }
    };
}

function buildUnparsedLineObject(protocol, other) {
    console.warn('Unparsed line', protocol, other);
    return {
        type: protocol,
        subtype: "?",
        raw: other
    };
}
let lineParsers = {};

exports.init = parserDetails => {
    "use strict";
    function doSubstitutions(pattern) {
        let patternWithSubstitutions = pattern;
        Object.keys(parserDetails.substitutions).forEach(substText => {
            patternWithSubstitutions = patternWithSubstitutions.split("${" + substText + "}").join(parserDetails.substitutions[substText]);
        });
        return patternWithSubstitutions;
    }

    lineParsers = {};
    parserDetails.lineParsers.forEach(parser => {
        const type = parser.type;
        if (!(type in lineParsers)) {
            lineParsers[type] = [];
        }
        const regexText = doSubstitutions(parser.pattern),
            propNames = parser.fields,
            baseObj = {type, subtype: parser.subtype};
        lineParsers[type].push(wrapRegExp(regexText, propNames, baseObj));
    });
};

exports.parse = line => {
    "use strict";
    const match = line.match(REGEXP_TOP_LEVEL);
    if (match) {
        const ts = match[1],
            protocol = match[2],
            other = match[3],
            parsers = lineParsers[protocol] || [],
            parsedLine = parsers.map(lineParser => lineParser.match(other)).filter(o => o)[0];

        return parsedLine || buildUnparsedLineObject(protocol, other);
    }
    console.warn("Malformed line received: " + line);
};