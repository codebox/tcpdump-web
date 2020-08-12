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

const
    ip4Address = `[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}`,
    ip4OrHost = `[0-9a-zA-Z][-0-9a-zA-Z\\.]*`,
    portOrService = `[-0-9a-zA-Z]+`,
    dnsService = 'domain',
    mdnsService = 'mdns',

    regExpArpRequest = wrapRegExp(`Request who-has (${ip4Address}) \(.*\) tell (${ip4Address}), .*`, ['requested', 'requestor'], {type: 'arp.request'}),
    regExpArpReply = wrapRegExp(`Reply (${ip4Address}) is-at ([^ ]+) .*`, ['ip', 'address'], {type: 'arp.reply'}),
    regExpArpAnnounce = wrapRegExp(`Announcement (${ip4Address}), (.*)`, ['ip'], {type: 'arp.announcement'}),
    regExpArpProbe = wrapRegExp(`Probe (${ip4Address}), (.*)`, ['ip'], {type: 'arp.probe'}),
    regExpDnsRequest = wrapRegExp(`(${ip4OrHost})\\.${portOrService} > (${ip4OrHost})\\.${dnsService}: .*`, ['srcHost', 'dnsHost'], {type: 'udp.dns.request'}),
    regExpDnsResponse = wrapRegExp(`(${ip4OrHost})\\.${dnsService} > (${ip4OrHost})\\.${portOrService}: .*`, ['dnsHost', 'srcHost'], {type: 'udp.dns.response'}),
    regExpIp4Mdns = wrapRegExp(`(${ip4OrHost})\\.${mdnsService} > (${ip4OrHost})\\.${mdnsService}: .*`, ['srcHost', 'dstHost'], {type: 'mdns'}),
    regExpUdp = wrapRegExp(`(${ip4OrHost})\\.(${portOrService}) > (${ip4OrHost})\\.(${portOrService}): UDP, .*`, ['srcHost', 'srcPort', 'dstHost', 'dstPort'], {type: 'udp'}),
    regExpTcp = wrapRegExp(`(${ip4OrHost})\\.(${portOrService}) > (${ip4OrHost})\\.(${portOrService}): Flags .*`, ['srcHost', 'srcPort', 'dstHost', 'dstPort'], {type: 'tcp'});

function parseIp4(details) {
    "use strict";
    return regExpDnsRequest.match(details) || regExpDnsResponse.match(details) || regExpUdp.match(details) || regExpTcp.match(details) || regExpIp4Mdns.match(details);
}
function parseIp6(details) {
    "use strict";
}
function parseArp(details) {
    "use strict";
    return regExpArpRequest.match(details) || regExpArpReply.match(details) || regExpArpAnnounce.match(details) || regExpArpProbe.match(details);
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