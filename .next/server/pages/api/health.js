"use strict";
(() => {
var exports = {};
exports.id = 837;
exports.ids = [837];
exports.modules = {

/***/ 8622:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
// Health check endpoint for deployment monitoring
function handler(req, res) {
    if (req.method === "GET") {
        res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || "1.0.0"
        });
    } else {
        res.setHeader("Allow", [
            "GET"
        ]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(8622));
module.exports = __webpack_exports__;

})();