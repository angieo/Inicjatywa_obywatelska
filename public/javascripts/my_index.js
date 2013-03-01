function dateFromPesel(pesel)
{
	return pesel.substring(0,6).match(/.{2}/g);
}

function century(month)
{
	switch(Math.floor(month/20))
	{
		case 0: return 1900;
		case 1: return 2000;
		case 2: return 2100;
		case 3: return 2200;
		case 4: return 1800;
	}
}

function centuryDate(date)
{
	date = dateFromPesel(date);
	var year = parseInt(date[0], 10) + century(parseInt(date[1], 10)), month = (parseInt(date[1], 10)%20)-1, day = parseInt(date[2], 10);
	var dob = new Date(year, month, day);
	return dob;
}

function calculateAge(value)
{
	var dob = centuryDate(value), now = new Date();
	var age = now.getFullYear() - dob.getFullYear();
	var mon = now.getMonth() - dob.getMonth();
	if(mon < 0 || (mon === 0 && now.getDate() < dob.getDate()))
		age--;
	return age;
}

function validateit(element, validator) 
{
	var cinput = element, cname = element.attr("name"), cval = element.val();
	var errname = cname + "Info", pos = element.parent().offset(), ctop = 0, cleft = pos.left + 60;

	if(document.getElementById(errname))
		$("#" + errname).remove();
	cinput.parents("dl").append("<ul id='" + errname + "' class ='info' style='top: " + ctop + "px; left: " + cleft + "px;'></div>");
	
	var result = validator.validateAllRules(cinput);
	showErrors(result, errname, element);
	
}

function showErrors(result, errname, element)
{
	if(! $.isEmptyObject(result))
	{
		$.each(result, function(key, val) 
		{
			$("#" + errname).append("<li class='" + errorOrWarning[key] + "'>" + val + "</li>");
		});
		if($("#" + errname + " li").hasClass("error"))
			element.removeClass("valid-input").removeClass("warning-input").addClass("error-input");
		else
			element.removeClass("error-input").removeClass("valid-input").addClass("warning-input");
	}
	else
		element.removeClass("error-input").removeClass("warning-input").addClass("valid-input");
}

function split(val) 
{
	return val.split( / \s*/ );
}

function extractLast(term) 
{
	return split(term).pop();
}

function fillInputLatLng(addr, input)
{
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({address: addr}, function(results, status)
	{
		if(status == google.maps.GeocoderStatus.OK)
		{
			var lat = results[0].geometry.location.lat(),
				lng = results[0].geometry.location.lng();
			input.val(lat + "," + lng);
		}
		else
		{
			alert("There were problems with retrieving your location parameters from Google Maps. Please check your address or try later.");
		}
	});
}

function confirmDialog(infoDiv, form)
{
	infoDiv.dialog(
	{
		resizable: false,
		height: 130,
		width: 430,
		modal: true,
		buttons: 
		{
			Confirm: 
			{
				text: "Ok",
				id: "ok",
				tabIndex: -1,
				click: function() 
				{
					form.submit();
					$(this).dialog("close");
				}
			},
			Cancel: 
			{
				text: "Anuluj",
				id: "cancel",
				tabIndex: 1,
				click: function() 
				{
					$(this).dialog("close");
				}
			}
		}
	});
}

// Class' names to colorize li elements
var errorOrWarning = 
{
	required : "error",
	maxlength : "error",
	minlength : "error",
	digits : "error",
	adult : "error",
	dateexists : "warning",
	dateinfuture : "warning",
	checksum : "warning",
	remote : "warning",
	overage : "warning"
}

