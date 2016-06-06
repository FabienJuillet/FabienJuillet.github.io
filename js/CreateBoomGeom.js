
function createBox(material,VecWidth,VecHeight,VecDepth,VecPos) {

	var geometry =new THREE.BoxGeometry(1,1,1);
	var Box = new THREE.Mesh( geometry, material );
	//Box.matrixAutoUpdate = false;

	var TransformMatrix = new THREE.Matrix4();
	TransformMatrix.set(	VecWidth.x,	VecHeight.x,VecDepth.x,	0,
				VecWidth.y,	VecHeight.y,VecDepth.y,	0,
				VecWidth.z,	VecHeight.z,VecDepth.z,	0,
				0,			0,			0,			1);

	//Box.matrix.multiply(TransformMatrix); <- On n'utilise pas ca pour garder l'utilisation de .position() possible..
	Box.geometry.applyMatrix(TransformMatrix);
	Box.geometry.verticesNeedUpdate = true;
	Box.position.copy(VecPos);

	return Box;
}

function CreateBoomerang(material, xmlDoc){
	
	var boomerang= new THREE.Object3D();

	var VecCorde= new THREE.Vector3(0.01,0,0);
	var VecEpaisseur= new THREE.Vector3(0,0.01,0);
	var VecLargeur= new THREE.Vector3(0,0,0.01);
	var VecPosition= new THREE.Vector3(0,0,0);
	var corde=0;
	var masse=0;
	var epaisseur=0.004;
	var largeur=0;
	var surface=0;

	boomerang.masse = parseFloat(xmlDoc.getElementsByTagName ("MasseTotale")[0].textContent);	
	boomerang.BoomerangName = xmlDoc.getElementsByTagName ("Name")[0].textContent;
	
	CreatePolar(boomerang,xmlDoc);
	
	var itemTags = xmlDoc.getElementsByTagName ("Element");
            for (i = 0; i < itemTags.length; i++) {
                    VecPosition.set(	parseFloat(itemTags[i].getElementsByTagName ("Center")[0].getElementsByTagName ("X")[0].textContent),
								parseFloat(itemTags[i].getElementsByTagName ("Center")[0].getElementsByTagName ("Y")[0].textContent),
								parseFloat(itemTags[i].getElementsByTagName ("Center")[0].getElementsByTagName ("Z")[0].textContent));
								
					corde= parseFloat(itemTags[i].getElementsByTagName ("Corde")[0].textContent);
					surface= parseFloat(itemTags[i].getElementsByTagName ("Surface")[0].textContent);
					masse= parseFloat(itemTags[i].getElementsByTagName ("Masse")[0].textContent);
					polarName= itemTags[i].getElementsByTagName ("PolarName")[0].textContent;
					largeur=surface/corde;
								
                    VecCorde.set(	parseFloat(itemTags[i].getElementsByTagName ("VecCenterBA")[0].getElementsByTagName ("X")[0].textContent),
									parseFloat(itemTags[i].getElementsByTagName ("VecCenterBA")[0].getElementsByTagName ("Y")[0].textContent),
									parseFloat(itemTags[i].getElementsByTagName ("VecCenterBA")[0].getElementsByTagName ("Z")[0].textContent));
					VecCorde.normalize;
																		
                    VecEpaisseur.set(	parseFloat(itemTags[i].getElementsByTagName ("VecSurface")[0].getElementsByTagName ("X")[0].textContent),
									parseFloat(itemTags[i].getElementsByTagName ("VecSurface")[0].getElementsByTagName ("Y")[0].textContent),
									parseFloat(itemTags[i].getElementsByTagName ("VecSurface")[0].getElementsByTagName ("Z")[0].textContent));
					VecEpaisseur.normalize;				
					
					VecLargeur.crossVectors(VecCorde,VecEpaisseur);
					
					VecCorde.multiplyScalar(corde);
					VecEpaisseur.multiplyScalar(epaisseur);
					VecLargeur.multiplyScalar(largeur);

					Element = new createBox(material,VecCorde,VecEpaisseur,VecLargeur,VecPosition);
					Element.masse= masse;
					Element.volume= surface*VecEpaisseur.length();
					Element.surface=surface;
					//if (i<22) 
					//{
					//	Element.VecCorde=VecCorde.clone().multiplyScalar(-1);
					//} else
					//{
					Element.VecCorde=VecCorde.clone();
					//}
					Element.VecEpaisseur=VecEpaisseur.clone();
					Element.VecLargeur=VecLargeur.clone();
					Element.centerOfMass = VecPosition.clone();
					
					////Console.log("Element.centerOfMass");
					////Console.log(Element.centerOfMass);
					////Console.log("Element.position");
					////Console.log(Element.position);
					Element.polarName=polarName;
					Element.Surface=surface;
								
					Element.name=i+1;
					boomerang.add(Element);
					
			}
	boomerang.NumberOfElements=i;		
	var centerOfMass=ComputeCenterOfMass(boomerang);
	////Console.log(centerOfMass);
	TranslateCenterOfMass(boomerang,centerOfMass.negate());
	
	//boomerang.centerOfMass=ComputeCenterOfMass(boomerang);
	////Console.log(boomerang.centerOfMass);
	if (boomerang.masse !== undefined){if (boomerang.masse!==0){RedefineElementMasse(boomerang)}};
	
	boomerang.InertieMat=ComputeInertieMatrix(boomerang);
	////Console.log(boomerang.InertieMat);
	
	boomerang.InvInertieMat= (new THREE.Matrix3()).getInverseFromMatrix3(boomerang.InertieMat);
	
	// Arrows to visualize the aerodynamic forces
	var materialArrow = new THREE.MeshLambertMaterial( { color: 0x0000ff, wireframe: false} );
	boomerang.traverse(function (child) {
		if (child instanceof THREE.Mesh) 
                                {
                                if ((child.position!==undefined)&&(child.VecCorde!==undefined))
									{
										var arrow= new createArrow(materialArrow, child.position.clone(), child.VecCorde.clone(), 0.002);
										child.arrow=arrow;
										SetArrowVisible(arrow,false);
										boomerang.add(arrow);
									}
								}
	});
	

	//Arrows to visualise the velocity and rotation speed
	{var arrow= new createArrow(new THREE.MeshLambertMaterial( { color: 0xff00ff, wireframe: false} ), new THREE.Vector3(0,0,0),new THREE.Vector3(1,0,0), 0.007);
	boomerang.VelocityArrow= arrow;
	//arrow.
	boomerang.add(arrow)}
	{var arrow= new createArrow(new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false} ), new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-0.5), 0.007);
	boomerang.RotationSpeedArrow= arrow;
	boomerang.add(arrow)}
	
	
	boomerang.matrixAutoUpdate = false;
	return boomerang
}


