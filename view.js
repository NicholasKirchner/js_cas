ExpressionViews = {

    preview: function(infix) {
        $(".output").empty();
        expression = new Expression(infix);
        $(".output").append( "$$" + expression.printLatex() + "$$\n" );
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    },

    simplify: function(infix) {
        $(".output").empty();
        expression = new Expression(infix);
        simplified = expression.simplify("with log");
        var table_body = "<tr><td></td>"
        table_body += "<td>$$" + expression.printLatex() + "$$</td>";
        table_body += "<td>Initial expression</td></tr>";
        _.each(simplified["steps"], function(step) {
            table_body += "<tr><td>$$" + step["old"].printLatex() + "$$</td>";
            table_body += "<td>$$" + step["new"].printLatex() + "$$</td>";
            table_body += "<td>" + step["method"] + "</td></tr>";
        });

        $(".output").append("<table>" + table_body + "</table>");
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }

};

$( document ).ready(function() {
    $( "#preview" ).click(function(event) {
        event.preventDefault();
        var infix = $( '#expression' ).val();
        ExpressionViews.preview(infix);
    });

    $( "#simplify" ).click(function(event) {
        event.preventDefault();
        var infix = $( '#expression' ).val();
        ExpressionViews.simplify(infix);
    });
});
