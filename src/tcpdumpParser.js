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

const lineParsers = {};

exports.init = parsers => {
    "use strict";
    const ip4Address = `[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}`,
        ip4OrHost = `[0-9a-zA-Z][-0-9a-zA-Z\\.]*`,
        portOrService = `[-0-9a-zA-Z]+`,
        dnsService = 'domain',
        mdnsService = 'mdns';

    parsers.forEach(parser => {
        const type = parser.type;
        if (!(type in lineParsers)) {
            lineParsers[type] = [];
        }
        const regexText = eval("`" + parser.pattern + "`"), // I know, I know...
            propNames = parser.fields,
            baseObj = {type, subtype: parser.subtype};
        console.log(regexText)
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
            parsers = lineParsers[protocol] || [];
        return parsers.map(lineParser => lineParser.match(other)).filter(o => o)[0];
    }
};