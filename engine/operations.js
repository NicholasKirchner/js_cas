OPERATIONS = {
    "+": { "arguments": 2,
           "precedence": 1,
           "order": "left",
           "inline": true,
           "associative": true,
           "evaluator": function(a,b) { return a + b; },
           "latexifier": function(a,b) {
               var beginning = a.printLatex();
               var ending = b.printLatex();
               if (Operations.shouldGroupBeginning("+", a)) {
                   beginning = "\\left(" + beginning + "\\right)";
               }
               if (Operations.shouldGroupEnding("+", b)) {
                   ending = "\\left(" + ending + "\\right)";
               }
               return beginning + " + " + ending;
           }
         },
    "-": { "arguments": 2,
           "precedence": 1,
           "order": "left",
           "inline": true,
           "evaluator": function(a,b) { return a - b; },
           "latexifier": function(a,b) {
               var beginning = a.printLatex();
               var ending = b.printLatex();
               if (Operations.shouldGroupBeginning("-", a)) {
                   beginning = "\\left(" + beginning + "\\right)";
               }
               if (Operations.shouldGroupEnding("-", b)) {
                   ending = "\\left(" + ending + "\\right)";
               }
               return beginning + " - " + ending;
           }
         },
    "*": { "arguments": 2,
           "precedence": 2,
           "order": "left",
           "inline": true,
           "associative": true,
           "evaluator": function(a,b) { return a * b; },
           "latexifier": function(a,b) {
               var beginning = a.printLatex();
               var ending = b.printLatex();
               if (Operations.shouldGroupBeginning("*", a)) {
                   beginning = "\\left(" + beginning + "\\right)";
               }
               if (Operations.shouldGroupEnding("*", b)) {
                   ending = "\\left(" + ending + "\\right)";
               }
               return beginning + " \\cdot " + ending;
           }
         },
    "/": { "arguments": 2,
           "precedence": 2,
           "order": "left",
           "inline": true,
           "evaluator": function(a,b) { return a / b; },
           "latexifier": function(a,b) {
               var beginning = a.printLatex();
               var ending = b.printLatex();
               return "\\frac{" + beginning + "}{" + ending + "}";
           }
         },
    "^": { "arguments": 2,
           "precedence": 3,
           "order": "right",
           "inline": true,
           "evaluator": function(a,b) { return Math.exp(b*Math.log(a)); },
           "latexifier": function(a,b) {
               var beginning = a.printLatex();
               var ending = b.printLatex();
               if (Operations.shouldGroupBeginning("^", a)) {
                   beginning = "\\left(" + beginning + "\\right)";
               }
               return beginning + "^{" + ending + "}";
           }
         },
    "u": { "arguments": 1,
           "evaluator": function(a) { return -a; }
         },
    "D": { "arguments": 2,
           "latexifier": function(a,b) {
               var beginning = a.printLatex();
               var ending = b.printLatex();
               return "\\frac{d}{d" + ending + "}\\left(" + beginning + "\\right)";
           }
         },
    "sin": { "arguments": 1
           },
    "cos": { "arguments": 1
           }
           
};

Operations = {};
Operations.shouldPop = function(o1, o2) {
    if (!o2 || Token.type(o2) !== "operator") {
        return false;
    }
    var precedence1 = OPERATIONS[o1]["precedence"];
    var precedence2 = OPERATIONS[o2]["precedence"];
    if (precedence1 < precedence2) {
        return true;
    }
    if (OPERATIONS[o1]["order"] === "left" && precedence1 === precedence2) {
        return true;
    }
    return false;
};

Operations.shouldGroupBeginning = function(parent_op, first_arg) {
    if (first_arg.isLeaf()) {
        return false;
    }
    var child_op = String(first_arg.operator.value);

    var parent_precedence = OPERATIONS[parent_op]["precedence"];
    var child_precedence = OPERATIONS[child_op]["precedence"];
    var parent_order = OPERATIONS[parent_op]["order"];
    var parent_is_associative = OPERATIONS[parent_op]["associative"];
    //Easy to understand condition
    if (parent_precedence > child_precedence) {
        return true;
    }
    //This condition comes up in towered exponentiation: (4^3)^2
    if (parent_precedence === child_precedence && parent_order === "right" && !parent_is_associative) {
        return true;
    }
    //special case: creates (sin(x))^2 as opposed to sin(x)^2
    if (parent_op === "^" && !OPERATIONS[child_op]["inline"]){
        return true;
    }
    return false;
};

Operations.shouldGroupEnding = function(parent_op, last_arg) {
    if (last_arg.isLeaf()) {
        return false;
    }
    var child_op = String(last_arg.operator.value);

    var parent_precedence = OPERATIONS[parent_op]["precedence"];
    var child_precedence = OPERATIONS[child_op]["precedence"];
    var parent_order = OPERATIONS[parent_op]["order"];
    var parent_is_associative = OPERATIONS[parent_op]["associative"];
    //Easy to understand condition
    if (parent_precedence > child_precedence){
        return true;
    }
    //This condition comes up in the expression 4-(3-2)
    if (parent_precedence === child_precedence && parent_order === "left" && !parent_is_associative) {
        return true;
    }
    return false;
};

Operations.shouldGroupUnaryArg = function(child_arg) {
    var child_op = child_arg.operator.value;
    return (child_arg.isLeaf() || OPERATIONS[child_op]["precedence"] < 2);
};
