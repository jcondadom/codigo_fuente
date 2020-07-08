import { HttpService, IRequest } from '../Http/Http';

const rp = require('request-promise');
const url = JSON.parse(process.env.mserv).apiP;

export default class PosService {
    
    constructor(
        private httpService: HttpService = new HttpService(),
        private request: IRequest = {},
    ) {}

    getToken() {
        const email = JSON.parse(process.env.posAccount).email;
        const password = JSON.parse(process.env.posAccount).password;
        return new Promise((resolve, reject) => {
            const options = {                
                json: true,
                uri: url+'/auth?email='+email+'&password='+password,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }                
            };
            return rp(options)
            .then( (response) => {                
                resolve(response);
            })
            .catch((err) => {
                console.log('Error getToken', err);
                reject(err);
            });

        })
    }

    getAvailable(token) {          
        return new Promise((resolve, reject) => {
            const options = {
                uri: url+'/disponible',
                method: 'GET',                
                headers: {                    
                    Authorization: token,
                },
                json: true,
            };
            return rp(options)
            .then( (response) => {
                resolve(response);
            })
            .catch((err) => {
                console.log('Error getAvailable', err);
                reject(err);
            });

        })
    }
    
    getAssignment(params) {         
        return new Promise((resolve, reject) => {            
            const options = {
                uri: url+'/asignacion',
                qs: {
                    "email": params.email,
                    "nu_documento": params.numberId,
                    "tipo_documento": params.typeNumber,                                  
                },                
                method: 'POST',                
                headers: {                    
                    Authorization: 'Bearer '+params.authorization,
                },
                json: true,
            };                        
            return rp(options)
            .then( (response) => {                
                resolve(response);
            })
            .catch((err) => {
                console.log('Error getAssignmen', err);
                reject(err);
            });

        })
    }
       

    async getCardStatus(numberRequest){
        let token = await this.getToken();
        this.request.microservice = 'apiP';
        this.request.method = 'POST';
        this.request.headers = { Authorization: `Bearer ${token['access_token']}` }
        this.request.resource = 'getStatus';
        this.request.subResource = `?nu_solicitud=${numberRequest}`;
        return this.httpService.httpRequest( this.request )
            .then(data => {                
                return (data.codigo === 1)? data.data : false;
            }).catch(err => {
                return false;
            });
    }

    async changeStatus(numberRequest, status){
        let token = await this.getToken();
        this.request.microservice = 'apiP';
        this.request.method = 'POST';
        this.request.headers = { Authorization: `Bearer ${token['access_token']}` }
        this.request.resource = 'changeStatus';
        this.request.subResource = `?nu_solicitud=${numberRequest}&estatus=${status}`;
        return this.httpService.httpRequest( this.request )
            .then(data => {
                return (data.codigo === 1)? data : false;
            }).catch(err => {
                return false;
            });
    }
    
    async getRequest(request: string) {
        let token = await this.getToken();
        this.request.microservice = 'apiP';
        this.request.method = 'POST';
        this.request.headers = { Authorization: `Bearer ${token['access_token']}` }
        this.request.resource = 'getRequest';
        this.request.subResource = `?nu_solicitud=${request}`;
        return this.httpService.httpRequest( this.request )
            .then(data => {
                return data.data;
            }).catch(err => {
                return false;
            });
    }

    async changeStatus(request: string, status: number) {
        let token = await this.getToken();
        this.request.microservice = 'apiP';
        this.request.method = 'POST';
        this.request.headers = { Authorization: `Bearer ${token['access_token']}` }
        this.request.resource = 'changeStatus';
        this.request.subResource = `?nu_solicitud=${request}&estatus=${status}`;
        return this.httpService.httpRequest( this.request )
            .then(data => {
                return data;
            }).catch(err => {
                return false;
            });
    }
 

}