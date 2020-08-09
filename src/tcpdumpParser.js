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
    ipAddress = `[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}`,
    ipOrHost = `[0-9a-zA-Z][-0-9a-zA-Z\\.]*`,
    portOrService = `[0-9a-zA-Z]+`,
    dnsService = 'domain',
    mdnsService = 'mdns',

    regExpArpRequest = wrapRegExp(`Request who-has (${ipAddress}) tell (${ipAddress}), .*`, ['requested', 'requestor'], {type: 'arp.request'}),
    regExpArpReply = wrapRegExp(`Reply (${ipAddress}) is-at ([^ ]+) .*`, ['ip', 'address'], {type: 'arp.reply'}),
    regExpArpAnnounce = wrapRegExp(`Announcement (${ipAddress}), (.*)`, ['ip'], {type: 'arp.announcement'}),
    regExpDnsRequest = wrapRegExp(`(${ipOrHost})\\.${portOrService} > (${ipOrHost})\\.${dnsService}: .*`, ['srcHost', 'dnsHost'], {type: 'udp.dns.request'}),
    regExpDnsResponse = wrapRegExp(`(${ipOrHost})\\.${dnsService} > (${ipOrHost})\\.${portOrService}: .*`, ['dnsHost', 'srcHost'], {type: 'udp.dns.response'}),
    regExpMdns = wrapRegExp(`(${ipOrHost})\\.${mdnsService} > (${ipOrHost})\\.${mdnsService}: .*`, ['srcHost', 'dstHost'], {type: 'mdns'}),
    regExpUdp = wrapRegExp(`(${ipOrHost})\\.(${portOrService}) > (${ipOrHost})\\.(${portOrService}): UDP, .*`, ['srcHost', 'srcPort', 'dstHost', 'dstPort'], {type: 'udp'}),
    regExpTcp = wrapRegExp(`(${ipOrHost})\\.(${portOrService}) > (${ipOrHost})\\.(${portOrService}): Flags .*`, ['srcHost', 'srcPort', 'dstHost', 'dstPort'], {type: 'tcp'});

function parseIp4(details) {
    "use strict";
    return regExpDnsRequest.match(details) || regExpDnsResponse.match(details) || regExpUdp.match(details) || regExpTcp.match(details) || regExpMdns.match(details);
}
function parseIp6(details) {
    "use strict";
    return regExpMdns.match(details);
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