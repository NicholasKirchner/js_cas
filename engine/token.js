Token = function(input, cast) {
    if (cast === "operator" || cast === "direct" || input[0].match(/[@A-Za-z]/)) {
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
    } else if (token_string[0] === "@") {
        return "pattern";
    } else if (token_string[0].match(/[\d|\.]/)) {
        return "number";
    } else if (_.contains([",", "(", ")", "="], token_string[0])) {
        return token_string[0];
    } else {
        throw "unrecognized token: " + token_string + "; can't determine type";
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
        return infix.match(/\w+/)[0];
    }
    // If starts with a number or decimal point, much off until we hit something else.
    if (result.match(/[\d|\.]/)) {
        return infix.match(/[\d|\.]+/)[0];
    }
    if (result === "@") {
        return infix.match(/@\d+/)[0];
    }
    throw "Invalid token starting at " + result;
    return;
};

Token.prototype = {
    isNumber: function() {
        return (_.isNumber(this.value));
    },

    patternIndex: function() {
        if (this.type() !== "pattern") {
            return null;
        }
        return this.value;
    },

    type: function() {
        if (this.isNumber()) {
            return "number";
        }
        return Token.type(this.value);
    }
}
