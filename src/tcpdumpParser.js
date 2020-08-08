const HIGH_LEVEL_REGEXP = /([0-9.:]+) ([^ ]+) (.*)/;

const parsers = {
    'IP' : details => {
        return {
            type : 'ip',
            details
        };
    },
    'IP6' : details => {
        return {
            type : 'ip6',
            details
        };
    },
    'ARP' : details => {
        return {
            type : 'arp',
            details
        };
    }
};

const nullParser = line => {};

exports.parse = line => {
    "use strict";
    const match = line.match(HIGH_LEVEL_REGEXP);
    if (match) {
        const ts = match[1],
            protocol = match[2],
            other = match[3],
            parser = parsers[protocol] || nullParser;
        return parser(other);
    }
};