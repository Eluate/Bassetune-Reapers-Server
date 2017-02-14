require("../../lib/mscorlib.js");
require("../../lib/dungen.js");

function CSharpUtil() {}

/* Convert matrix coming from CSharp to a JS Bidimensional Array */
CSharpUtil.csMatrixToJs = function(csMatrix) {
    // Se non e' una matrice CSharp allora e' un array normale
    if (!csMatrix.GetLength) return csMatrix;
    
    jsMatrix = [];
    for(row=0; row< csMatrix.GetLength(0); row++) {
        jsRow = [];
        for(col=0; col<csMatrix.GetLength(1); col++) {
            jsRow.push(csMatrix[row * csMatrix.$ranks[1] + col]);
        }
        jsMatrix.push(jsRow);
    }
    return jsMatrix;
}

module.exports = CSharpUtil;