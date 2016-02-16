///<reference path="../../../.grunt/grunt-contrib-jasmine/jasmine.js"/>
describe('Dictionary', function () {

	beforeEach(module('centeva-ng-libs.dictionary'));

	it('manage array/object storage, via add/remove.', inject(function (Dictionary) {

		var d1 = new Dictionary();

		//add
		d1.add('a', 'a');
		expect(d1._array.length).toEqual(1);

		//add another
		d1.add('b', 'b');
		expect(d1._array.length).toEqual(2);

		//find both.
		expect(d1.contains('a')).toBe(true);
		expect(d1.contains('b')).toBe(true);

		//remove
		d1.remove('a');
		
		//don't find
		expect(d1.contains('a')).toBe(false);
		expect(d1._array.length).toEqual(1);

	}));

	it('intializes with array correctly.', inject(function (Dictionary) {

		var d1 = new Dictionary([{key:'a'}, {key:'b'}], 'key');

		//add
		expect(d1._array.length).toEqual(2);

		//find both.
		expect(d1.contains('a')).toBe(true);
		expect(d1.contains('b')).toBe(true);

	}));
});
