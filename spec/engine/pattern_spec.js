describe("Pattern", function() {

    describe("constructor", function() {
        it("should take arguments as infix strings", function() {
            var a = "(sin(@1))^2 + (cos(@1))^2";
            var b = "1";
            var new_pattern = new Pattern(a,b,"pythagorean theorem");
            expect(_.isEqual(new_pattern.before, new Expression(a))).toBe(true);
            expect(_.isEqual(new_pattern.after, new Expression(b))).toBe(true);
        });

        it("should take arguments as Expressions", function() {
            var a = new Expression("(sin(@1))^2 + (cos(@1))^2");
            var b = new Expression("1");
            var new_pattern = new Pattern(a,b,"pythagorean theorem");
            expect(_.isEqual(new_pattern.before, a)).toBe(true);
            expect(_.isEqual(new_pattern.after, b)).toBe(true);
        });
    });

    describe("#applyTo", function() {
        it("should work without restrictions", function() {
            var before = new Expression("(sin(@1))^2 + (cos(@1))^2");
            var after = new Expression("1");
            var new_pattern = new Pattern(before,after,"pythagorean theorem");

            var test_case = new Expression("(sin(2*x+3))^2 + (cos(2*x+3))^2");
            var simplified = new_pattern.applyTo(test_case);
            expect(_.isEqual(simplified, after)).toBe(true);
        });

        it("should work with restrictions without args", function() {
            var before = new Expression("@1 * (@2 + @3)");
            var after = new Expression("@1 * @2 + @1 * @3");
            var restriction = { "@1": { "function": "isLeaf", "result": true }};
            var new_pattern = new Pattern(before,after,"factor", restriction);

            var yes_case = new Expression("x * (2 + 3)");
            var yes_simplified = new Expression("x * 2 + x * 3");
            var yes_result = new_pattern.applyTo(yes_case);

            expect(_.isEqual(yes_simplified, yes_result)).toBe(true);

            var no_case = new Expression("(x+1)*(2+3)");
            var no_result = new_pattern.applyTo(no_case);
            expect(_.isEqual(no_case, no_result)).toBe(true);
        });

        it("should work with restrictions with args", function() {
            pending();
        });
    });
});
