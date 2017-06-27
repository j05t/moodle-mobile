var responseState = {
	UNKNOWN: "UNKNOWN",
	SUCCESS: "SUCCESS",
	ERROR: 	 "ERROR"
};

// https://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

var core = {
	session: null,
	init: function() {
		core.session = null;

		if(typeof(Storage) !== "undefined") {
			core.session = sessionStorage;
			return;
		}
		console.err("Couldn't init storage.");
	},
	
	getJSON: function(url, callback, element) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function() {
			var status = xhr.status;
			if (status == 200) {
				callback(responseState.SUCCESS, xhr.response, element);
			} else {
				callback(responseState.ERROR, null, element);
			}
		};
		xhr.send();
	},

		
	getJSONSynchronous: function(url, callback, element) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send();

		var status = xhr.status;
		if (status == 200) {
			callback(responseState.SUCCESS, xhr.response, element);
		} else {
			callback(responseState.ERROR, null, element);
		}
	},
	
	redirect: function(url) {
		window.location = url;
	},
	reload: function() {
		window.location.reload();
	},	
	getValue: function(id) {
		return document.getElementById(id).value.trim();
	},
	getText: function(id) {
		return document.getElementById(id).innerText.trim();
	},
	setText: function(id, text) {
		return document.getElementById(id).innerText = text;
	},
	getHtml: function(id) {
		return document.getElementById(id).innerHTML;
	},
	setHtml: function(id, html) {
		return document.getElementById(id).innerHTML = html;
	},
	addClass: function(id, classname) {
		document.getElementById(id).classList.add(classname);
	},
	removeClass: function(id, classname) {
		document.getElementById(id).classList.remove(classname);
	},
	show: function(id) {
		core.removeClass(id, 'hide');
	},
	hide: function(id) {
		core.addClass(id, 'hide');
	},
	
	orderBy: function (field, reverse, primer) {
		var key = primer ?
			function (x) {
				return primer(x[field])
			} :
			function (x) {
				return x[field]
			};

		reverse = !reverse ? 1 : -1;

		return function (a, b) {
			return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
		}
	},

	// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	getParameterByName: function(name, url) {
		if (!url) {
			url = window.location.href;
		}

		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},
	isEmpty: function(text) {
		return (!text || 0 === text.trim().length);
	}
};