$(document).ready(function() 
{
	var cache = {};
	$("#firstname").autocomplete(
	{
		source: function(request, response) 
		{
			var term = request.term;
			if(term in cache) 
			{
				response(cache[term]);
				return;
			}
			$.getJSON("/nameJson/",{term: extractLast(request.term)}, response);
		},
		search: function() 
		{
			var term = extractLast(this.value);
			if (term.length < 1) 
			{
				return false;
			}
		},
		focus: function() 
		{
			// Prevent value inserted on focus
			return false;
		},
		change: function() 
		{
			$(this).trigger("change");
		},
		select: function(event, ui) 
		{
			var terms = split(this.value);
			terms.pop();
			terms.push(ui.item.value);
			terms.push("");
			$(this).val(terms.join(" "));
			return false;
		},
		open: function(e, ui) 
		{
			$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
		},
		close: function() 
		{
			$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
		}
	});
	
	// Address' autocomplete settings 
	var autocomplete = new google.maps.places.Autocomplete(document.getElementById("address"), {componentRestrictions: {country: 'pl'}});
	google.maps.event.addListener(autocomplete, 'place_changed', function() 
	{
		$("#latlng").val(autocomplete.getPlace().geometry.location.lat() + "," + autocomplete.getPlace().geometry.location.lng());
    });

	// Additional methods for validation plugin
	$.validator.addMethod("adult", function(value, element) 
	{
		var legalAge = 18, age = calculateAge(value);
		return (age - legalAge >= 0);
	}, "You must be of legal age");

	$.validator.addMethod("dateexists", function(value, element) 
	{
		var dob = centuryDate(value), dfp = dateFromPesel(value);
		return dob && (dob.getMonth() + 1) == parseInt(dfp[1], 10)%20 && dob.getDate() == parseInt(dfp[2], 10);
	}, "Date in PESEL number doesn't exist");

	$.validator.addMethod("dateinfuture", function(value, element) 
	{
		var dob = centuryDate(value), now = new Date();
		return (now - dob >= 0);
	}, "Date in PESEL number is placed in future");

	$.validator.addMethod("checksum", function(value, element) 
	{
		var sum = 0, pesel = value.split("");
		var factors = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1];
		$.each(pesel, function(key, val){
			sum = sum + (val*factors[key]);
		});
		
		return sum % 10 == 0;
	}, "Checksum for PESEL number is not valid. Possible mistake in PESEL number");

	$.validator.addMethod("overage", function(value, element) 
	{
		var ovage = 120, age = calculateAge(value);
		return (age - ovage < 0);
	}, "Date in PESEL number is placed in future");

	// Method called instead of default validation function, to show all errors and warnings, not only first
	$.validator.prototype.validateAllRules = function(element) 
	{
		element = $(element)[0];
		var rules = $(element).rules();
		var messages = {};
		var messageList = 
		{
			firstname: 
			{
				required: "Nie podano imienia"
			},
			lastname: 
			{
				required: "Nie podano nazwiska"
			},
			address: 
			{
				required: "Nie podano adresu"
			},
			pesel: 
			{
				required: "Nie podano numeru PESEL",
				digits: "PESEL powinien składać się wyłącznie z cyfr",
				minlength: "PESEL powinien posiadać dokładnie 11 cyfr",
				maxlength: "PESEL powinien posiadać dokładnie 11 cyfr",
				adult: "Musisz mieć ukończone 18 lat",
				dateexists: "Data urodzenia z numeru PESEL nie istnieje",
				dateinfuture: "Data urodzenia z numeru PESEL znajduje się w przyszłości",
				checksum: "Suma kontrolna numeru PESEL jest niepoprawna. Prawdopodobny błąd w numerze PESEL",
				remote: "Podane imię sugeruje płeć inną, niż zakodowana w PESEL",
				overage: "Wiek wynikający z PESEL przekracza 120 lat. Proszę sprawdzić ten numer albo przyjąć gratulacje!"
			}
		};
		for (var method in rules) 
		{
			var rule = {method: method, parameters: rules[method]};
			try 
			{
				var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );
				if(!result)
					messages[rule.method] = messageList[element.id][method];
			} 
			catch(e) 
			{
				console.log(e);
			}
		}
		return messages;
	}
	
	// Validation settings
	var validator = $("form#isupportit").validate(
	{
		rules: 
		{
			firstname: 
			{
				required: true
			},
			lastname: 
			{
				required: true
			},
			address: 
			{
				required: true
			},
			pesel: 
			{
				required: true,
				remote: 
				{
					url: "/nameGenderJson/",
					type: "get",
					data: 
					{
						firstname: function() 
						{
							return $("#firstname").val().split(" ")[0];
						}
					},
					complete: function(data) 
					{
						if(data.responseText == "false")
							$("#pesel").trigger("change");
					}
				},
				minlength: 11,
				maxlength: 11,
				digits: true,
				adult: true,
				dateexists: true,
				dateinfuture: true,
				checksum: true,
				overage: true
			}
		},
		showErrors: function(errorMap, errorList) 
		{
			// Do nothing, prevent showing errors by default function
		},
		submitHandler: function(form) 
		{
			if($("#latlng").val() == "")
				fillInputLatLng($("#address").val(), $("#latlng"));
			
			if($("ul.info li").hasClass("warning"))
			{
				confirmDialog($("#confirmsave"), form);
			}
			else
				form.submit();
		},
		ignore: ".warning-input"
	});

	
	// Inputs' behavior
	$("input#firstname").focus();
	$("button#cancel").focus();
	$("input#pesel").numeric();
	$("input#save").attr("disabled", "disabled");
	
	$("#isupportit li input").on("change",function() 
	{
		validateit($(this), validator);
		
		if($(this).attr("id") == "firstname" && $("#pesel").val() != "")
			$("#pesel").trigger("change");
		
		
		// Enable save button when form is valid
		if ($("#isupportit").valid())
			$("#save").removeAttr("disabled");
		else
			$("#save").attr("disabled", "disabled");
	});
});