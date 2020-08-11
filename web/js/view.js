const view = (() => {
    "use strict";
    const elArpList = document.getElementById('arpList'),
        elDnsList = document.getElementById('dnsList'),
        elTcpList = document.getElementById('tcpList'),
        elUdpList = document.getElementById('udpList');

    function addListItem(parent, txt, cssClass) {
        const li = document.createElement('li');
        if (cssClass) {
            li.classList.add(cssClass);
        }
        li.innerText = txt;
        parent.insertBefore(li, parent.firstChild);
        return li;
    }

    const typeFormatters = {
        'arp.request' : obj => `Request for ${obj.requested} from ${obj.requestor}`,
        'arp.reply' : obj => `Response: ${obj.address} is ${obj.ip}`
    };

    function format(obj) {
        const formatter = typeFormatters[obj.type];
        if (formatter) {
            return formatter(obj);
        }
        return JSON.stringify(obj);
    }

    function routeToElement(obj) {
        const type = obj.type;
        if (type.startsWith('arp.')) {
            return elArpList;
        } else if (type.startsWith('udp.dns.')) {
            return elDnsList;
        } else if (type.startsWith('udp')) {
            return elUdpList;
        } else if (type.startsWith('tcp')) {
            return elTcpList;
        } else {
            console.error('Nowhere to display:', obj)
        }
    }

    return {
        add(item) {
            const elList = routeToElement(item);
            addListItem(elList, format(item));
        }
    };
})();