function RedefineElementMasse(boomerang){
	
	var MasseTot=boomerang.masse;
	var VolumeTot=0;
	boomerang.traverse(function (child) {
								if (child instanceof THREE.Mesh) 
                                {
                                if ((child.volume!==undefined))
									{
									VolumeTot += child.volume;							
									}
                                }
                            });
	////Console.log("Volume total")
	////Console.log(VolumeTot)
	////Console.log("Masse total")
	////Console.log(MasseTot)
	
	boomerang.traverse(function (child) {
								if (child instanceof THREE.Mesh) 
                                {
                                if ((child.masse!==undefined))
									{
									child.masse=MasseTot*child.volume/VolumeTot;
////Console.log(child.masse);									
									}
                                }
                            });							

}


function CreatePolar(boomerang,xmlDoc){
	boomerang.Polar=[];
	var itemTagsPolar=xmlDoc.getElementsByTagName ("Polar");
    for (p = 0; p < itemTagsPolar.length; p++)	
	{
		var name=itemTagsPolar[p].getElementsByTagName("Name")[0].textContent;
		var itemTagsAngle = itemTagsPolar[p].getElementsByTagName ("Angle");
		var itemTagsCl = itemTagsPolar[p].getElementsByTagName ("Cl");
		var itemTagsCd = itemTagsPolar[p].getElementsByTagName ("Cd");
		var polar=[];		
		for (i = 0; i < itemTagsAngle.length; i++)
		{
			polar[i]=[parseFloat(itemTagsAngle[i].textContent), parseFloat(itemTagsCl[i].textContent), parseFloat(itemTagsCd[i].textContent)];		
		}
		boomerang.Polar[name]=polar;
	}
}

function ComputeCenterOfMass(boomerang){
	var centerOfMass= new THREE.Vector3(0,0,0);
	var masseTot=0;
	boomerang.traverse(function (child) {
								if (child instanceof THREE.Mesh) 
                                {
                                if ((child.masse!=undefined)&&(child.centerOfMass!=undefined))
									{
									centerOfMass.add((child.centerOfMass.clone()).multiplyScalar(child.masse));
									////Console.log(child.centerOfMass);
									masseTot += child.masse;
									
									}
                                }
                            });
	centerOfMass.divideScalar(masseTot);
	////Console.log(i);
	////Console.log(centerOfMass);
	return centerOfMass
}

