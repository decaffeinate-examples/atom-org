const _ = require('underscore-plus');
const IndentOperators = require('./indent-operators');
const IncreaseOperators = require('./increase-operators');
const Put = require('./put-operator');
const InputOperators = require('./input');
const Replace = require('./replace-operator');
const Operators = require('./general-operators');

Operators.Put = Put;
Operators.Replace = Replace;
_.extend(Operators, IndentOperators);
_.extend(Operators, IncreaseOperators);
_.extend(Operators, InputOperators);
module.exports = Operators;
