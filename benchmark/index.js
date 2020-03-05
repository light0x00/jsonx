var Benchmark = require('benchmark');
const { default: JSONX } = require("../");
var suite = new Benchmark.Suite;

let testBigStr = `
{
	"key0": -123,
	"key1": 123,
	"key2": 123.456,
	"key3": "abc",
	"key4": false,
	"key5": {
		"foo": "foooo",
		"bar": "barrr"
	},
	"key6": [
		"foo",
		"bar"
	],
	"key7":null
}
`

suite
	.add('JSONX#parse', function () {
		JSONX.parse(testBigStr)
	})
	.add('JSON#parse', function () {
		JSON.parse(testBigStr)
	})

	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run({ 'async': false });

let testObj = {
	"key0": -123,
	"key1": 123,
	"key2": 123.456,
	"key3": "abc",
	"key4": false,
	"key5": {
		"foo": "foooo",
		"bar": "barrr"
	},
	"key6": [
		"foo",
		"bar"
	],
	"key7": null
}

suite
	.add('JSONX#stringify', function () {
		JSONX.stringify(testObj)
	})
	.add('JSON#stringify', function () {
		JSON.stringify(testObj)
	})
	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run({ 'async': false });