function TranslateCenterOfMass(boomerang,VecTranslation){

	boomerang.traverse(function (child) {
								if (child instanceof THREE.Mesh) 
                                {
								if ((child.masse!=undefined)&&(child.centerOfMass!=undefined))
									{
									child.position.add(VecTranslation);
									child.centerOfMass.add(VecTranslation);
									}
                                }
								if (child instanceof THREE.Object3D) 
                                {
								//q	child.position.add(VecTranslation);
                                }

                            });

}

function ComputeInertieMatrix(boomerang){
	var I= new THREE.Matrix3();
	I.set(0,0,0,0,0,0,0,0,0);
	
	var centerOfMass=ComputeCenterOfMass(boomerang);
	////Console.log("centerOfMass");
	////Console.log(centerOfMass);	
	boomerang.traverse(function (child) {
								if (child instanceof THREE.Mesh) 
                                {
                                if ((child.masse!=undefined)&&(child.centerOfMass!=null))
									{
									var vecGP= new THREE.Vector3();
									vecGP.subVectors(child.centerOfMass,centerOfMass);
									
									////Console.log("vecGP");
									////Console.log(vecGP);
									var Ilocal= new THREE.Matrix3();
									Ilocal.set(vecGP.y*vecGP.y+vecGP.z*vecGP.z, -vecGP.x*vecGP.y, -vecGP.z*vecGP.x,
												-vecGP.x*vecGP.y, vecGP.x*vecGP.x+vecGP.z*vecGP.z, -vecGP.z*vecGP.y,
												-vecGP.x*vecGP.z, -vecGP.y*vecGP.z, vecGP.y*vecGP.y+vecGP.x*vecGP.x);
									Ilocal.multiplyScalar(child.masse);
									I.add(Ilocal);
									}
                                }
                            });
	////Console.log("I:");
	////Console.log(I);
	return I
}


function createArrow(material, VecPos, Vec, radiusArrow) {
	
	var length=Vec.length();
	var lengthSpear = 6*radiusArrow;

	var cylinder =new THREE.CylinderGeometry(radiusArrow, radiusArrow, length-lengthSpear, 32);
	var spear =new THREE.CylinderGeometry(0, lengthSpear/3., lengthSpear, 32);

	var  cylinderMesh= new THREE.Mesh( cylinder, material );
	var  spearMesh= new THREE.Mesh( spear, material );
	cylinderMesh.name="cylinder";
	spearMesh.name="spear";

	//cylinderMesh.visible=false;
	//spearMesh.visible=false;
	
	cylinderMesh.position.set(0,(length-lengthSpear)/2.,0);
	spearMesh.position.set(0,length-lengthSpear/2,0);	
	
	var arrow= new THREE.Object3D();
	arrow.add(cylinderMesh);
	arrow.add(spearMesh);
	arrow.length=length;
	arrow.lengthSpear=lengthSpear;
	
	arrow.matrixAutoUpdate = false;
	
	UpdateArrow(arrow, VecPos, Vec)
	
	return arrow;
}

function UpdateArrow(arrow, VecPos, Vec)
{
// Alongement de la fleche

var newLength=Vec.length();
var oldLength=arrow.length;
var lengthSpear=arrow.lengthSpear;

var TransformMatrix = new THREE.Matrix4();
TransformMatrix.set(	1,	0,	0,	0,
						0,	(newLength-lengthSpear)/(oldLength-lengthSpear),	0,	0,
						0,	0,	1,	0,
						0,	0,	0,	1);

arrow.length=newLength;

var cylinderMesh;
var spearMesh;
				
arrow.traverse(function (child) {
							if ((child instanceof THREE.Mesh)&&(child.name!=undefined))
                            {
								if (child.name=="cylinder") {cylinderMesh=child;};
								if (child.name=="spear") {spearMesh=child;};								
                            }								
                        });

						
cylinderMesh.geometry.applyMatrix(TransformMatrix);
cylinderMesh.geometry.verticesNeedUpdate = true;
cylinderMesh.position.set(0,(newLength-lengthSpear)/2.,0);
spearMesh.position.set(0,newLength-lengthSpear/2.,0);

//Nouvelle position et orientation de la fleche	
	
var ey=Vec.clone().normalize();
var ex= new THREE.Vector3(1,0,0);
var ez=(new THREE.Vector3()).crossVectors(ex,ey)
	
if (ez.length()<0.01)
{
	ex.set(0,1,0);
	ez.crossVectors(ex,ey);
} 

ez.normalize();
ex.crossVectors(ey,ez);
	
arrow.matrix.set(	ex.x,	ey.x,  	ez.x,	VecPos.x,
					ex.y,	ey.y,  	ez.y,	VecPos.y,
					ex.z,	ey.z,  	ez.z,	VecPos.z,
					0,		0,		0,		1);

}


