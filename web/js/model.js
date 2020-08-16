const LOCAL = 'local',
    model = (() => {
    "use strict";
    const local = new Set(),
        hostConnectionCounts = {},
        connections = {},
        serviceNameRegex = /.*[a-z].*/i;

    function formatHostName(name) {
        return local.has(name) ? LOCAL : name;
    }

    function getConnectionType(srcPort, dstPort) {
        if (srcPort.match(serviceNameRegex)) {
            return srcPort;
        } else if (dstPort.match(serviceNameRegex)) {
            return dstPort;
        }
        return '?'
    }

    function addConnection(srcHost, dstHost, connectionType) {
        const [host1, host2] = [srcHost, dstHost].sort();
        if (!(host1 in connections)) {
            connections[host1] = {};
        }
        if (!(host2 in connections[host1])) {
            connections[host1][host2] = {};
        }
        if (!(connectionType in connections[host1][host2])) {
            connections[host1][host2][connectionType] = 0;
        }
        connections[host1][host2][connectionType]++;
    }

    function expireConnections() {
        Object.keys(connections).forEach(host1 => {
            Object.keys(connections[host1]).forEach(host2 => {
                Object.keys(connections[host1][host2]).forEach(connectionType => {
                    if (! --connections[host1][host2][connectionType]) {
                        delete connections[host1][host2][connectionType];
                        hostConnectionCounts[host1]--;
                        hostConnectionCounts[host2]--;
                        if (!Object.keys(connections[host1][host2]).length) {
                            delete connections[host1][host2];
                            if (!Object.keys(connections[host1]).length) {
                                delete connections[host1];
                            }
                        }
                    }
                });
            });
        });
    }

    function expireHosts() {
        Object.keys(hostConnectionCounts).forEach(host => {
            if (hostConnectionCounts[host] === 0) {
                delete hostConnectionCounts[host];
            } else if (hostConnectionCounts[host] < 0) {
                console.assert(`Connection count for ${host} is ${hostConnectionCounts[host]} but it should never be less than 0`)
            }
        });
    }

    function addHost(host) {
        if (!(host in hostConnectionCounts)) {
            hostConnectionCounts[host] = 0;
        }
        hostConnectionCounts[host]++;
    }

    return {
        setLocal(localAddresses) {
            localAddresses.forEach(addr => local.add(addr));
        },
        tcp(unformattedSrcHost, srcPort, unformattedDstHost, dstPort) {
            const srcHost = formatHostName(unformattedSrcHost),
                dstHost = formatHostName(unformattedDstHost),
                connectionType = getConnectionType(srcPort, dstPort);
            addHost(srcHost);
            addHost(dstHost);
            addConnection(srcHost, dstHost, connectionType);
        },
        udp(unformattedSrcHost, srcPort, unformattedDstHost, dstPort) {
            const srcHost = formatHostName(unformattedSrcHost),
                dstHost = formatHostName(unformattedDstHost),
                connectionType = getConnectionType(srcPort, dstPort);
            addHost(srcHost);
            addHost(dstHost);
            addConnection(srcHost, dstHost, connectionType);
        },
        getHosts(){
            return Array.from(Object.keys(hostConnectionCounts));
        },
        getConnections(){
            return {...connections};
        },
        expire() {
            expireConnections();
            expireHosts();
        }
    };
})();