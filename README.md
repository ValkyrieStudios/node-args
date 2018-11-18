## @valkyriestudios/node-args

[![npm](https://img.shields.io/npm/v/@valkyriestudios/node-args.svg)](https://www.npmjs.com/package/@valkyriestudios/node-args)
[![npm](https://img.shields.io/npm/dm/@valkyriestudios/node-args.svg)](https://www.npmjs.com/package/@valkyriestudios-node-args)

A lightweight node script that reads and parses the arguments passed to a cli command, both converting them to their respective primitives and
organizing them for easy access.

`npm install @valkyriestudios/node-args`

## Example Output

The following is a series of example outputs for specific scenarios, showing the conversion of raw arguments to their primitives.

```
node myscript.js --fruits=bananas,apples,oranges --price=.1,.2,.3

{
    __bin: '/usr/bin/node',
    __script: '.../myscript.js',
    flags: {
        fruits: ['bananas', 'apples', 'oranges'],
        prices: [0.1, 0.2, 0.3],
    },
    args: [],
}
```

```
node myscript.js --no-filter --search

{
    __bin: '/usr/bin/node',
    __script: '.../myscript.js',
    flags: {
        filter: false,
        search: true,
    },
    args: [],
}
```

```
node myscript.js --price=8e-2

{
    __bin: '/usr/bin/node',
    __script: '.../myscript.js',
    flags: {
        price: 0.08,
    },
    args: [],
}
```

```
node myscript.js --foo=5.0124 -bar=false --foobar="abcdefg" --test=a,1,b,2 "Hello World" this,is,5

{
    __bin: '/usr/bin/node',
    __script: '.../myscript.js',
    flags: {
        foo: 5.0124,
        bar: false,
        foobar: "abcdefg",
        test: ["a", 1, "b", 2],
    },
    args: [
        "Hello World",
        ["this", "is", 5],
    ],
}
```


## How does this work?

node-args uses [process.argv](https://nodejs.org/docs/latest/api/process.html#process_process_argv), a node-native array of command line arguments and
parses that array into an easy-to-use javascript object.


## Getting Started

Simply import the library and execute it as a function. It will automatically return the parsed process arguments.

```
import NodeArgs from '@valkyriestudios/node-args';

const arguments = NodeArgs();
```


## Configuration

Some aspects of the parsing can be controlled through a simple configuration object that you pass as a parameter to the node-args function.

An example of using this would be :

```
import NodeArgs from '@valkyriestudios/node-args';

const arguments = NodeArgs({
    delimiter: ';',
    c_numeric: false,
});
```

#### Options

- **c_array**<br> (default: true)
Configures whether or not a string should be converted to an array if possible

- **c_bool**<br> (default: true)
Configures whether or not a string should be converted to a boolean if possible

- **c_numeric**<br> (default: true)
Configures whether or not a string should be converted to a number if possible

- **delimiter**<br> (default: ',')
Sets the delimiter to be used to split a string into an array

- **bool_true_val**<br> (default: 'true')
Configures what string represents a boolean true. e.g : '--harmony=true' will be parsed to { harmony: true }, whereas when bool_true_val is configured
as '1', '--harmony=true' would be parsed to { harmony: 'true' }

- **bool_false_val**<br> (default: 'false')
Configures what string represents a boolean false. e.g : '--harmony=false' will be parsed to { harmony: false }, whereas when
bool_false_val is configured as '0', '--harmony=false' would be parsed to { harmony: 'false' }

## Author
- Peter Vermeulen : [Valkyrie Studios](www.valkyriestudios.be)


## Contributors
- Peter Vermeulen : [Valkyrie Studios](www.valkyriestudios.be)
