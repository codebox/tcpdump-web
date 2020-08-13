const view = (() => {
    "use strict";
    const elSidebar = document.getElementById('sidebar'),
        elCanvas = document.getElementById('canvas');

    return {
        update(connections) {
            model.getTcp().forEach(obj => {
                addListItem(elTcpList, format(obj));
            });
            model.getUdp().forEach(obj => {
                addListItem(elUdpList, format(obj));
            });
        }
    };
})();