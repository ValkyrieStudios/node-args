'use strict';

//  Parse configuration on top of the defaults and return the final configuration object
const parseConfiguration = (config) => {
    let { c_array, c_numeric, c_bool, delimiter, bool_true, bool_false } = config;

    return {
        c_array         : config.hasOwnProperty('c_array') ? (!!c_array) : true,
        c_numeric       : config.hasOwnProperty('c_numeric') ? (!!c_numeric) : true,
        c_bool          : config.hasOwnProperty('c_bool') ? (!!c_bool) : true,
        delimiter       : delimiter || ',',
        bool : {
            true_val    : bool_true || 'true',
            false_val   : bool_false || 'false',
        },
    };
};

//  Parse the arguments array into a rich object
const parseArguments = (raw_args) => {
    //  [0] : Execution path of the node binary
    const __bin = raw_args.shift();

    //  [1] : Script path of the script that is being executed
    const __script = raw_args.shift();

    //  [1+] : Any arguments passed to the script are passed through a foreach that
    //  categorizes them into either a flag (kv) or an argument (primitive).
    const flags     = {};
    const args      = [];

    raw_args.forEach((raw) => {
        let is_flag = false;

        //  Check if it is a KV pair
        if (raw.substr(0, 2) === '--') {
            is_flag = 2;    // two-char kv, e.g : --amount=3 => (amount: 3)
        } else if (raw.substr(0, 1) === '-') {
            is_flag = 1;    // one-char kv, e.g : -a => (a: true), -b=1 => (b: 1)
        }

        //  Argument
        if (is_flag === false) {
            args.push(raw);
        } else {
            //  Parse kv pair
            const [key, val] = raw.substr(is_flag).split('=');

            if (key.substr(0, 3) === 'no-') {
                //  A key that looks like '--no-harmony' should be translated to (harmony: false)
                flags[key.substr(3)] = false;
            } else {
                //  No value passed means true, e.g : -a => (a: true)
                flags[key] = val || true;
            }
        }
    });

    return { __bin, __script, flags, args };
};

//  Parse the value and potentially convert it into a number, string, bool, array, ...
const serialize = (val, config) => {
    //  If value is already a boolean, this means that it was a switch (--shouldenable ==> true, --no-enable ==> false)
    if (val === true || val === false) return val;

    //  If no value is passed, return undefined
    if (!val && val !== false) return undefined;

    //  Convert to a number if numeric is true and the value is a number
    if (config.c_numeric && !isNaN(val)) {
        return Number(val);
    }

    //  Check if this is a boolean true
    if (config.c_bool && val === config.bool.true_val) {
        return true;
    }

    //  Check if this is a boolean false
    if (config.c_bool && val === config.bool.false_val) {
        return false;
    }

    //  If array conversion is turned off, return the string primitive
    if (!config.c_array) return val;

    //  Check if this is an array, if length is bigger than 1 return as array, otherwise return as string
    val = val.split(config.delimiter);

    //  If length is one, return primitive ( since it wasn't an array to begin with )
    if (val.length === 1) {
        return val[0];
    }

    //  Since this is an array, run each value in the array through the serialization
    return val.map((subval) => serialize(subval, config));
};

export default function NodeArgs (config = false) {
    const result        = parseArguments(process.argv);
    const configuration = parseConfiguration(config || {});

    //  Run each flag and arg through a serialization function that applies the configuration to convert
    //  values to their js representation.
    result.args = result.args.map((val) => {
        return serialize(val, configuration);
    });

    Object.keys(result.flags).forEach((key) => {
        result.flags[key] = serialize(result.flags[key], configuration);
    });

    return result;
}
