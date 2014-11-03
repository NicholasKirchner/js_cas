Token = function(input, cast) {
    if (cast == "operator" || cast == "direct" || input[0].match(/[@A-Za-z]/)) {
        this.value = input;
    } else {
        this.value = Number(input);
    }
};

Token.type = function(token_string) {
    if (OPERATIONS[token_string]) {
        return OPERATIONS[token_string]["inline"] ? "operator": "function";
    } else if (token_string[0].match(/[A-Za-z]/)) {
        return "variable";
    } else if (token_string[0] == "@") {
        return "pattern";
    } else if (token_string[0].match(/[\d|\.]/)) {
        return "number";
    } else if (_.contains([",", "(", ")", "="], token_string[0])) {
        return token_string[0];
    } else {
        alert("Invalid token:" + token_string);
        return;
    }
};

Token.getFirstFromString = function(infix) {
    var result = infix[0];
    if (_.contains([",", "(", ")"], result) || OPERATIONS[result]) {
        return result;
    }
    // If starts with a letter, munch off until we hit a non-word character.
    if (result.match(/[A-Za-z]/)) {
        return infix.match(/\w/);
    }
    // If starts with a number or decimal point, much off until we hit something else.
    if (result.match(/[\d|\.]/)) {
        return infix.match(/[\d|\.]+/);
    }
    if (result == "@") {
        return infix.match(/@\d+/);
    }
    alert("Invalid token starting at" + result);
    return false;
};

Token.patternIndex = function(pattern) {
    if (!pattern) {
        return null;
    }
    var op = pattern.operator.value;
    return op[0] == "@" ? op : null;
}

Token.prototype = {
    isNumber: function() {
        return (_.isNull(this.argument) && _.isNumber(this.operator.value));
    }
}
