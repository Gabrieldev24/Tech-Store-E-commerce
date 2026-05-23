

export class UserEntity{

    constructor(

        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly password?: string, // Opcional por si no queremos exponer el hash en el Front
        public readonly role?: string
        

    ){}

    public static fromObject(obj:{[key:string]:any}):UserEntity{

        const {id,_id,name,email,password,role} = obj

        if (!name) throw new Error('Name is required');
        if (!email) throw new Error('Name is required');

        return new UserEntity(id || _id, name, email, password, role || 'CLIENT');
        


        
    }






}