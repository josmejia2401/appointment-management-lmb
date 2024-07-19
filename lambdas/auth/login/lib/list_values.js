export const documentTypes = [
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

export function findDocumentTypeById(id) {
    return documentTypes.filter(p => p.id === id)[0];
}



export const status = [
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

export function findStatusById(id) {
    return status.filter(p => p.id === id)[0];
}


export const genders = [
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

export function findGenderById(id) {
    return status.filter(p => p.id === id)[0];
}