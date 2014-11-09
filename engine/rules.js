// List of all simplification rules used by this program, grouped by parent
// operator.

RULES = {
    "+": [ new Pattern("@1+0", "@1", "additive identity"),
           new Pattern("0+@1", "@1", "additive identity")
         ],
    "-": [ new Pattern("@1-0", "@1", "additive identity"),
           new Pattern("0-@1", "-(@1)", "additive inverse"),
           new Pattern("@1-@1", "0", "additive inverse")
         ],
    "*": [ new Pattern("@1*0", "0", "multiplication by zero"),
           new Pattern("0*@1", "0", "multiplication by zero"),
           new Pattern("1*@1", "@1", "multiplicative identity"),
           new Pattern("@1*1", "@1", "multiplicative identity")
         ],
    "/": [ new Pattern("0/@1", "0", "multiplication by zero"),
           new Pattern("@1/@1", "1", "multiplicative inverse"),
           new Pattern("@1/1", "@1", "multiplicative identity")
         ],
    "^": [ new Pattern("@1^0", "1", "zero-exponent"),
           new Pattern("@1^1", "@1", "one-exponent"),
           new Pattern("1^@1", "1", "power of one")
         ],
    "sin": [],
    "cos": [],
    "u": [],
    "log": [],
    "D": [ new Pattern("D(@1,@1)", "1", "derivative of identity"),
           new Pattern("D(-@1, @2)", "-(D(@1,@2))", "linearity of derivative"),
           new Pattern("D(@1 + @2, @3)", "D(@1,@3) + D(@2,@3)", "derivative of sum"),
           new Pattern("D(@1 - @2, @3)", "D(@1,@3) - D(@2,@3)", "derivative of difference"),
           new Pattern("D(@1 * @2, @3)", "@1 * D(@2,@3) + @2 * D(@1,@3)", "derivative of product"),
           new Pattern("D(@1 / @2, @3)", "D(@1 * @2^(-1), @3)", "reciprocal"),
           new Pattern("D(@1 ^ @2, @3)",
                       "@1^@2 * (D(@1,@3) * @2 / @1 + D(@2,@3) * log(@1))",
                       "derivative of exponent"),
           new Pattern("D(@1, @2)", "0", "derivative of constant",
                            { "@1": { "function": "type",
                                      "result": "number" } } )
         ]
}
