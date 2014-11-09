Expression = function(input, type, operator, argument) {
    type = type || "infix"
    if (type === "direct") {
        this.operator = operator;
        this.argument = argument;
        return;
    }
    if (type === "infix") {
        input = Expression.infixToRpn(input);
        type = "rpn";
    }
    if (type === "rpn") {
        input = Expression.rpnToArrayTree(input);
    }

    if (OPERATIONS[input[0]]) {
        this.operator = new Token(input[0], "operator");
        this.argument = _.map(input[1], function(element) {
            return new Expression(element, "array");
        });
    } else {
        this.operator = new Token(input, "argument");
        this.argument = null;
    }
};

/* Shunting yard algorithm */
Expression.infixToRpn = function(infix) {
    var output_queue = [];
    var stack = [];

    var token_list = Expression.getTokensFromInfix(infix);
    _.each(token_list, function(token) {
        type = Token.type(token);
        if (type === "number" || type === "variable" || type === "pattern") {
            output_queue.push(token);
        } else if (type === "function") {
            stack.push(token);
        } else if (token === ",") {
            while (_.last(stack) !== "(") {
                output_queue.push(stack.pop());
            }
        } else if (type === "operator") {
            while (Operations.shouldPop(token, _.last(stack))) {
                output_queue.push(stack.pop());
            }
            stack.push(token);
        } else if (token === "(") {
            stack.push(token);
        } else if (token === ")") {
            while (_.last(stack) !== "(") {
                output_queue.push(stack.pop());
            }
            stack.pop();
            if (_.last(stack) && Token.type(_.last(stack)) === "function") {
                output_queue.push(stack.pop());
            }
        }
    });
    while (stack.length > 0) {
        if (_.last(stack) === "(" || _.last(stack) === ")") {
            alert("Mismatched parentheses");
            return false;
        }
        output_queue.push(stack.pop());
    }

    return output_queue;
};

Expression.getTokensFromInfix = function(infix) {
    var token_list = [];
    infix = infix.trim();

    while (infix.length > 0) {
        var token = Token.getFirstFromString(infix);
        infix = infix.replace(token, "").trim();
        // A special case: unary negation uses the same symbol as subtraction
        // Should be unary negation if the preceeding token is an operator or
        // opening paren.  Deal with it by converting it to multiplication by
        // -1.
        if (token === "-") {
            var prev_token = _.last(token_list);
            if (!prev_token || prev_token === "(" || Token.type(prev_token) === "operator") {
                infix = "u(1)*" + infix;
            } else {
                token_list.push(token);
            }
        } else {
            token_list.push(token);
        }
    }
    return token_list;
};

Expression.rpnToArrayTree = function(rpn) {
    var stack = [];
    _.each(rpn, function(element) {
        var value;
        if (OPERATIONS[element]) {
            var args = []
            _.times(OPERATIONS[element]["arguments"], function() {
                args.unshift(stack.pop());
            });
            value = [element, args];
        } else {
            value = element;
        }
        stack.push(value);
    });
    return stack[0];
};

//input: (1) an array of arrays consisting of argument steps
//       (2) the parent operator
//       (3) the parent args
//output: a single array flattening things into a single sequence of steps.
Expression.sanitizeSubSteps = function(arg_steps, parent_op, parent_args) {
    var steps = [];
    var argument_leaves = _.clone(parent_args);
    var previous_expression = new Expression(null, "direct", parent_op, _.clone(argument_leaves));
    _.times(arg_steps.length, function(index) {
        var one_arg_steps = arg_steps[index];
        _.each(one_arg_steps, function(one_step) {
            argument_leaves[index] = one_step["new"];
            this_old = previous_expression;
            this_new = new Expression(null, "direct", parent_op, _.clone(argument_leaves));
            this_method = one_step["method"];
            steps.push({"old": this_old, "new": this_new, "method": this_method});
            previous_expression = this_new;
        });
    });
    return steps;
};

