       
    function readFile (url) {
		var xmlDoc = null;
        if (!httpRequest) {
            httpRequest = CreateHTTPRequestObject ();   // defined in ajax.js
        }
        if (httpRequest) {          
                // The requested file must be in the same domain that the page is served from.
             httpRequest.open ("GET", url, false);    // sync
            httpRequest.send ();
			if (httpRequest.readyState == 0 || httpRequest.readyState == 4) {
				if (IsRequestSuccessful (httpRequest)) {    // defined in ajax.js
					xmlDoc = ParseHTTPResponse (httpRequest);   // defined in ajax.js
				}
				else {
					alert ("Operation failed.");
				}
			}
				
        }
		return xmlDoc;
	}


		