
function TimeIntegration(boomerang, NbPasDeTemps, dt)
{
	var ParamsRK4=[0,0.5,0.5,1];
    var Params2RK4=[1./6.,2./6.,2./6.,1./6.];
	var Xstore=[[]];
//TimeIntegration RK4
////Console.log("C est le debut ICI")
	var X= new THREE.Vector3(0,0,0);
	var Q= new THREE.Matrix3();
	Q.set(0,0,0,0,0,0,0,0,0);
	var V= new THREE.Vector3();
	var W= new THREE.Vector3();
	var Ws= new THREE.Vector3();


    for(var i=0; i<NbPasDeTemps; i++)
	{
// Initialisation des variables d'etat a integrer au debut du pas de temps

		X.getTranslationFromMatrix4(boomerang.matrix);
		////Console.log(X);
		Q.getRotationFromMatrix4(boomerang.matrix);
		////Console.log(Q);
		V.copy(boomerang.Velocity);
		////Console.log(V);
		Ws.copy(boomerang.RotationVector);
		////Console.log(W);
		//Ws.copy(W);
		//Ws.applyMatrix3(Q.clone().transpose()); //Vecteur rotation dans le référentiel du solide
		
		////Console.log("QQt:")
		////Console.log(((new THREE.Vector3(1,0,0)).applyMatrix3(Q.clone().transpose())).applyMatrix3(Q));
		////Console.log(((new THREE.Vector3(0,1,0)).applyMatrix3(Q.clone().transpose())).applyMatrix3(Q));
		////Console.log(((new THREE.Vector3(0,0,1)).applyMatrix3(Q.clone().transpose())).applyMatrix3(Q));

		////Console.log("InvI.I");
		////Console.log(((new THREE.Vector3(1,0,0)).applyMatrix3(boomerang.InertieMat)).applyMatrix3(boomerang.InvInertieMat));
		////Console.log(((new THREE.Vector3(0,1,0)).applyMatrix3(boomerang.InertieMat)).applyMatrix3(boomerang.InvInertieMat));		
		////Console.log(((new THREE.Vector3(0,0,1)).applyMatrix3(boomerang.InertieMat)).applyMatrix3(boomerang.InvInertieMat));		
		
		// Initialisation a zero des parametres RK4
		
		var KV=new THREE.Vector3();
		var KX=new THREE.Vector3();
		var KWs=new THREE.Vector3();
		var KQ=new THREE.Matrix3();
		KQ.set(0,0,0,0,0,0,0,0,0);

		var KV_tot=new THREE.Vector3();
		var KX_tot=new THREE.Vector3();
		var KWs_tot=new THREE.Vector3();
		var KQ_tot=new THREE.Matrix3();
		KQ_tot.set(0,0,0,0,0,0,0,0,0);

		
// Calcul des parametres RK4 dans une boucle		
		for(var p=0;p<4;p++)
		{

	// Compute argument of the derivative evaluation (ex: kv_p=f(v_tmp))		
			V_tmp=V.clone().add(KV.multiplyScalar(ParamsRK4[p]*dt));
			Ws_tmp=Ws.clone().add(KWs.multiplyScalar(ParamsRK4[p]*dt));
			X_tmp=X.clone().add(KX.multiplyScalar(ParamsRK4[p]*dt));
			Q_tmp=Q.clone().add(KQ.multiplyScalar(ParamsRK4[p]*dt));
			
			////Console.log(Q_tmp);
			////Console.log(V_tmp);
			
	// Compute the function (derivative) from the previously computed arguments
	// Compute of k parameters
			
			//Compute the k-contribution of moment and force
			var Mtot_s= new THREE.Vector3();
			var Ftot_s= new THREE.Vector3();
			CalculMomentForceAero(Mtot_s, Ftot_s, V_tmp, Ws_tmp, Q_tmp, boomerang);
			////Console.log("###########################");
			////Console.log(Ftot_s);
			////Console.log(Mtot_s);

			//Compute K values from the dynamic of motion
			Vec_CrossProd= new THREE.Vector3();
			Vec_CrossProd.crossVectors(Ws_tmp, Ws_tmp.clone().applyMatrix3(boomerang.InertieMat));
			KWs.copy(((Vec_CrossProd.clone().negate()).add(Mtot_s)).applyMatrix3(boomerang.InvInertieMat));
			//Console.log(KWs)
            
			KV.copy(((Ftot_s.applyMatrix3(Q_tmp)).divideScalar(boomerang.masse)).add(new THREE.Vector3(0,-9.81,0)));
         
		 
			////Console.log("Kv");
			////Console.log(KV);
            
			KQ.elements[0+0*3]=Ws_tmp.z*Q_tmp.elements[0+1*3]-Ws_tmp.y*Q_tmp.elements[0+2*3];
            KQ.elements[0+1*3]=-Ws_tmp.z*Q_tmp.elements[0+0*3]+Ws_tmp.x*Q_tmp.elements[0+2*3];
            KQ.elements[0+2*3]=Ws_tmp.y*Q_tmp.elements[0+0*3]-Ws_tmp.x*Q_tmp.elements[0+1*3];
            KQ.elements[1+0*3]=Ws_tmp.z*Q_tmp.elements[1+1*3]-Ws_tmp.y*Q_tmp.elements[1+2*3];
            KQ.elements[1+1*3]=-Ws_tmp.z*Q_tmp.elements[1+0*3]+Ws_tmp.x*Q_tmp.elements[1+2*3];
            KQ.elements[1+2*3]=Ws_tmp.y*Q_tmp.elements[1+0*3]-Ws_tmp.x*Q_tmp.elements[1+1*3];
            KQ.elements[2+0*3]=Ws_tmp.z*Q_tmp.elements[2+1*3]-Ws_tmp.y*Q_tmp.elements[2+2*3];
            KQ.elements[2+1*3]=-Ws_tmp.z*Q_tmp.elements[2+0*3]+Ws_tmp.x*Q_tmp.elements[2+2*3];
            KQ.elements[2+2*3]=Ws_tmp.y*Q_tmp.elements[2+0*3]-Ws_tmp.x*Q_tmp.elements[2+1*3];
            
            KX.copy(V_tmp);
            
			
            KWs_tot.add(KWs.clone().multiplyScalar(Params2RK4[p]));
            KV_tot.add(KV.clone().multiplyScalar(Params2RK4[p]));
            KQ_tot.add(KQ.clone().multiplyScalar(Params2RK4[p]));
            KX_tot.add(KX.clone().multiplyScalar(Params2RK4[p]));
		}


        Ws.add(KWs_tot.multiplyScalar(dt));
        V.add(KV_tot.multiplyScalar(dt));
		////Console.log("KV_tot");
		////Console.log(KV_tot);
		////Console.log("Ws");
		////Console.log(Ws);	
		
		
		Q.add(KQ_tot.multiplyScalar(dt));
		Q.normalize();
		
		X.add(KX_tot.multiplyScalar(dt));
		////Console.log(X);
        
		boomerang.matrix.CreateMatrix4FromTranslationAndRotation(X,Q);
		//boomerang.RotationVector.copy(Ws.clone().applyMatrix3(Q))
		boomerang.RotationVector.copy(Ws);
		
		boomerang.Velocity.copy(V);
        
        Xstore[i]=X;
		
	}
	////Console.log(X);
}

