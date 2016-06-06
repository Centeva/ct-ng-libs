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
				children: [
				{ $ref: 2},
				{ $ref: 3}
				]
			}
		};
		referenceInterceptor.response({data:siblings});
		expect(siblings.anotherChild.children[0].$id).toBe(2);

		var simpleCircular = {
			$id: 1,
			value: 'Object 1',
			anotherChild: {
				child: {
					$ref: 1
				}
			}
		};

		referenceInterceptor.response({data:simpleCircular});
		expect(simpleCircular.anotherChild.child.$ref).toBe(1);

		var siblingCircular = {
			$id: 1,
			value: 'Object 1',
			children: [
				{ $id: 2, value: 'Object 2' },
				{ $id: 3, value: 'Object 3' }
			],
			anotherChild: {
				children: [
				{ $ref: 2 },
				{ $ref: 1 }
				]
			}
		};

		referenceInterceptor.response({data:siblingCircular});
		expect(siblingCircular.anotherChild.children[0].$id).toBe(2);
		expect(siblingCircular.anotherChild.children[1].$ref).toBe(1);
	});
});
