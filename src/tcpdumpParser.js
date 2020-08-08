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

const
    regExpArpRequest = wrapRegExp(`Request who-has ([0-9\.]+) tell ([0-9\.]+), .*`, ['requested', 'requestor'], {type: 'arp.request'}),
    regExpArpReply = wrapRegExp(`Reply ([0-9\.]+) is-at ([^ ]+) .*`, ['ip', 'address'], {type: 'arp.reply'}),
    regExpArpAnnounce = wrapRegExp(`Announcement ([0-9\.]+), (.*)`, ['ip'], {type: 'arp.announcement'});

function parseIp4(details) {
    "use strict";
    return {
        type : 'ip4',
        details
    };
}
function parseIp6(details) {
    "use strict";
    return {
        type : 'ip6',
        details
    };
}
function parseArp(details) {
    "use strict";
    return regExpArpRequest.match(details) || regExpArpReply.match(details) || regExpArpAnnounce.match(details);
}

const parsers = {
    'IP' : parseIp4,
    'IP6' : parseIp6,
    'ARP,' : parseArp
};

const nullParser = line => {};

exports.parse = line => {
    "use strict";
    const match = line.match(REGEXP_TOP_LEVEL);
    if (match) {
        const ts = match[1],
            protocol = match[2],
            other = match[3],
            parser = parsers[protocol] || nullParser;
        return parser(other);
    }
};