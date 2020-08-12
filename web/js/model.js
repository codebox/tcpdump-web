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

    function doExpiry(obj) {
        Object.keys(obj).forEach(key => {
            obj[key].count--;
            if (obj[key].count <= 0) {
                delete obj[key];
            }
        });
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
        },
        getTcp(){
            return Object.values(tcp).sort((o1,o2) => o1.count - o2.count);
        },
        getUdp(){
            return Object.values(udp).sort((o1,o2) => o1.count - o2.count);
        },
        expire() {
            doExpiry(tcp);
            doExpiry(udp);
        }
    };
})();