///<reference path="../../../.grunt/grunt-contrib-jasmine/jasmine.js"/>
describe('referenceInspector', function () {
	
	var $scope, referenceInterceptor;
	
	beforeEach(function () {
		module('centeva-ng-libs.referenceInterceptor');
		inject(function ($rootScope, _referenceInterceptor_) {
			$scope = $rootScope.$new();
			referenceInterceptor = _referenceInterceptor_;
		});
	});

	it('should parse data', function () {
		var siblings = {
			$id: 1,
			value: 'Object 1',
			children: [
				{ $id: 2, value: 'Object 2' },
				{ $id: 3, value: 'Object 3' }
			],
			anotherChild: {
				$id: 4,
				children: [
					{ $ref: 2},
					{ $ref: 3}
				]
			}
		};
		referenceInterceptor.response(siblings);
		expect(siblings.anotherChild.children[0].$id).toBe(2);

		var simpleCircular = {
			$id: 1,
			value: 'Object 1',
			anotherChild: {
				$id: 2,
				child: {
					$ref: 1
				}
			}
		};

		referenceInterceptor.response(simpleCircular);
		expect(simpleCircular.anotherChild.child.$id).toBe(1);
		expect(simpleCircular.anotherChild.child.anotherChild.child.$ref).toBe(1);

		var siblingCircular = {
			$id: 1,
			value: 'Object 1',
			children: [
				{ $id: 2, value: 'Object 2' },
				{ $id: 3, value: 'Object 3' }
			],
			anotherChild: {
				$id: 4,
				children: [
					{ $ref: 2 },
					{ $ref: 1 }
				]
			},
			lastChild: { $ref: 2 }
		};

		referenceInterceptor.response(siblingCircular);
		console.log(siblingCircular);

		expect(siblingCircular.children.length).toBe(2);
		expect(siblingCircular.children[0].$id).toBe(2);
		expect(siblingCircular.children[1].$id).toBe(3);

		expect(siblingCircular.lastChild.$id).toBe(2);

		expect(siblingCircular.anotherChild.children.length).toBe(2);
		expect(siblingCircular.anotherChild.children[0].$id).toBe(2);
		expect(siblingCircular.anotherChild.children[1].$id).toBe(1);
		expect(siblingCircular.anotherChild.children[1].lastChild.$id).toBe(2);// Ensure that the copy gets all elements copied
	});
});