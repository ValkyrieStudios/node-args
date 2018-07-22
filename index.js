'use strict';

//  Parse configuration on top of the defaults and return the final configuration object

Object.defineProperty(exports, "__esModule", {
    value: !0
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = NodeArgs;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseConfiguration = function parseConfiguration(config) {
    var c_array = config.c_array,
        c_numeric = config.c_numeric,
        c_bool = config.c_bool,
        delimiter = config.delimiter,
        bool_true = config.bool_true,
        bool_false = config.bool_false;


    return {
        c_array: config.hasOwnProperty('c_array') ? !!c_array : !0,
        c_numeric: config.hasOwnProperty('c_numeric') ? !!c_numeric : !0,
        c_bool: config.hasOwnProperty('c_bool') ? !!c_bool : !0,
        delimiter: delimiter || ',',
        bool: {
            true_val: bool_true || 'true',
            false_val: bool_false || 'false'
        }
    };
};

//  Parse the arguments array into a rich object
var parseArguments = function parseArguments(raw_args) {
    //  [0] : Execution path of the node binary
    var __bin = raw_args.shift();

    //  [1] : Script path of the script that is being executed
    var __script = raw_args.shift();

    //  [1+] : Any arguments passed to the script are passed through a foreach that
    //  categorizes them into either a flag (kv) or an argument (primitive).
    var flags = {};
    var args = [];

    raw_args.forEach(function (raw) {
        var is_flag = !1;

        //  Check if it is a KV pair
        if (raw.substr(0, 2) === '--') {
            is_flag = 2; // two-char kv, e.g : --amount=3 => (amount: 3)
        } else if (raw.substr(0, 1) === '-') {
            is_flag = 1; // one-char kv, e.g : -a => (a: true), -b=1 => (b: 1)
        }

        //  Argument
        if (is_flag === !1) {
            args.push(raw);
        } else {
            //  Parse kv pair
            var _raw$substr$split = raw.substr(is_flag).split('='),
                _raw$substr$split2 = (0, _slicedToArray3.default)(_raw$substr$split, 2),
                key = _raw$substr$split2[0],
                val = _raw$substr$split2[1];

            if (key.substr(0, 3) === 'no-') {
                //  A key that looks like '--no-harmony' should be translated to (harmony: false)
                flags[key.substr(3)] = !1;
            } else {
                //  No value passed means true, e.g : -a => (a: true)
                flags[key] = val || !0;
            }
        }
    });

    return { __bin: __bin, __script: __script, flags: flags, args: args };
};

//  Parse the value and potentially convert it into a number, string, bool, array, ...
var serialize = function serialize(val, config) {
    //  If value is already a boolean, this means that it was a switch (--shouldenable ==> true, --no-enable ==> false)
    if (val === !0 || val === !1) return val;

    //  If no value is passed, return undefined
    if (!val && val !== !1) return undefined;

    //  Convert to a number if numeric is true and the value is a number
    if (config.c_numeric && !isNaN(val)) {
        return Number(val);
    }

    //  Check if this is a boolean true
    if (config.c_bool && val === config.bool.true_val) {
        return !0;
    }

    //  Check if this is a boolean false
    if (config.c_bool && val === config.bool.false_val) {
        return !1;
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
    return val.map(function (subval) {
        return serialize(subval, config);
    });
};

function NodeArgs() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;

    var result = parseArguments(process.argv);
    var configuration = parseConfiguration(config || {});

    //  Run each flag and arg through a serialization function that applies the configuration to convert
    //  values to their js representation.
    result.args = result.args.map(function (val) {
        return serialize(val, configuration);
    });

    (0, _keys2.default)(result.flags).forEach(function (key) {
        result.flags[key] = serialize(result.flags[key], configuration);
    });

    return result;
}