function CalculMomentForceAero(Mtot_s, Ftot_s, V, Ws, Q, boomerang)
{
Mtot_s.set(0,0,0);
Ftot_s.set(0,0,0);
    
var Vs= V.clone().applyMatrix3(Q.clone().transpose());
	
Omega= new THREE.Matrix3();
Omega.set(	0,		-Ws.z, 	Ws.y,
			Ws.z,	0, 		-Ws.x,
			-Ws.y, 	Ws.x,  	0);
       

var rho=1.184;


boomerang.traverse(function (child) {
							if (child instanceof THREE.Mesh) 
							{
							if ((child.masse!=undefined)&&(child.centerOfMass!=undefined))
								{
									var vitesseFluideElement=((child.centerOfMass.clone()).applyMatrix3(Omega).add(Vs)).multiplyScalar(-1); 
									// Le signe - prend en compte le fait que l'on regarde la vitesse du fluide dans le referentiel du solide et non l'inverse
									
									vitesseFluideElement.projectOnPlane(((new THREE.Vector3()).crossVectors(child.VecCorde,child.VecEpaisseur)).normalize());
									////Console.log("vEl");
									////Console.log(vitesseElement);
									
									var angle=vitesseFluideElement.angleTo(child.VecCorde.clone().multiplyScalar(-1));
									if ((vitesseFluideElement.dot(child.VecEpaisseur))<0) {angle=-angle};					
									var angleIndex= ReturnAngleIndex(boomerang.Polar[child.polarName],angle)
									Cl=boomerang.Polar[child.polarName][angleIndex][1];
									Cd=boomerang.Polar[child.polarName][angleIndex][2];
									Cd=Cd+0.055;
									//Cl=1;
									//Cd=0.5;
									
									var ForceElementDrag=vitesseFluideElement.clone().multiplyScalar(Cd);
									var ForceElementLift=vitesseFluideElement.clone().cross(((new THREE.Vector3()).crossVectors(child.VecCorde,child.VecEpaisseur)).normalize()).multiplyScalar(Cl);

									////Console.log("Fl");
									////Console.log(ForceElementLift);
									////Console.log("Fd");
									////Console.log(ForceElementDrag);
									var ForceElement=(new THREE.Vector3()).addVectors(ForceElementDrag,ForceElementLift);
									//var ForceElement=ForceElementDrag.clone();
									
									ForceElement.multiplyScalar(0.5*rho*(child.Surface)*(vitesseFluideElement.length()));
									UpdateArrow(child.arrow, child.position, ForceElement.clone().multiplyScalar(1));
									
									var MomentElement= (new THREE.Vector3()).addVectors(child.centerOfMass,(child.VecCorde).clone().multiplyScalar(0.25)).cross(ForceElement);
									
									Ftot_s.add(ForceElement);
									Mtot_s.add(MomentElement);
								}
							}
						});
////Console.log("Ftot_s");
////Console.log(Ftot_s);									
////Console.log("Mtot_s");
////Console.log(Mtot_s);					

}

function ReturnAngleIndex(polar,angle){

var i=0;
var angleDeg= angle*180/Math.PI;

while (angleDeg<polar[0][0]) {angleDeg+=360;}
while (angleDeg>polar[polar.length-1][0]) {angleDeg-=360;}

for (i = 0; polar[i][0] < angleDeg; i++) {}

return i;
// On obtient Cl et Cd par:
//var angleIndex= ReturnAngleIndex(boomerang.Polar,angle)
//Cl=boomerang.Polar[angleIndex][1];
//Cd=boomerang.Polar[angleIndex][2];
}

function RotateInPlace(angleRot) 
{
		
var RotMatrix = new THREE.Matrix4();	

RotMatrix.set(	Math.cos(angleRot*Math.PI/180),	-Math.sin(angleRot*Math.PI/180),	0,	0,
						Math.sin(angleRot*Math.PI/180),	Math.cos(angleRot*Math.PI/180),		0,	0,
						0,	0,	1,	0,
						0,	0,	0,	1);
							
var boomerangObject = scene.getObjectByName("boomerang");

var tmp= new THREE.Matrix4();

//tmp.copy(boomerangObject.matrix);
boomerangObject.matrix.multiply(RotMatrix);
//boomerangObject.matrix.multiply(tmp);

}