Expression.prototype = {
    //When converting an expression to infix, the prime concern is:
    //Do we need parentheses around the arguments?
    printInfix: function() {
        var raw_op = String(this.operator.value);
        if (this.isLeaf()) {
            return raw_op;
        } else if (!OPERATIONS[raw_op]["inline"]) {
            //This is straightforward: if it's a standard functional form
            //like sin, cos, exp, log, and generally f(x), print the function
            //and put the arg in parentheses.
            if (raw_op === "u") {
                //special case for unary negation
                if (Operations.shouldGroupUnaryArg(this.argument[0])){
                    return "-(" + this.argument[0].printInfix() + ")";
                } else {
                    return "-" + this.argument[0].printInfix();
                }
            } else {
                var arg_strings = _.map(this.argument, function(arg) {
                    return arg.printInfix();
                });
                return raw_op + "(" + arg_strings.join(",") + ")";
            }
        } else {
            //This gets grungy.  Gist: determine using precedence, associativity
            // and order rules whether to put parentheses around arguments.
            var beginning = this.argument[0].printInfix();
            var ending = this.argument[1].printInfix();

            //Determine if we need parens around the first argument.
            if (Operations.shouldGroupBeginning(raw_op, this.argument[0])) {
                    beginning = "(" + beginning + ")";
            }
            //Do the same for the second argument.
            if (Operations.shouldGroupEnding(raw_op, this.argument[1])) {
                ending = "(" + ending + ")";
            }
            return beginning + raw_op + ending;
        }
    },

    //issues compared to infix:
    //(1) Need to change operator characters (i.e. \cdot in place of *)
    //(2) Exponentiation needs to group its second argument in curly brackets
    //(3) Division needs a very different form: \frac{arg1}{arg2}
    //Decided to put the latex generating stuff in the operations.js file
    //Which actually worked out pretty well.
    printLatex: function() {
        if (this.isLeaf()) {
            return String(this.operator.value);
        }
        return OPERATIONS[this.operator.value]["latexifier"].apply(null, this.argument);
    },

    // This method will return a hash with keys "steps" and "answer".  Steps will
    // be empty unless a truthy value for log_steps is passed in.

    // The idea behind steps is to return a list of Expressions showing
    // intermediates.  For example:
    // (4*7+5*9)^(4+2)
    //  (28+5*9)^(4+2)
    //   (28+45)^(4+2)
    //        73^(4+2)
    //        73^6
    //      (answer)
    simplify: function(log_steps) {
        //Step 1: if it's a leaf, we can't do anything.  Base case.
        if (this.isLeaf()) {
            return {"steps": [], "answer": this};
        }

        //Step 2: Simplify all sub-expressions and concatenate intermediate steps
        simp_argument = _.map(this.argument, function(arg) { 
            return arg.simplify(log_steps);
        });
        new_argument = _.map(simp_argument, function(arg) { 
            return arg["answer"];
        });

        var steps = [];
        if (log_steps) {
            var arg_steps = _.map(simp_argument, function(arg) {
                return arg["steps"];
            });
            steps = Expression.sanitizeSubSteps(arg_steps, this.operator, this.argument);
        }

        //Step 3: Do numerical computation if we can.
        var all_numbers = _.every(new_argument, function(arg) {
            return arg.isNumber();
        });
        if (all_numbers) {
            var arg_nums = _.map(new_argument, function(arg) {
                return arg.operator.value;
            });
            var result = OPERATIONS[this.operator.value]["evaluator"].apply(null, arg_nums);
            if (result) {
                result = new Token(result, "direct");
                result = new Expression(null, "direct", result, null);
                if (log_steps) {
                    this_old = steps.length == 0 ? this : _.last(steps)["new"];
                    steps.push({"old": this_old, "new": result,
                                "method": "calculation"});
                }
                return {"steps": steps, "answer": result};
            }    
        }
        return {"steps": steps, "answer": this};
    },

    isNumber: function() {
        return (_.isNull(this.argument) && _.isNumber(this.operator.value));
    },

    isLeaf: function() {
        return (_.isNull(this.argument));
    },

    patternMatch: function(pattern, assigned) {
        assigned = _.clone(assigned) || {};
        if (pattern.isLeaf()) {
            var pattern_key = pattern.operator.patternIndex();
            if (!pattern_key) {
                return assigned;
            } else {
                if (assigned[pattern_key]) {
                    return _.isEqual(assigned[pattern_key],this) ? assigned : false;
                } else {
                    assigned[pattern_key] = this;
                    return assigned;
                }
            }
        } else if (!_.isEqual(this.operator, pattern.operator)) {
            return false;
        } else {
            var invalid_leaf = _.find(_.range(this.argument.length), function(i) {
                var pattern_key = pattern.argument[i].operator.patternIndex();
                if (!pattern_key) {
                    assigned = this.argument[i].patternMatch(pattern.argument[i], assigned);
                    if (!assigned && !_.isEqual(assigned, {})) {
                        return true; //An invalid leaf
                    }
                } else {
                    if (assigned[pattern_key]) {
                        if (!_.isEqual(assigned[pattern_key], this.argument[i])) {
                            return true; //An invalid leaf
                        }
                    } else {
                        assigned[pattern_key] = this.argument[i];
                    }
                }
            }, this);
            if (invalid_leaf || invalid_leaf === 0) {
                return false;
            }
            return assigned;
        }        
    },

    replaceLeaves: function(old_leaf, new_leaf) {
        if (new_leaf instanceof Token) {
            new_leaf = new Expression(null, "direct", new_leaf, null);
        }
        if (this.isLeaf()) {
            if (_.isEqual(this.operator, old_leaf)) {
                return new_leaf;
            } else {
                return this.clone();
            }
        } else {
            var result = this.clone();
            result.argument = _.map(this.argument, function(arg) {
                return arg.replaceLeaves(old_leaf, new_leaf);
            });
            return result;
        }
    },

    clone: function() {
        return new Expression(null, "direct", this.operator, this.argument);
    }
};
