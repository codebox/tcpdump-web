const LOCAL = 'local',
    model = (() => {
    "use strict";
    const tcp = {}, udp = {}, local = new Set();

    function makeHostPairKey(srcHost, dstHost) {
        return srcHost < dstHost ?
            `${srcHost}_${dstHost}` :
            `${dstHost}_${srcHost}`;
    }

    function doExpiry(obj) {
        Object.keys(obj).forEach(key => {
            obj[key].count--;
            if (obj[key].count <= 0) {
                delete obj[key];
            }
        });
    }

    function formatHostName(name) {
        return local.has(name) ? LOCAL : name;
    }

    return {
        setLocal(localAddresses) {
            localAddresses.forEach(addr => local.add(addr));
        },
        tcp(_srcHost, srcPort, _dstHost, dstPort) {
            const srcHost = formatHostName(_srcHost),
                dstHost = formatHostName(_dstHost),
                key = makeHostPairKey(srcHost, srcPort, dstHost, dstPort);
            if (!(key in tcp)) {
                tcp[key] = {srcHost, dstHost, count:0, ports: new Set()};
            }
            tcp[key].count++;
            tcp[key].ports.add(srcPort);
            tcp[key].ports.add(dstPort);
        },
        udp(_srcHost, srcPort, _dstHost, dstPort) {
            const srcHost = formatHostName(_srcHost),
                dstHost = formatHostName(_dstHost),
                key = makeHostPairKey(srcHost, srcPort, dstHost, dstPort);

            if (!(key in udp)) {
                udp[key] = {srcHost, dstHost, count:0, ports: new Set()};
            }
            udp[key].count++;
            udp[key].ports.add(srcPort);
            udp[key].ports.add(dstPort);
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