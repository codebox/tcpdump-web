const parser = require('../src/tcpdumpParser'),
    config = require('../src/config.json');

describe("tcpdumpParser", function() {
    "use strict";
    const TS_1 = '19:51:10.918898',
        IP_1 = '192.168.1.1',
        IP_2 = '192.168.1.2',
        HOST_1 = 'google.com',
        HOST_2 = 'lhr25s13-in-f14.1e100.net',
        PORT_1 = '12345',
        SERVICE_1 = 'https';

    function expectLine(line) {
        return {
            toBe(expectedObj) {
                const result = parser.parse(line);
                delete result._;
                expect(result).toEqual(expectedObj);
            }
        }
    }

    beforeAll(() => {
        parser.init(config.parser);
    });

    it("parses UDP correctly", function() {
        expectLine(`${TS_1} IP ${IP_1}.${PORT_1} > ${IP_2}.${SERVICE_1}: UDP, length 173`).toBe({
            type: 'IP',
            subtype: 'udp',
            srcHost: IP_1,
            srcPort: PORT_1,
            dstHost: IP_2,
            dstPort: SERVICE_1
        });
    });
    it("parses ARP correctly", function() {
        expectLine(`${TS_1} ARP, Request who-has ${IP_1} tell ${IP_2}, length 28`).toBe({
            type: 'ARP',
            subtype: 'arp.request',
            requested: IP_1,
            requestor: IP_2
        });
    });

});