function SetArrowsVisible(IsVisible){

if (IsVisible==undefined) {IsVisible==true;}

	var boomerang= scene.getObjectByName("boomerang");

	boomerang.traverse(function (childEl) {
						if (childEl instanceof THREE.Mesh) 
						{
						if (childEl.arrow!==undefined)
							{
							SetArrowVisible(childEl.arrow,IsVisible);

							}
						}
	});					
}

function SetArrowVisible(Arrow,IsVisible){
	if (IsVisible==undefined) {IsVisible==true;}
	
	var cylinderMesh;
	var spearMesh;
					
	Arrow.traverse(function (child) {
								if ((child instanceof THREE.Mesh)&&(child.name!=undefined))
								{
									if (child.name=="cylinder") {cylinderMesh=child;};
									if (child.name=="spear") {spearMesh=child;};								
								}								
							});
								
	cylinderMesh.visible=IsVisible;
	spearMesh.visible=IsVisible;	

}



function UpdateBoomerangInitialConditions(){

	var boomerangObject = scene.getObjectByName("boomerang");
	if (boomerangObject.exactName != effectController.NewBoomerangName)
	{
		scene.remove(scene.getObjectByName("boomerang"));
		var material = new THREE.MeshLambertMaterial( { color: 0xff6000, wireframe: false} );
			//Load a boomerang from file
		xmlDoc= new readFile("boomerang/" + effectController.NewBoomerangName + ".xml");
		//Create boomerang
		var boomerangObject= new CreateBoomerang( material, xmlDoc);
		boomerangObject.name="boomerang";
		boomerangObject.exactName= effectController.NewBoomerangName;
		scene.add(boomerangObject);
	}

	var AngleHor=effectController.NewAngleHor;
	var AngleVer=effectController.NewAngleVer;

	var RotMatrixHor = new THREE.Matrix4();	
	var RotMatrixVer = new THREE.Matrix4();	

	RotMatrixVer.set(	1,	0,	0,	0,
						0,	Math.cos(AngleVer*Math.PI/180),	-Math.sin(AngleVer*Math.PI/180),	0,
						0,	Math.sin(AngleVer*Math.PI/180),	Math.cos(AngleVer*Math.PI/180),		0,
						0,	0,	0,	1);
							
	RotMatrixHor.set(	Math.cos(AngleHor*Math.PI/180),	-Math.sin(AngleHor*Math.PI/180),	0,	positionInitialeBoomerang.x,
						Math.sin(AngleHor*Math.PI/180),	Math.cos(AngleHor*Math.PI/180),		0,	positionInitialeBoomerang.y,
						0,	0,	1,	positionInitialeBoomerang.z,
						0,	0,	0,	1);
	
	boomerangObject.matrix.copy(RotMatrixHor);
	boomerangObject.matrix.multiply(RotMatrixVer);
	
	var RotationSpeed=effectController.NewRotationSpeed*2*Math.PI;
	var Velocity=effectController.NewVelocity;
	
	boomerangObject.Velocity= new THREE.Vector3(Velocity*Math.cos(AngleHor*Math.PI/180),Velocity*Math.sin(AngleHor*Math.PI/180),0);
	boomerangObject.RotationVector= new THREE.Vector3(0,0,-RotationSpeed);
	
	var vecZero= new THREE.Vector3(0,0,0);
	UpdateArrow(boomerangObject.VelocityArrow, vecZero , new THREE.Vector3(Velocity/30.,0,0));
	UpdateArrow(boomerangObject.RotationSpeedArrow, vecZero, boomerangObject.RotationVector.clone().multiplyScalar(.006));
	SetArrowVisible(boomerangObject.VelocityArrow,effectController.NewInitialConditionArrows);
	SetArrowVisible(boomerangObject.RotationSpeedArrow,effectController.NewInitialConditionArrows);
	
	// We hide the aerodynamic forces at the initial state
	SetArrowsVisible(false);
}
