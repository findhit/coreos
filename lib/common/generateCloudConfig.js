var YAML = require( 'yamljs' );

function generateFleetMetadata ( cos, node ) {
    return [
        'region=' + node.location,
    ].join(', ');
};

module.exports = function generateCloudConfig ( cos, node ) {
    return "#cloud-config" + "\n\n" + YAML.stringify({
        coreos: {
            etcd: {
                discovery: cos.discovery(),
                addr: '$private_ipv4:4001',
                'peer-addr': '$private_ipv4:7001'
            },
            fleet: {
                'public-ip': '$private_ipv4',
                metadata: generateFleetMetadata( cos, node ),
            },
            units: [
                {
                    name: 'etcd.service',
                    command: 'start',
                },
                {
                    name: 'fleet.service',
                    command: 'start',
                },
                {
                    name: 'flanneld.service',
                    command: 'start',
                }
            ],
        },
    });
};
