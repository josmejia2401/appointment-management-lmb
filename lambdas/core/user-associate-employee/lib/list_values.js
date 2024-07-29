const status = [
    {
        id: 1,
        name: 'ACTIVO'
    },
    {
        id: 2,
        name: 'INACTIVO'
    },
    {
        id: 3,
        name: 'PENDIENTE'
    },
    {
        id: 4,
        name: 'ELIMINADO'
    }
];


exports.status = status;

exports.findStatusById = function (id) {
    return status.filter(p => p.id === id)[0];
}
