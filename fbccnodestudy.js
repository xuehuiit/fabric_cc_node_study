const shim = require('fabric-shim');
const util = require('util');


/**
 *
 * 定义Chaincode 执行类
 *
 * @type {Fabriccc}
 *
 */
var Fabriccc = class {

    /**

     系统初始化方法， 在部署chaincode的过程中当执行命令

     peer chaincode instantiate -o orderer.robertfabrictest.com:7050 -C
     roberttestchannel -n r_test_cc6 -v 1.0 -c '{"Args":["init","a","100","b","200"]}'
     -P "OR	('Org1MSP.member','Org2MSP.member')"

     的时候会调用该方法

     */
    async Init(stub) {

        console.log(` success init  node.js cc`)
        shim.success();

    }



    async Invoke(stub) {


        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];

        if (!method) {
            console.log('no method of name:' + ret.fcn + ' found');
            return shim.success();
        }


        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }


    }


    /**
     *
     * @param stu
     * @param args
     * @returns {Promise<void>}
     */
    async get( stub,args ){


        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3');
        }

        let parm_a = args[0];
        let parm_b = args[1];
        let parm_c = args[2];


        console.log(`========  curr method is get   ==========`);
        console.log(`parm is ${parm_a}   ${parm_b}  ${parm_c} `);

        //返回值是byte数组
        let result = await stub.getState(parm_a);
        if (!result) {
            throw new Error('Failed to get state of asset holder A');
        }


        return result;

    }


    /**
     *
     * @param stu
     * @param args
     * @returns {Promise<void>}
     */
    async set( stub,args ){


        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3');
        }

        let parm_a = args[0];
        let parm_b = args[1];
        let parm_c = args[2];


        console.log(`========  curr method is get   ==========`);
        console.log(`parm is ${parm_a}   ${parm_b}  ${parm_c} `);

        await stub.putState(parm_a, Buffer.from(parm_b));



    }

    /**
     *
     * @param stu
     * @param args
     * @returns {Promise<void>}
     */
    async delete( stub,args ){

        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3');
        }

        let parm_a = args[0];
        let parm_b = args[1];
        let parm_c = args[2];

    }





    async invoke(stub, args) {



        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3');
        }

        let A = args[0];
        let B = args[1];
        if (!A || !B) {
            throw new Error('asset holding must not be empty');
        }

        // Get the state from the ledger
        let Avalbytes = await stub.getState(A);
        if (!Avalbytes) {
            throw new Error('Failed to get state of asset holder A');
        }
        let Aval = parseInt(Avalbytes.toString());

        let Bvalbytes = await stub.getState(B);
        if (!Bvalbytes) {
            throw new Error('Failed to get state of asset holder B');
        }

        let Bval = parseInt(Bvalbytes.toString());
        // Perform the execution
        let amount = parseInt(args[2]);
        if (typeof amount !== 'number') {
            throw new Error('Expecting integer value for amount to be transaferred');
        }

        Aval = Aval - amount;
        Bval = Bval + amount;
        console.info(util.format('Aval = %d, Bval = %d\n', Aval, Bval));

        // Write the states back to the ledger
        await stub.putState(A, Buffer.from(Aval.toString()));
        await stub.putState(B, Buffer.from(Bval.toString()));

    }

    // Deletes an entity from state
    async delete(stub, args) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }

        let A = args[0];

        // Delete the key from the state in ledger
        await stub.deleteState(A);
    }

    // query callback representing the query of a chaincode
    async query(stub, args) {


        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the person to query')
        }

        let jsonResp = {};
        let A = args[0];

        // Get the state from the ledger
        let Avalbytes = await stub.getState(A);
        if (!Avalbytes) {
            jsonResp.error = 'Failed to get state for ' + A;
            throw new Error(JSON.stringify(jsonResp));
        }

        jsonResp.name = A;
        jsonResp.amount = Avalbytes.toString();
        console.info('Query Response:');
        console.info(jsonResp);
        return Avalbytes;
    }
};

shim.start(new Fabriccc());