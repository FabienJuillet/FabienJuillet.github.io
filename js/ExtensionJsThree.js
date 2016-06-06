	
THREE.Matrix3.prototype.add = function (mat) {
    for (var i=0;i<9;i++)
	{
		this.elements[i]+=mat.elements[i];
	}
	return this;
}


THREE.Matrix4.prototype.CreateMatrix4FromTranslationAndRotation= function (X,Q)
{
	var e= Q.elements;
	
	this.set(	e[0],	e[3],	e[6], 	X.x,
				e[1],	e[4],	e[7], 	X.y,
				e[2],	e[5],	e[8], 	X.z,
				0,		0,		0,		1);
	return this;
}
	
//Exite deja: setFromMatrixPosition, mais permet d'avoir 
//une coherence avec getRotationFormMatrix4 qui n'existe pas
THREE.Vector3.prototype.getTranslationFromMatrix4= function (mat)
{
	var e= mat.elements;
	
	this.set( e[12],e[13],e[14]);
	
	return this;
}

THREE.Matrix3.prototype.getRotationFromMatrix4= function (mat)
{
	var e= mat.elements;
	
	this.set( 	e[0], 	e[4], 	e[8],
				e[1],	e[5], 	e[9],
				e[2],	e[6], 	e[10]);
	
	return this;
}


THREE.Matrix3.prototype.getInverseFromMatrix3= function (matrix)
{
	var me = matrix.elements;
	var te = this.elements;

	te[ 0 ] =   me[ 8 ] * me[ 4 ] - me[ 5 ] * me[ 7 ];
	te[ 1 ] = - me[ 8 ] * me[ 1 ] + me[ 2 ] * me[ 7 ];
	te[ 2 ] =   me[ 5 ] * me[ 1 ] - me[ 2 ] * me[ 4 ];
	te[ 3 ] = - me[ 8 ] * me[ 3 ] + me[ 5 ] * me[ 6 ];
	te[ 4 ] =   me[ 8 ] * me[ 0 ] - me[ 2 ] * me[ 6 ];
	te[ 5 ] = - me[ 5 ] * me[ 0 ] + me[ 2 ] * me[ 3 ];
	te[ 6 ] =   me[ 7 ] * me[ 3 ] - me[ 4 ] * me[ 6 ];
	te[ 7 ] = - me[ 7 ] * me[ 0 ] + me[ 1 ] * me[ 6 ];
	te[ 8 ] =   me[ 4 ] * me[ 0 ] - me[ 1 ] * me[ 3 ];

	var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

	// no inverse

	if ( det === 0 ) {

		var msg = "Matrix3.getInverse(): can't invert matrix, determinant is 0";
		throw new Error( msg );

		this.identity();

		return this;

	}

	this.multiplyScalar( 1.0 / det );

	return this;
}


// Utilise la library numeric.js pour la SVD
 THREE.Matrix3.prototype.normalize= function ()
{
	var e=this.elements;
	var SVD=numeric.svd([	[e[0],e[3],e[6]],
							[e[1],e[4],e[7]],
							[e[2],e[5],e[8]]]);
	var eSol=numeric.dot(SVD["U"],numeric.transpose(SVD["V"]));
	////Console.log(SVD["U"]);
	////Console.log(SVD["V"]);
	
	this.set(	eSol[0][0],eSol[0][1],eSol[0][2],
				eSol[1][0],eSol[1][1],eSol[1][2],
				eSol[2][0],eSol[2][1],eSol[2][2] );
	return this;
} 


function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min +1)) + min;
}

function blockEvent(event)
{
  event.stopPropagation();
}

for (var controllerName in dat.controllers) {
	if (dat.controllers.hasOwnProperty(controllerName) && controllerName.indexOf("Controller")!==-1) {
			console.log(controllerName);
			Object.defineProperty(dat.controllers[controllerName].prototype, "disabled", {
			get: function()
			{
			return this.domElement.hasAttribute("disabled");
			},
			set: function(value)
			{
			console.log("************** TEST ICI **************")
			if (value)
			{
			  this.domElement.setAttribute("disabled", "disabled");
			  this.domElement.addEventListener("click", blockEvent, true);
			  this.domElement.addEventListener("change", blockEvent, true);
			  this.domElement.addEventListener("mousedown", blockEvent, true);
			  this.domElement.addEventListener("mouseup", blockEvent, true);
			  this.domElement.addEventListener("mousemove", blockEvent, true);
			  this.domElement.addEventListener("keydown", blockEvent, true);
			  this.domElement.addEventListener("blur", blockEvent, true);			  
			  
			  
			  
			  
			  
			}
			else
			{
			  this.domElement.removeAttribute("disabled");
			  this.domElement.removeEventListener("click", blockEvent, true);
			}
			},
			enumerable: true
		});

	}
}


// Object.defineProperty(dat.controllers.Controller.prototype, "disabled2", {
  // get: function()
  // {
    // return this.domElement.hasAttribute("disabled");
  // },
  // set: function(value)
  // {
    // Console.log("!!!! ICI !!!!")
	// if (value)
    // {
      // this.domElement.setAttribute("disabled", "disabled");
      // this.domElement.addEventListener("click", blockEvent, true);
    // }
    // else
    // {
      // this.domElement.removeAttribute("disabled");
      // this.domElement.removeEventListener("click", blockEvent, true);
    // }
  // },
  // enumerable: true
// });