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
    }
];


exports.status = status;

exports.findStatusById = function (id) {
    return status.filter(p => p.id === id)[0];
}



const documentTypes = [
    {
        id: 1,
        name: 'Cédula de ciudadanía'
    },
    {
        id: 2,
        name: 'Tarjeta de identidad'
    },
    {
        id: 3,
        name: 'Registro civil'
    },
    {
        id: 4,
        name: 'NIT'
    },
    {
        id: 5,
        name: 'Otro'
    }
];

exports.documentTypes = documentTypes;

exports.findDocumentTypeById = function (id) {
    return documentTypes.filter(p => p.id === Number(id))[0];
}




const genders = [
    {
        id: 1,
        name: 'Masculino'
    },
    {
        id: 2,
        name: 'Femenino'
    },
    {
        id: 3,
        name: 'LGTBI'
    },
    {
        id: 4,
        name: 'Otro'
    }
];
exports.genders = genders;

exports.findGenderById = function (id) {
    return genders.filter(p => p.id === Number(id))[0];
}