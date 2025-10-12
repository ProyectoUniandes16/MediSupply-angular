// Jasmine configuration file, see link for more information
// https://jasmine.github.io/setup/nodejs.html

module.exports = {
  "frameworks": ["jasmine", "@angular-devkit/build-angular"],
  "plugins": [
    require("karma-jasmine"),
    require("karma-chrome-launcher"),
    require("karma-jasmine-html-reporter"),
    require("karma-coverage"),
    require("@angular-devkit/build-angular/plugins/karma")
  ],
  "client": {
    "jasmine": {},
    "clearContext": false
  },
  "jasmineHtmlReporter": {
    "suppressAll": true
  },
  "coverageReporter": {
    "dir": require("path").join(__dirname, "./coverage/medysupply-angular"),
    "subdir": ".",
    "reporters": [
      { "type": "html" },
      { "type": "text-summary" }
    ]
  },
  "reporters": ["progress", "kjhtml"],
  "browsers": ["Chrome"],
  "restartOnFileChange": true
};
