( function () {
	'use strict';

	var smde = window.smde = new SimpleMDE();
	var _vm = window._vm = {
        parent: ko.observable(),
        name: ko.observable(),
        save: function(){
            console.log(data)
            var data = {
                parent: _vm.parent(),
                name: _vm.name(),
                body: smde.value()
            };
            $.ajax('/api/ddoc',{
                method: 'post',
                data: data,
                success: function(data){
                    console.log(data)
                },
                error: function(xhr){
                    console.log(data)
                }
            })
        }
    };

    ko.applyBindings(_vm)
} )();
