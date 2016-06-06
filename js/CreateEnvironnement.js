function drawGround(grass)
{
if (ground)
	{
		if (grass){
			var groundTexture = THREE.ImageUtils.loadTexture( "textures/grasslight-big.jpg" );
			groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
			groundTexture.repeat.set( 25, 25 );
			groundTexture.anisotropy = 16;
						
			var groundMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );

			var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ), groundMaterial );
			mesh.rotation.x = - Math.PI / 2;
			mesh.name="ground";
			scene.add( mesh );
		} else {

			var solidGround = new THREE.Mesh(
				new THREE.PlaneGeometry( 200, 200 ),
				new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x000000, shininess: 30, shading: THREE.FlatShading, refractionRatio: 0.0,
					// polygonOffset moves the plane back from the eye a bit, so that the lines on top of
					// the grid do not have z-fighting with the grid:
					// Factor == 1 moves it back relative to the slope (more on-edge means move back farther)
					// Units == 4 is a fixed amount to move back, and 4 is usually a good value
					polygonOffset: true, polygonOffsetFactor: 1.0, polygonOffsetUnits: 4.0
			}));
				
			var material = new THREE.LineBasicMaterial({
				color: 0x040404
			});

			var geometry = new THREE.Geometry();
				for (i = 0; i < 201; i++) {
						geometry.vertices.push(	new THREE.Vector3( -100, 0, -100+i ));
						geometry.vertices.push(	new THREE.Vector3( +100, 0, -100+i ));
						geometry.vertices.push(	new THREE.Vector3( -100+i, 0, -100 ));
						geometry.vertices.push(	new THREE.Vector3( -100+i, 0, 100 ));
					}

			var line = new THREE.Line( geometry, material, THREE.LinePieces );
			line.rotation.x = Math.PI / 2;
			solidGround.add( line );	

			solidGround.rotation.x = -Math.PI / 2;
			solidGround.receiveShadow = true;
			solidGround.name="ground";
			scene.add( solidGround );

		}
	
	// MATERIALS
	
	var geometry = new THREE.SphereGeometry( 0.05, 32, 32 );
	var materialSphere = new THREE.MeshLambertMaterial( {color: 0xffaa00} );
	var sphere = new THREE.Mesh( geometry, materialSphere );
	scene.add( sphere );
	

	var ringMaterial_1 = new THREE.MeshLambertMaterial( { color: 0xdddddd, side: THREE.SingleSide, opacity: 0.1, transparent: true } );
	var ringMaterial_2 = new THREE.MeshLambertMaterial( { color: 0xdddddd, side: THREE.SingleSide, opacity: 0.2, transparent: true } );
	
	for (i = 0; i < 20; i++) {
	var ringGeometry = new THREE.RingGeometry( 4.9+i*5, 5.1+i*5, 64 );
	var ringMesh = new THREE.Mesh( ringGeometry, (i%2)?ringMaterial_2:ringMaterial_1 );
	ringMesh.rotation.x = - Math.PI / 2;
	ringMesh.position.y = 0.05;
	scene.add( ringMesh );	
	}
	
}
}

function CreateNewTrajectories(color){

	scene.trajectoryCenter = new Trace(60000,0xffff00);
	scene.trajectoryP1 = new Trace(60000,color);
	scene.trajectoryP2 = new Trace(60000,color);
	
	scene.add(scene.trajectoryCenter.line);	
	scene.add(scene.trajectoryP1.line);
	scene.add(scene.trajectoryP2.line);
	
	scene.trajectoryCenter.line.frustumCulled=false;
	scene.trajectoryP1.line.frustumCulled=false;
	scene.trajectoryP2.line.frustumCulled=false;
}

function UpdateCurrentTrajectories(boomerang){

	if (boomerang==undefined) {boomerang=scene.getObjectByName("boomerang");}

	scene.trajectoryCenter.addPoint(new THREE.Vector3(boomerang.matrix.elements[12],boomerang.matrix.elements[13],boomerang.matrix.elements[14]));

	var matrixP=boomerang.getObjectByName(1).matrix;
	var PositionP=new THREE.Vector4(matrixP.elements[12],matrixP.elements[13],matrixP.elements[14],matrixP.elements[15])
	PositionP.applyMatrix4(boomerang.matrix);
	scene.trajectoryP1.addPoint(new THREE.Vector3(PositionP.x,PositionP.y,PositionP.z));
	
	matrixP=boomerang.getObjectByName(boomerang.NumberOfElements).matrix;
	PositionP=new THREE.Vector4(matrixP.elements[12],matrixP.elements[13],matrixP.elements[14],matrixP.elements[15])
	PositionP.applyMatrix4(boomerang.matrix);
	scene.trajectoryP2.addPoint(new THREE.Vector3(PositionP.x,PositionP.y,PositionP.z));
}

var Trace = function(npoints, color) {
	this.npoints = (npoints !== undefined) ? npoints : 1000;
	color = (color !== undefined) ? color : 0xff0000;
	
	this.geom = new THREE.Geometry();
	this.mat = new THREE.LineBasicMaterial( {color: color});

	// pre allocate vertices
	for (var i = 0; i < this.npoints ; i++ ) {
		this.geom.vertices.push( new THREE.Vector3(0,0,0) );
	}
	this.idx = 0;

	this.line = new THREE.Line(this.geom, this.mat, THREE.LinePieces);

	this.lastPoint = null;
	this.name="trajectory";
}

Trace.prototype = {

	addPoint: function(p) {

		if (this.lastPoint === null) this.lastPoint = p;

		if (this.idx >= this.npoints - 1 ) this.idx = 0;

		// Using LinePieces, each pair of vertices creates a line,
		// so we need to connect to last vertex. 
		this.geom.vertices[this.idx].copy(this.lastPoint);
		this.geom.vertices[this.idx+1].copy(p);

		this.lastPoint = this.geom.vertices[this.idx+1];

		this.geom.verticesNeedUpdate = true;

		this.idx += 2 ;
	},

	unlinkLine: function() {

		// this causes the next point to not be linked to the previous one 
		// (useful for very large jumps where we don't want a straight line connecting them)
		this.lastPoint = null;
	},

	clear: function() {
		for (var i = 0; i < this.npoints ; i++ ) {
			this.geom.vertices[i].set(0,0,0);
		}
		this.geom.verticesNeedUpdate = true;
		this.idx = 0;

		this.unlinkLine();

	}
};

