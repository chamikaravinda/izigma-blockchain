const Record = require('../wallet/record');

class RecordPool{

    constructor(){
        this.records=[];
    }

    addRecord(record){
        this.records.push(record);
    }


    validRecords(){
        return this.records.filter(record=>{
            let isValidRecord =  true;

            if(!Record.verifyRecord(record)){
                console.log(`Invalid signature from ${record.features.createdBy}.`);
                isValidRecord =false;
            }
    
            if(isValidRecord)
                return record;
        });
    }

    clear(){
        this.records = [];
    }
}

module.exports = RecordPool;