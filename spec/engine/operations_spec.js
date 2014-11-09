describe("Operations", function() {
    describe(".shouldPop", function() {
        it("should return false if not given two arguments", function() {
            expect(Operations.shouldPop("+")).toBe(false);
        });

        it("should return false if 2nd argument not an operator", function() {
            expect(Operations.shouldPop("+","5")).toBe(false);
        });

        it("should be true if first op has lesser precedence", function() {
            expect(Operations.shouldPop("+", "*")).toBe(true);
        });

        it("should be true when equal precedences, and first op evaluates left-to-right", function() {
            expect(Operations.shouldPop("+", "+")).toBe(true);
        });

        it("should be false when equal precedences and first op evaluates right-to-left", function() {
            expect(Operations.shouldPop("^", "^")).toBe(false);
        });

        it("should be false when second op has lesser precedence", function() {
            expect(Operations.shouldPop("*", "+")).toBe(false);
        });
    });

    describe(".shouldGroupBeginning", function() {
        it("should not if the beginning is just an operand", function() {
            var parent_op = "+";
            var first_arg = new Expression("5");
            expect(Operations.shouldGroupBeginning(parent_op, first_arg)).toBe(false);
        });

        it("should if the parent op has higher precedence", function() {
            var parent_op = "*";
            var first_arg = new Expression("5+7");
            expect(Operations.shouldGroupBeginning(parent_op, first_arg)).toBe(true);
        });

        it("should if precedence is equal, and parent is non-associative and evaluates right-to-left", function() {
            var parent_op = "^";
            var first_arg = new Expression("2^4");
            expect(Operations.shouldGroupBeginning(parent_op, first_arg)).toBe(true);
        });

        it("should not if precedence is equal and parent evaluates left-to-right", function() {
            var parent_op = "+";
            var first_arg = new Expression("5+x");
            expect(Operations.shouldGroupBeginning(parent_op, first_arg)).toBe(false);
        });

        it("should if we're exponentiating a function", function() {
            var parent_op = "^";
            var first_arg = new Expression("D(x,x)");
            expect(Operations.shouldGroupBeginning(parent_op, first_arg)).toBe(true);
        });

        it("should not if parent precedence is lesser", function() {
            var parent_op = "*";
            var first_arg = new Expression("5^3");
            expect(Operations.shouldGroupBeginning(parent_op, first_arg)).toBe(false);
        });
    });

    describe(".shouldGroupEnding", function() {
        it("should not if the beginning is just an operand", function() {
            var parent_op = "+";
            var first_arg = new Expression("5");
            expect(Operations.shouldGroupEnding(parent_op, first_arg)).toBe(false);
        });

        it("should if the parent op has higher precedence", function() {
            var parent_op = "*";
            var first_arg = new Expression("5+7");
            expect(Operations.shouldGroupEnding(parent_op, first_arg)).toBe(true);
        });

        it("should if precedence is equal, and parent is non-associative and evaluates left-to-right", function() {
            var parent_op = "-";
            var first_arg = new Expression("2-4");
            expect(Operations.shouldGroupEnding(parent_op, first_arg)).toBe(true);
        });

        it("should not if precedence is equal and parent evaluates right-to-left", function() {
            var parent_op = "^";
            var first_arg = new Expression("5^x");
            expect(Operations.shouldGroupEnding(parent_op, first_arg)).toBe(false);
        });

        it("should not if parent precedence is lesser", function() {
            var parent_op = "*";
            var first_arg = new Expression("5^3");
            expect(Operations.shouldGroupEnding(parent_op, first_arg)).toBe(false);
        });

    });

    describe(".shouldGroupUnaryArg", function() {
        it("needs more specs");
    });
});
