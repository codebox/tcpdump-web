const model = (() => {
    "use strict";
    const tcp = {}, udp = {};

    function makeHostPortPairKey(srcHost, srcPort, dstHost, dstPort) {
        const srcHostPort = `${srcHost}_${srcPort}`,
            dstHostPort = `${dstHost}_${dstPort}`;

        return srcHostPort < dstHostPort ?
            `${srcHostPort}_${dstHostPort}` :
            `${dstHostPort}_${srcHostPort}`;
    }

    return {
        tcp(srcHost, srcPort, dstHost, dstPort) {
            const key = makeHostPortPairKey(srcHost, srcPort, dstHost, dstPort);
            if (!(key in tcp)) {
                tcp[key] = {srcHost, srcPort, dstHost, dstPort, count:0};
            }
            tcp[key].count++;
        },
        udp(srcHost, srcPort, dstHost, dstPort) {
            const key = makeHostPortPairKey(srcHost, srcPort, dstHost, dstPort);
            if (!(key in udp)) {
                udp[key] = {srcHost, srcPort, dstHost, dstPort, count:0};
            }
            udp[key].count++;
        }
    };
})();