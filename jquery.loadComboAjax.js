/**
 *  Plugin para carregar comboboxes via ajax.
 *  @author: Igor Brites (@igorbrites)
 *  @license: MIT Licence
 */

;(function ($, window, undefined) {
	$.isChosen = function(obj) {
		return $(obj).next().hasClass('chosen-container');
	};

	var
        defaults = {
            url: '',
            args: {},
            selectedValue: false,
            comboLabel: 'Selecione',
            callback: false,
            cache: null
        },

        setFirstOption = function($obj, message) {
	        var isChosen = $.isChosen($obj[0]);
            $obj[0].options.length = 0;

            if (isChosen) {
	            $obj[0].options[0] = new Option('', '');
	            $obj.attr('data-placeholder', message).trigger("chosen:updated");
            } else {
                $obj[0].options[0] = new Option(message, '');
            }
        },

        doPopulate = function(json, parameters, $obj) {
            var opt = $obj[0].options,
                isChosen = $.isChosen($obj[0]),
                node,
                value,
                label,
                option,
                k;

            if (typeof (json) !== 'object') {
                setFirstOption($obj, 'Erro na resposta');
            } else if (json.error === true) {
                setFirstOption($obj, json.errorMessage);
            } else {
                setFirstOption($obj, parameters.comboLabel);

                for (k in json.options) {
                    node = json.options[k];
                    value = node.value;
                    label = node.label;
                    option = new Option(label, value);

                    for (var i in node) {
                        if(i !== 'value' && i !== 'label') {
                            option.setAttribute('data-' + i, node[i]);
                        }
                    }

                    opt[opt.length] = option;
                }

                if (parameters.selectedValue) {
                    $obj[0].value = parameters.selectedValue;
                } else if ($obj.data('value')) {
                    $obj[0].value = $obj.data('value');
                }

                isChosen && $obj.trigger("chosen:updated");

                typeof parameters.callback === 'function' && parameters.callback();
            }
        };

	$.populateCombo = function (obj, params) {
		params = $.extend({}, defaults, params);

        if (params.cache !== null) {
            if (params.cache.object.has(params.cache.key)) {
                doPopulate(params.cache.object.get(params.cache.key), params, $(obj));
                return true;
            }
        }

		var comboOptions = obj.options,
            $obj = $(obj),
			isChosen = $.isChosen($obj[0]);

		$.ajax({
			type: 'post',
			url: params.url,
			dataType: 'json',
			data: params.args,

			beforeSend: function () {
				comboOptions.length = 0;

				if (isChosen) {
					$obj.attr('data-placeholder', 'Carregando...').trigger("chosen:updated");
				} else {
					comboOptions[0] = new Option('Carregando...', '');
				}
			},

			/**
			 * @param {Object} json
			 * @example {
			 *      error: false,
			 *      errorMessage: '',
			 *      options: {
			 *          {label: 'Option 01', value: 1},
			 *          {label: 'Option 02', value: 2},
			 *          {label: 'Option 03', value: 3},
			 *          {label: 'Option 04', value: 4},
			 *          {label: 'Option 05', value: 5},
			 *          {label: 'Option 06', value: 6}
			 *      }
			 *  }
			 */
			success: function (json) {
                params.cache && params.cache.object.set(params.cache.key, json);
                doPopulate(json, params, $obj);
			},

			error: function (xhr, textStatus, errorThrown) {
				comboOptions.length = 0;

				if (isChosen) {
					$obj.attr('data-placeholder', 'Erro no servidor').trigger("chosen:updated");
				} else {
					comboOptions[0] = new Option('Erro no servidor', '');
				}
			}
		});

		return $obj;
	};

	$.fn.loadComboAjax = function (params) {
		return this.each(function () {
			$.populateCombo(this, params);
		});
	}
})(jQuery, window);
