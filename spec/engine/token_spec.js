describe("Token", function() {

    describe(".type", function() {
        it("should return 'operator' for standard arithmetic chars", function() {
            expect(Token.type("+")).toBe("operator");
            expect(Token.type("-")).toBe("operator");
            expect(Token.type("*")).toBe("operator");
            expect(Token.type("/")).toBe("operator");
        });

        it("should return 'function' other mathematical operators", function() {
            expect(Token.type("D")).toBe("function");
        });

        it("should return 'variable' for arguments beginning with a letter", function() {
            expect(Token.type("a8enoe7")).toBe("variable");
        });

        it("should return 'pattern' for arguments beginning with an @", function() {
            expect(Token.type("@1")).toBe("pattern");
        });

        it("should return 'number' for arguments that are numbers", function() {
            expect(Token.type(".123")).toBe("number");
            expect(Token.type("123")).toBe("number");
            expect(Token.type("123.123")).toBe("number");
        });

        it("should return the first character when argument is comma, equals or parenthesis", function() {
            _.each([",", "(", ")", "="], function(arg) {
                expect(Token.type(arg)).toBe(arg);
            });
        });

        it("should raise an error under any other circumstances", function() {
            expect(function() { return Token.type("&"); }).toThrow();
        });

    });

    describe(".getFirstFromString", function() {
        it("should return first character if it's a comma or parenthesis", function() {
            _.each([",", "(", ")"], function(arg) {
                expect(Token.getFirstFromString(arg + "extra stuff")).toBe(arg);
            });
        });

        it("should return @ + adjacent digits when arg starts with @", function() {
            expect(Token.getFirstFromString("@123a")).toBe("@123");
        });

        it("should return all adjacent alphanums when arg starts with a letter", function() {
            expect(Token.getFirstFromString("a145iea+eoa")).toBe("a145iea");
        });

        it("should pluck out a number if arg starts with a numeral or decimal point", function() {
            expect(Token.getFirstFromString("145.25+xyz")).toBe("145.25");
            expect(Token.getFirstFromString(".124-1")).toBe(".124");
        });

        it("should raise an error under other circumstances", function() {
            expect(function() { return Token.getFirstFromString("&"); }).toThrow();
        });
    });

    describe("constructor", function() {
        it("should convert a string to a number, if possible", function() {
            var a = new Token("123.47");
            expect(a.value).toBe(123.47);
        });

        it("needs more specs");
    });

    describe("instance methods", function() {

        describe("#isNumber", function() {
            it("should accurately tell whether the Token is a number", function() {
                var number = new Token("12345.8");
                var not_a_number = new Token("@13");
                expect(number.isNumber()).toBe(true);
                expect(not_a_number.isNumber()).not.toBe(true);
            });
        });

        describe("#patternIndex", function() {
            it("should return the pattern if type is 'pattern'", function() {
                var a = new Token("@123");
                expect(a.patternIndex()).toBe("@123");
            });

            it("should return null if type is not 'pattern'", function() {
                var a = new Token("x");
                expect(a.patternIndex()).toBe(null);
            });
        });

        describe("#type", function() {
            it("should return number if Token is a number", function() {
                var a = new Token("123");
                expect(a.type()).toBe("number");
            });

            it("should call 'Token.type' if not a number", function() {
                spyOn(Token, 'type');
                var a = new Token("x");
                a.type();
                expect(Token.type).toHaveBeenCalled();
            });
        });

    });
});
