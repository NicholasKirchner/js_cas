Pattern = function(before, after, description, restrictions) {
    this.restrictions = restrictions || {};
    this.description = description;
    this.before = before instanceof Expression ? before : new Expression(before);
    this.after = after instanceof Expression ? after : new Expression(after);
};

Pattern.prototype = {
    applyTo: function(expression) {
        var substitutions = expression.patternMatch(this.before) || {};
        if (_.size(substitutions) === 0) {
            return expression;
        }
        
        var invalid_pattern = _.find(_.pairs(this.restrictions), function(pair) {
            var pattern = pair[0];
            var restriction = pair[1];
            var args;
            if (restriction["args"]) {
                args = _.map(restriction["args"], function(arg) {
                    return substitutions[arg] || arg
                });
            } else {
                args = [];
            }
            var restriction_function = substitutions[pattern][restriction["function"]];
            if (restriction_function.apply(substitutions[pattern], args) != restriction["result"]) {
                //it's an invalid pattern
                return true;
            }
            return false; //valid pattern
        });
        if (invalid_pattern) {
            return expression;
        }

        //We got this far, meaning we've got a good substitution.
        //Now, construct and return.
        var result = this.after.clone();
        _.each(_.pairs(substitutions), function(pair) {
            var key = pair[0];
            var new_value = pair[1];
            var pattern = new Token(key);
            result = result.replaceLeaves(pattern, new_value);
        });
        return result;
    }
}
